import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { uploadEvidence } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request): Promise<Response> {
  const { grep, docMode } = await req.json().catch(() => ({}));
  const projectRoot = process.cwd();
  const resultsDir = path.join(projectRoot, 'test-results');

  // Create a TransformStream for streaming the output
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Helper to send logs to client
  const sendLog = async (type: 'log' | 'error' | 'done', data: any) => {
    const payload = JSON.stringify({ type, data }) + "\n";
    await writer.write(encoder.encode(payload));
  };

  // 1. Preparation
  if (fs.existsSync(resultsDir)) {
    try {
      const files = fs.readdirSync(resultsDir);
      for (const file of files) {
        const filePath = path.join(resultsDir, file);
        if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
        else fs.rmSync(filePath, { recursive: true, force: true });
      }
      await sendLog('log', '🧹 Cleaned old test results and media');
    } catch (e) {
      console.error('Failed to clean resultsDir:', e);
    }
  } else {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // 2. Start Playwright
  const args = grep 
    ? ['playwright', 'test', '--grep', grep, '--reporter=list'] 
    : ['playwright', 'test', '--reporter=list'];
    
  const playwright = spawn('npx', args, {
    cwd: projectRoot,
    shell: true,
    env: { ...process.env, DOC_MODE: docMode ? 'true' : 'false' }
  });

  await sendLog('log', `🚀 Executing: npx playwright test ${grep ? `--grep "${grep}"` : ""} [DOC_MODE: ${!!docMode}]`);

  // Handle stdout
  playwright.stdout.on('data', async (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`[Playwright] ${line.trim()}`); // Log to backend terminal
        await sendLog('log', line);
      }
    }
  });

  // Handle stderr
  playwright.stderr.on('data', async (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.error(`[Playwright ERROR] ${line.trim()}`); // Log to backend terminal
        await sendLog('error', line);
      }
    }
  });

  // Handle completion
  playwright.on('close', async (code) => {
    await sendLog('log', `\n🏁 Playwright finished with code ${code}`);
    
    // --- Post-Processing & Supabase Sync ---
    const resultsPath = path.join(resultsDir, 'results.json');
    try {
      if (fs.existsSync(resultsPath)) {
        await sendLog('log', '📊 Syncing results to database...');
        const resultsRaw = fs.readFileSync(resultsPath, 'utf8');
        const results = JSON.parse(resultsRaw);
        const mediaFiles = scanMediaFiles(resultsDir);
        const testRuns: any[] = [];

        // Helper to find tests
        const findTests = async (suites: any[]) => {
          if (!suites) return;
          for (const suite of suites) {
            if (suite.specs) {
              for (const spec of suite.specs) {
                for (const test of spec.tests) {
                  const lastResult = test.results[test.results.length - 1];
                  if (!lastResult) continue;

                  const batchId = `run-${Date.now()}`;
                  let screenshotPath = null;
                  let videoPath = null;

                  const ss = lastResult.attachments?.find((a: any) => a.name === 'screenshot');
                  if (ss?.path) screenshotPath = await uploadEvidence(ss.path, batchId);
                  
                  const vid = lastResult.attachments?.find((a: any) => a.name === 'video');
                  if (vid?.path) videoPath = await uploadEvidence(vid.path, batchId);

                  let testCaseId = 'UNKNOWN';
                  if (spec.title.includes(':')) testCaseId = spec.title.split(':')[0].trim();
                  else if (suite.file?.match(/hp-\d+/i)) testCaseId = suite.file.match(/hp-\d+/i)![0].toUpperCase();

                  testRuns.push({
                    test_case_id: testCaseId,
                    title: spec.title,
                    status: lastResult.status,
                    duration_ms: lastResult.duration,
                    error_message: lastResult.error?.message || null,
                    screenshot_path: screenshotPath,
                    video_path: videoPath,
                    executed_by: 'Garis Rayya Rabbani',
                    created_at: new Date().toISOString()
                  });
                  
                  await sendLog('log', `✅ Processed ${testCaseId}: ${lastResult.status}`);
                }
              }
            }
            if (suite.suites) await findTests(suite.suites);
          }
        };

        await findTests(results.suites);

        if (testRuns.length > 0) {
          const { error: insertError } = await supabase.from('test_runs').insert(testRuns);
          if (!insertError) {
             await sendLog('log', `✨ Successfully synced ${testRuns.length} runs to Supabase.`);
             
             // Auto-bug report
             const failedTests = testRuns.filter(run => run.status === 'failed' || run.status === 'timedOut');
             if (failedTests.length > 0) {
                const bugEntries = failedTests.map(f => ({
                  test_code: f.test_case_id,
                  title: `[Auto-Bug] ${f.title} Failed`,
                  description: `Automation failure detected.\nError: ${f.error_message || 'N/A'}`,
                  severity: f.test_case_id?.startsWith('HP') ? 'High' : 'Medium',
                  status: 'Open',
                  screenshot_url: f.screenshot_path,
                  reported_by: 'Garis Rayya Rabbani'
                }));
                await supabase.from('bugs').insert(bugEntries);
                await sendLog('log', `🐛 Auto-reported ${bugEntries.length} bugs.`);
             }
          }
        }
      }
    } catch (e: any) {
      await sendLog('error', `Sync failed: ${e.message}`);
    }

    await sendLog('done', { status: code === 0 ? 'success' : 'failed' });
    await writer.close();
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function scanMediaFiles(dir: string) {
  const videos: string[] = [];
  const screenshots: string[] = [];
  const dirs: string[] = [];
  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) { dirs.push(entry.name); walk(fullPath); }
      else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.webm', '.mp4'].includes(ext)) videos.push(fullPath);
        else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) screenshots.push(fullPath);
      }
    }
  }
  walk(dir);
  return { videos, screenshots, dirs };
}

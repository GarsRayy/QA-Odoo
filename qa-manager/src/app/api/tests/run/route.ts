import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { uploadEvidence } from '@/lib/storage';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const { grep, docMode } = await req.json().catch(() => ({}));
  
  return new Promise((resolve) => {
    const projectRoot = process.cwd();
    const resultsDir = path.join(projectRoot, 'test-results');
    
    // Clear old results and media before starting a new run to ensure sync
    if (fs.existsSync(resultsDir)) {
      try {
        const files = fs.readdirSync(resultsDir);
        for (const file of files) {
          const filePath = path.join(resultsDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
          } else {
            // It's a directory (video/screenshot folders)
            fs.rmSync(filePath, { recursive: true, force: true });
          }
        }
        console.log('🧹 Cleaned old test results and media');
      } catch (e) {
        console.error('Failed to clean resultsDir:', e);
      }
    } else {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const command = grep ? `npx playwright test --grep "${grep}"` : `npx playwright test`;
    const resultsPath = path.join(resultsDir, 'results.json');

    console.log(`Executing: ${command} [DOC_MODE: ${!!docMode}]`);

    exec(command, { 
      cwd: projectRoot, 
      timeout: 900000,
      env: { ...process.env, DOC_MODE: docMode ? 'true' : 'false' } 
    }, async (error, stdout, stderr) => {
      const output = stdout + "\n" + stderr;
      
      // Extract //NOTES and //To Do from the test file to help developers
      let developerNotes = "";
      if (grep) {
        try {
          const testFiles = fs.readdirSync(path.join(projectRoot, 'tests'));
          const matchedFile = testFiles.find(f => f.toLowerCase().includes(grep.toLowerCase()));
          
          if (matchedFile) {
            const content = fs.readFileSync(path.join(projectRoot, 'tests', matchedFile), 'utf8');
            const lines = content.split('\n');
            const notes = lines.filter(l => l.trim().startsWith('//NOTES') || l.trim().startsWith('//To Do'));
            developerNotes = notes.map(n => n.trim().replace(/^\/\/\s*/, '')).join(' | ');
          }
        } catch (err) {
          console.error("Failed to extract notes:", err);
        }
      }
      
      try {
        // Read the JSON results file
        if (fs.existsSync(resultsPath)) {
          const resultsRaw = fs.readFileSync(resultsPath, 'utf8');
          const results = JSON.parse(resultsRaw);
          
          // Scan test-results directory for all media files
          const mediaFiles = scanMediaFiles(resultsDir);
          console.log(`📁 Found ${mediaFiles.videos.length} videos, ${mediaFiles.screenshots.length} screenshots`);

          const testRuns: any[] = [];

          // Recursive function to find all tests in nested suites
          const findTestsRecursively = async (suites: any[]) => {
            if (!suites) return;
            for (const suite of suites) {
              if (suite.specs) {
                for (const spec of suite.specs) {
                  for (const test of spec.tests) {
                    const lastResult = test.results[test.results.length - 1];
                    if (!lastResult) continue;

                    let screenshotAttachment = lastResult.attachments?.find((a: any) => a.name === 'screenshot');
                    let videoAttachment = lastResult.attachments?.find((a: any) => a.name === 'video');

                    let screenshotPath = null;
                    let videoPath = null;
                    const batchId = `run-${Date.now()}`;

                    // Upload Screenshot if exists
                    if (screenshotAttachment && screenshotAttachment.path) {
                      screenshotPath = await uploadEvidence(screenshotAttachment.path, batchId);
                    }

                    // Upload Video if exists
                    if (videoAttachment && videoAttachment.path) {
                      videoPath = await uploadEvidence(videoAttachment.path, batchId);
                    }

                    // Fallback scan if attachments are missing but files exist in dir
                    if (!screenshotPath || !videoPath) {
                      const specFile = suite.file?.replace('.spec.ts', '').replace('.test.ts', '') || '';
                      for (const dir of mediaFiles.dirs) {
                        if (specFile && dir.toLowerCase().includes(specFile.toLowerCase())) {
                          if (!videoPath) {
                            const vid = mediaFiles.videos.find(v => v.includes(dir));
                            if (vid) videoPath = await uploadEvidence(vid, batchId);
                          }
                          if (!screenshotPath) {
                            const ss = mediaFiles.screenshots.find(s => s.includes(dir));
                            if (ss) screenshotPath = await uploadEvidence(ss, batchId);
                          }
                        }
                      }
                    }

                    let testCaseId = 'UNKNOWN';
                    if (spec.title.includes(':')) {
                      testCaseId = spec.title.split(':')[0].trim();
                    } else if (suite.file?.match(/hp-\d+/i)) {
                      testCaseId = suite.file.match(/hp-\d+/i)![0].toUpperCase();
                    } else {
                      testCaseId = spec.title.replace(/\s+/g, '-').toUpperCase().substring(0, 30);
                    }

                    testRuns.push({
                      test_case_id: testCaseId,
                      title: spec.title,
                      status: lastResult.status,
                      duration_ms: lastResult.duration,
                      error_message: lastResult.error?.message 
                        ? `${lastResult.error.message}${developerNotes ? `\n\nNOTES: ${developerNotes}` : ""}`
                        : (developerNotes ? `NOTES: ${developerNotes}` : null),
                      screenshot_path: screenshotPath,
                      video_path: videoPath,
                      executed_by: 'Garis Rayya Rabbani',
                      created_at: new Date().toISOString()
                    });
                  }
                }
              }
              if (suite.suites) findTestsRecursively(suite.suites);
            }
          }

          await findTestsRecursively(results.suites);

          // Bulk insert into Supabase with error checking
          if (testRuns.length > 0) {
            const { data, error: insertError } = await supabase.from('test_runs').insert(testRuns);
            if (insertError) {
              console.error('❌ Supabase insert error:', insertError.message);
            } else {
              console.log(`✅ Synced ${testRuns.length} test results to Supabase`);
              
              // Automatically create bug reports for failed or timed out tests
              const failedTests = testRuns.filter(run => run.status === 'failed' || run.status === 'timedOut');
              if (failedTests.length > 0) {
                const bugEntries = failedTests.map(failed => ({
                  test_code: failed.test_case_id,
                  title: `[Auto-Bug] ${failed.title} ${failed.status === 'timedOut' ? 'Timed Out' : 'Failed'}`,
                  description: `Automation failure detected during execution (${failed.status}).\n\nError: ${failed.error_message || 'No specific error message (Timeout)'}`,
                  severity: failed.test_case_id?.startsWith('HP') ? 'High' : 'Medium',
                  status: 'Open',
                  screenshot_url: failed.screenshot_path,
                  reported_by: 'Garis Rayya Rabbani'
                }));
                
                const { error: bugError } = await supabase.from('bugs').insert(bugEntries);
                if (bugError) {
                  console.error('❌ Failed to auto-report bug to Supabase:', bugError.message);
                } else {
                  console.log(`🐛 Automatically reported ${bugEntries.length} new bug(s) to Supabase`);
                }
              }
            }
          }
        } else {
          console.error('❌ results.json not found at:', resultsPath);
        }
      } catch (syncError) {
        console.error('Failed to sync results to Supabase:', syncError);
      }

      resolve(NextResponse.json({ 
        status: error ? 'error' : 'success', 
        output: output 
      }));
    });
  });
}

// Scan test-results directory for video and screenshot files
function scanMediaFiles(dir: string) {
  const videos: string[] = [];
  const screenshots: string[] = [];
  const dirs: string[] = [];

  function walk(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        dirs.push(entry.name);
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.webm', '.mp4'].includes(ext)) {
          videos.push(fullPath);
        } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
          screenshots.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return { videos, screenshots, dirs };
}

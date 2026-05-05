import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  const projectRoot = process.cwd();
  const testResultsDir = path.join(projectRoot, 'test-results');
  
  // First try direct path
  let filePath = path.join(testResultsDir, filename);
  
  // If not found directly, search recursively in subdirectories
  if (!fs.existsSync(filePath)) {
    filePath = findFile(testResultsDir, filename) || '';
  }

  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found', searched: testResultsDir }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// Recursively search for a file by name
function findFile(dir: string, filename: string): string | null {
  if (!fs.existsSync(dir)) return null;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === filename) {
      return fullPath;
    }
    if (entry.isDirectory()) {
      const found = findFile(fullPath, filename);
      if (found) return found;
    }
  }
  
  return null;
}

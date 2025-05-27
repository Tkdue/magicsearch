import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { folderPath } = await request.json();

    if (!folderPath) {
      return NextResponse.json({ error: 'Folder path is required' }, { status: 400 });
    }

    // Gestisci percorsi assoluti e relativi
    let absolutePath: string;
    if (path.isAbsolute(folderPath)) {
      absolutePath = folderPath;
    } else {
      absolutePath = path.join(process.cwd(), folderPath);
    }

    // Verifica che la cartella esista
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ 
        error: 'Folder does not exist', 
        path: absolutePath 
      }, { status: 404 });
    }

    // Apri la cartella nel Finder (macOS)
    if (process.platform === 'darwin') {
      await execAsync(`open "${absolutePath}"`);
      return NextResponse.json({ 
        success: true, 
        message: 'Folder opened in Finder',
        path: absolutePath
      });
    } 
    // Windows
    else if (process.platform === 'win32') {
      await execAsync(`start "" "${absolutePath}"`);
      return NextResponse.json({ 
        success: true, 
        message: 'Folder opened in Explorer',
        path: absolutePath
      });
    }
    // Linux
    else {
      await execAsync(`xdg-open "${absolutePath}"`);
      return NextResponse.json({ 
        success: true, 
        message: 'Folder opened',
        path: absolutePath
      });
    }

  } catch (error) {
    console.error('Open folder error:', error);
    return NextResponse.json({ 
      error: 'Failed to open folder', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
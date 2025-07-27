import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { google } from 'googleapis';

const GDRIVE_FOLDER_ID = '14qaRq7oTpdo4i6wIci_HAiv8ZL0Xd6UO';
const IMPERSONATE_USER = 'andrea.livio@tk2.it';

interface UploadBatchRequest {
  tema: string;
  images: Array<{
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    source: string;
  }>;
  timestamp: number;
}

async function createGoogleDriveClient() {
  try {
    let credentials;
    
    // Try environment variable first (for production)
    if (process.env.GOOGLE_CREDENTIALS) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
      throw new Error('Google credentials not found. Set GOOGLE_CREDENTIALS environment variable.');
    }
    
    const jwtClient = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive'],
      IMPERSONATE_USER
    );

    await jwtClient.authorize();
    return google.drive({ version: 'v3', auth: jwtClient });
  } catch (error) {
    console.error('❌ GDrive client creation failed:', error);
    throw error;
  }
}

async function createGoogleDriveFolder(drive: any, folderName: string, parentId: string) {
  try {
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const response = await drive.files.create({
      resource: folderMetadata,
      fields: 'id,name,webViewLink'
    });

    console.log(`✅ Folder "${folderName}" created with ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Folder creation failed:', error);
    throw error;
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`❌ Download failed for ${url}:`, error);
    throw error;
  }
}

async function uploadToGoogleDrive(drive: any, imageBuffer: Buffer, fileName: string, folderId: string) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: 'image/jpeg',
      body: imageBuffer
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });

    console.log(`✅ File "${fileName}" uploaded with ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Upload failed for ${fileName}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tema, images, timestamp }: UploadBatchRequest = await request.json();

    if (!tema || !images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: 'Invalid request: tema and images array are required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting GDrive batch upload for "${tema}" - ${images.length} images`);

    // Step 1: Create GDrive client
    const drive = await createGoogleDriveClient();

    // Step 2: Create subfolder
    const folderName = `${tema.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(timestamp).toISOString().split('T')[0]}_${timestamp}`;
    const folder = await createGoogleDriveFolder(drive, folderName, GDRIVE_FOLDER_ID);

    // Step 3: Upload images in parallel (with concurrency limit)
    const uploadResults = [];
    const uploadPromises = [];
    const CONCURRENT_UPLOADS = 3; // Limite per evitare rate limiting

    for (let i = 0; i < images.length; i += CONCURRENT_UPLOADS) {
      const batch = images.slice(i, i + CONCURRENT_UPLOADS);
      
      const batchPromises = batch.map(async (image, batchIndex) => {
        try {
          const actualIndex = i + batchIndex;
          const fileName = `${actualIndex + 1}_${image.source}_${image.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.jpg`;
          
          console.log(`📥 Downloading image ${actualIndex + 1}/${images.length}: ${image.url}`);
          const imageBuffer = await downloadImage(image.url);
          
          console.log(`☁️ Uploading to GDrive: ${fileName}`);
          const uploadResult = await uploadToGoogleDrive(drive, imageBuffer, fileName, folder.id);
          
          return {
            success: true,
            originalImage: image,
            uploadedFile: uploadResult,
            fileName: fileName
          };
        } catch (error) {
          console.error(`❌ Failed to process image ${image.id}:`, error);
          return {
            success: false,
            originalImage: image,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      uploadResults.push(...batchResults);
      
      // Small delay between batches
      if (i + CONCURRENT_UPLOADS < images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    console.log(`✅ Batch upload completed: ${successfulUploads.length}/${images.length} successful`);

    return NextResponse.json({
      success: true,
      tema: tema,
      folder: {
        id: folder.id,
        name: folder.name,
        link: folder.webViewLink
      },
      results: {
        total: images.length,
        successful: successfulUploads.length,
        failed: failedUploads.length,
        uploads: uploadResults
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GDrive batch upload error:', error);
    return NextResponse.json(
      { 
        error: 'GDrive upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
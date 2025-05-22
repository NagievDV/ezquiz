import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const { file } = await request.json();

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const uploadOptions: UploadApiOptions = {
      folder: 'ezquiz',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      transformation: [
        { width: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      eager: [
        { width: 400, crop: 'scale', quality: 'auto:good' },
        { width: 800, crop: 'scale', quality: 'auto:good' }
      ],
      eager_async: true
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      eager: result.eager
    }, { headers });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 
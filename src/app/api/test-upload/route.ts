import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Тестовое изображение для проверки загрузки
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80';

export async function GET() {
  try {
    // Конфигурируем Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    // Загружаем тестовое изображение
    const result = await cloudinary.uploader.upload(TEST_IMAGE_URL, {
      folder: 'ezquiz/test',
      public_id: 'test-image-' + Date.now(),
    });

    return NextResponse.json({
      message: 'Изображение успешно загружено',
      url: result.secure_url,
      details: {
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      }
    });

  } catch (error) {
    console.error('Error uploading test image:', error);
    return NextResponse.json(
      { error: 'Failed to upload test image' },
      { status: 500 }
    );
  }
} 
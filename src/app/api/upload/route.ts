import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Загружаем изображение в Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'ezquiz', // Папка в Cloudinary
      transformation: [
        { width: 1200, crop: 'limit' }, // Ограничиваем максимальную ширину
        { quality: 'auto' }, // Автоматическая оптимизация качества
        { fetch_format: 'auto' }, // Автоматический выбор формата
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 
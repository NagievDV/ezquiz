import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'Не предоставлен public ID' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({ message: 'Изображение удалено успешно' });
    } else {
      return NextResponse.json(
        { error: 'Не удалось удалить изображение' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
    return NextResponse.json(
      { error: 'Не удалось удалить файл' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();

    // Проверяем, что filename не пустой и не содержит подозрительных символов
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Путь к файлу в uploads директории
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    // Удаляем файл
    await unlink(filepath);

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 
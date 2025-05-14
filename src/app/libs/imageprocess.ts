import { unlink } from 'fs/promises';
import { join } from 'path';

// Утилита для работы с изображениями
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteImage(filename: string): Promise<void> {
  try {
    const response = await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete image");
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    // Не выбрасываем ошибку, чтобы не прерывать процесс удаления теста
  }
} 
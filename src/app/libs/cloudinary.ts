export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
    });

    const result = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        file: base64Data 
      }),
    });

    if (!result.ok) {
      throw new Error('Не удалось загрузить изображение');
    }

    const data = await result.json();
    return data.url;
  } catch (error) {
    console.error('Ошибка при загрузке в Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error('Не удалось удалить изображение');
    }
  } catch (error) {
    console.error('Ошибка при удалении из Cloudinary:', error);
    throw error;
  }
}; 
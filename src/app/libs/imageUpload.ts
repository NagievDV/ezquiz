// Утилита для работы с изображениями
export const uploadImage = async (file: File): Promise<string> => {
  try {
    console.log('Starting image upload process...', { fileName: file.name, fileSize: file.size });

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending request to upload endpoint...');

    // Загружаем изображение через наш API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response received:', { 
      status: response.status,
      statusText: response.statusText
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Upload failed:', responseData);
      throw new Error(responseData.error || `Upload failed with status ${response.status}`);
    }

    if (!responseData.url) {
      console.error('Invalid response format:', responseData);
      throw new Error('Server response missing URL');
    }

    console.log('Upload successful:', { url: responseData.url });
    return responseData.url;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

export const deleteImage = async (filename: string): Promise<void> => {
  try {
    console.log('Attempting to delete image:', { filename });

    const response = await fetch('/api/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });

    console.log('Delete response received:', { 
      status: response.status,
      statusText: response.statusText
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Delete failed:', responseData);
      throw new Error(responseData.error || `Delete failed with status ${response.status}`);
    }

    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error in deleteImage:', error);
    throw error;
  }
}; 
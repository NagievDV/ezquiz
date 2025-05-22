import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary';

export const uploadImage = async (file: File): Promise<string> => {
  try {
    console.log('Начало процесса загрузки изображения...', { fileName: file.name, fileSize: file.size });

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Размер файла превышает 10MB');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Файл должен быть изображением');
    }

    console.log('Загрузка в Cloudinary...');
    const url = await uploadToCloudinary(file);
    
    console.log('Загрузка прошла успешно:', { url });
    return url;
  } catch (error) {
    console.error('Ошибка в uploadImage:', error);
    throw error;
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    console.log('Попытка удалить изображение:', { url });

    const publicId = url.split('/').slice(-2).join('/').split('.')[0];
    
    await deleteFromCloudinary(publicId);
    console.log('Изображение удалено успешно');
  } catch (error) {
    console.error('Ошибка в deleteImage:', error);
    throw error;
  }
}; 
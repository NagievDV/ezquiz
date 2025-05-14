import Link from "next/link";
import { CgAlbum } from "react-icons/cg";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";

interface Tag {
  _id: string;
  name: string;
}

interface TestCardProps {
  testId: string;
  title: string;
  description: string;
  imageUrl?: string;
  updatedAt: string | number | Date;
  tags?: Tag[];
  isTeacher?: boolean;
  type: "quiz" | "test";
  onDelete?: () => void;
}

const PlaceholderImage = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
    <CgAlbum className="text-gray-400 dark:text-gray-500 text-6xl" />
  </div>
);

export default function TestCard({
  testId,
  title,
  description,
  imageUrl,
  updatedAt,
  tags = [],
  isTeacher = false,
  type,
  onDelete,
}: TestCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete test");
      }

      onDelete?.();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting test:", error);
      // Здесь можно добавить отображение ошибки пользователю
    }
  };

  // Use the image URL directly since we're not using Cloudinary anymore
  const optimizedImageUrl = imageUrl && !imageError ? imageUrl : null;

  return (
    <>
      <div className="w-full rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 h-full flex flex-col justify-between transition-transform hover:scale-105">
        <div className="relative">
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                type === "quiz"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              }`}
            >
              {type === "quiz" ? "Квиз" : "Тест"}
            </span>
          </div>
          <div className="h-48">
            {optimizedImageUrl ? (
              <Image
                src={optimizedImageUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={false}
                style={{ objectFit: "cover" }}
                onError={() => setImageError(true)}
                loading="lazy"
                className="w-full h-full transition-opacity duration-300 hover:opacity-90"
              />
            ) : (
              <PlaceholderImage />
            )}
          </div>
        </div>

        <div className="px-6 py-4 flex-1">
          <h3 className="font-bold text-xl mb-2 dark:text-white">{title}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-base line-clamp-3">
            {description}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="px-6 py-2 flex flex-wrap gap-2">
            {tags.map((tag) =>
              tag._id ? (
                <span
                  key={tag._id}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full capitalize"
                >
                  {tag.name}
                </span>
              ) : null
            )}
          </div>
        )}

        <div className="px-6 py-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            {isTeacher && (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-10 h-10 inline-flex items-center justify-center bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors group relative"
                >
                  <FiTrash2 className="w-5 h-5" />
                  <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap transition-all duration-200">
                    Удалить
                  </span>
                </button>
                <Link
                  href={`/create-test?edit=${testId}`}
                  className="w-10 h-10 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition-colors group relative"
                >
                  <FiEdit2 className="w-5 h-5" />
                  <span className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap transition-all duration-200">
                    Редактировать
                  </span>
                </Link>
              </>
            )}
            {!isTeacher && (
              <Link
                href={`/test/${testId}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white text-sm rounded-lg transition-colors"
              >
                Пройти
              </Link>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Подтверждение удаления
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Вы уверены, что хотите удалить тест &quot;{title}&quot;? Это
              действие нельзя отменить.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

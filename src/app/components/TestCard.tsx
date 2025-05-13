import Link from "next/link";
import { CgAlbum } from "react-icons/cg";
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
}: TestCardProps) {
  const [imageError, setImageError] = useState(false);

  // Оптимизируем URL изображения для Cloudinary
  const optimizedImageUrl =
    imageUrl && !imageError
      ? imageUrl.replace("/upload/", "/upload/c_fill,w_800,h_400/")
      : null;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 h-full flex flex-col justify-between transition-transform hover:scale-105">
      <div className="relative h-48">
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
        <Link
          href={`/test/${testId}`}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Пройти
        </Link>
      </div>
    </div>
  );
}

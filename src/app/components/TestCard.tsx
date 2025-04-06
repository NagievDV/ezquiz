import React from 'react';
import { CgAlbum } from "react-icons/cg";

interface TestCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  updatedAt: string | number | Date;
}

export default function TestCard({ title, description, imageUrl, updatedAt }: TestCardProps) {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white h-full flex flex-col justify-between">
            {imageUrl ? (
        <img className="w-full" src={imageUrl} alt={title} />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200">
          <CgAlbum className="text-gray-400 text-6xl" />
        </div>
      )}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-700 text-base">{description}</p>
      </div>
      <div className="px-6 pt-4 pb-2 flex justify-between items-center">
        <span className="text-gray-600 text-sm">От: {new Date(updatedAt).toLocaleDateString()}</span>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Пройти
        </button>
      </div>
    </div>
  );
}
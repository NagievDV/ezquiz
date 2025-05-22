"use client";

import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface NavBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function NavBar({ searchQuery, setSearchQuery }: NavBarProps) {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-gray-400 dark:bg-gray-900 z-40 pt-2">
      <nav className="bg-blue-500 dark:bg-blue-900 w-[95%] sm:w-[90%] md:w-4/5 mx-auto p-2 sm:p-3 md:p-4 flex items-center justify-between rounded-xl gap-2 shadow-lg z-50">
        <Link
          href="/"
          className="flex items-center justify-center min-w-[40px] sm:min-w-[48px]"
        >
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
            <Image
              src="/images/icon.svg"
              alt="Home"
              width={32}
              height={32}
              className="w-full h-full [filter:brightness(0)_invert(1)] hover:opacity-80 transition-all duration-200"
            />
          </div>
        </Link>

        <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
          <div className="flex items-center justify-between bg-white rounded-lg overflow-hidden shadow-inner">
            <input
              type="text"
              placeholder="Найдите тест..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 w-full outline-none text-sm sm:text-base md:text-lg placeholder-gray-400"
            />
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <FaSearch className="text-lg sm:text-xl" />
            </button>
          </div>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="flex flex-col items-center justify-center min-w-[60px] sm:min-w-[80px] text-gray-50 hover:text-blue-200 transition-colors"
          >
            <IoPersonSharp className="text-xl sm:text-2xl md:text-3xl" />
            <span className="text-[10px] sm:text-xs md:text-sm mt-0.5 text-center">
              Профиль
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center min-w-[60px] sm:min-w-[80px] text-gray-50 hover:text-blue-200 transition-colors text-sm sm:text-base md:text-lg"
          >
            Войти
          </Link>
        )}
      </nav>
    </div>
  );
}

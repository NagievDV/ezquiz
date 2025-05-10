"use client";

import Link from "next/link";
import { CgHomeAlt } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";
import { IoPersonSharp } from "react-icons/io5";
<<<<<<< HEAD
import { useAuth } from "../context/AuthContext";
=======
import { useAuth } from "@/context/AuthContext";
>>>>>>> saved-state

interface NavBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

<<<<<<< HEAD
export default function NavBar({ searchQuery, setSearchQuery, handleSearch }: NavBarProps) {
=======
export default function NavBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
}: NavBarProps) {
>>>>>>> saved-state
  const { user } = useAuth();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <nav className="bg-blue-900 w-4/5 mx-auto p-4 flex items-center justify-between rounded-xl gap-2">
      <Link href="/">
        <CgHomeAlt className="text-white text-4xl hover:opacity-80 hover-icon" />
      </Link>

      <div className="flex items-center justify-between bg-white rounded-md w-4/5">
        <input
          type="text"
          placeholder="Найдите тест..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-2 w-full py-2 outline-none text-xs md:text-lg lg:text-xl"
        />
<<<<<<< HEAD
        <button onClick={handleSearch} className="px-2 py-2 hover:cursor-pointer">
=======
        <button
          onClick={handleSearch}
          className="px-2 py-2 hover:cursor-pointer"
        >
>>>>>>> saved-state
          <FaSearch />
        </button>
      </div>

      {user ? (
<<<<<<< HEAD
        <Link 
          href="/profile" 
=======
        <Link
          href="/profile"
>>>>>>> saved-state
          className="flex flex-col items-center gap-1 text-gray-50 hover:text-blue-200 transition-colors"
        >
          <IoPersonSharp className="text-2xl hover-icon" />
          <span className="text-xs">Личный кабинет</span>
        </Link>
      ) : (
<<<<<<< HEAD
        <Link 
=======
        <Link
>>>>>>> saved-state
          href="/login"
          className="text-gray-50 text-sm md:text-lg lg:text-xl hover:opacity-80"
        >
          Войти
        </Link>
      )}
    </nav>
  );
}
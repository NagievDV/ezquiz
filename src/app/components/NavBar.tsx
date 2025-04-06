import Link from "next/link";
import { CgHomeAlt } from "react-icons/cg";
import { FaSearch } from "react-icons/fa";

interface NavBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

export default function NavBar({ searchQuery, setSearchQuery, handleSearch }: NavBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
      e.currentTarget.blur();
    }
  };

  return (
    <nav className="bg-blue-900 w-4/5 mx-auto p-4 flex items-center justify-between rounded-xl gap-2">
      <Link href="/">
        <CgHomeAlt className="text-white text-4xl" />
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
        <button onClick={handleSearch} className="px-2 py-2 hover:cursor-pointer text-gray-900">
          <FaSearch />
        </button>
      </div>
      <Link href="/" className="text-gray-50 text-sm md:text-lg lg:text-xl hover:opacity-80">
        Войти
      </Link>
    </nav>
  );
}

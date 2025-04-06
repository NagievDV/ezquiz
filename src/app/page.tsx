"use client";

import { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import TestCard from "./components/TestCard";

interface Test {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
}

export default function Home() {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchTests() {
      const res = await fetch("http://localhost:3000/api/tests");
      if (!res.ok) {
        throw new Error("Ошибка при получении тестов");
      }
      const data = await res.json();
      setTests(data);
      setFilteredTests(data);
    }
    fetchTests();
  }, []);

  const handleSearch = () => {
    const filtered = tests.filter((test) =>
      test.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTests(filtered);
  };

  return (
    <div className="bg-gray-400 w-screen min-h-screen dark:bg-gray-900">
      <div className="mx-auto p-4 w-full sm:w-auto">
        <NavBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch} />
        <div className="mx-auto p-4 w-full sm:w-auto">
          <div className="p-4 grid justify-items-center xs:justify-items-normal items-stretch grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTests.map((test) => (
              <TestCard
                key={test._id}
                title={test.title}
                description={test.description}
                imageUrl={test.imageUrl}
                updatedAt={test.updatedAt}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import TestCard from "@/components/TestCard";

interface Test {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  tags: string[];
}

interface Tag {
  _id: string;
  name: string;
}

export default function Home() {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Создаем функцию для получения информации о теге по его ID
  const getTagInfo = (tagId: string): Tag | undefined => {
    return tags.find((tag) => tag._id === tagId);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [testsRes, tagsRes] = await Promise.all([
          fetch("/api/tests"),
          fetch("/api/tags"),
        ]);

        if (!testsRes.ok || !tagsRes.ok) {
          throw new Error("Ошибка загрузки данных");
        }

        const [testsData, tagsData] = await Promise.all([
          testsRes.json(),
          tagsRes.json(),
        ]);

        setTests(testsData);
        setFilteredTests(testsData);
        setTags(tagsData);
      } catch (err) {
        setError("Не удалось загрузить тесты");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...tests];

      if (searchQuery.trim()) {
        filtered = filtered.filter((test) =>
          test.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
        );
      }

      if (selectedTags.length > 0) {
        filtered = filtered.filter((test) =>
          selectedTags.every((selectedTagId) =>
            test.tags.includes(selectedTagId)
          )
        );
      }

      setFilteredTests(filtered);
    };

    applyFilters();
  }, [searchQuery, selectedTags, tests]);

  const handleTagClick = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-400 dark:bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-400 dark:bg-gray-900">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-400 w-full min-h-screen dark:bg-gray-900 overflow-x-hidden">
      <NavBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="mx-auto p-4 max-w-[1400px] mt-16 sm:mt-20">
        <div className="p-4 flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.map((tag) => (
              <button
                key={tag._id}
                onClick={() => handleTagClick(tag._id)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors
                  ${
                    selectedTags.includes(tag._id)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                  }
                `}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid justify-items-center sm:justify-items-stretch items-stretch grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTests.map((test) => (
            <TestCard
              key={test._id}
              testId={test._id}
              title={test.title}
              description={test.description}
              imageUrl={test.imageUrl}
              updatedAt={test.updatedAt}
              tags={test.tags
                .map((tagId) => getTagInfo(tagId))
                .filter((tag): tag is Tag => tag !== undefined)}
            />
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center text-white text-xl mt-8">
            Ничего не найдено
          </div>
        )}
      </div>
    </div>
  );
}

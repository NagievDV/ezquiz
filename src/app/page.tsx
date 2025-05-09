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
  tags: Tag[];
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [testsRes, tagsRes] = await Promise.all([
          fetch("/api/tests"),
          fetch("/api/tags"),
        ]);

        const [testsData, tagsData] = await Promise.all([
          testsRes.json(),
          tagsRes.json(),
        ]);

        setTests(testsData);
        setFilteredTests(testsData);
        setTags(tagsData);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedTags, tests]);

  const applyFilters = () => {
    let filtered = [...tests];

    if (searchQuery) {
      filtered = filtered.filter((test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((test) =>
        test.tags.some((tag) =>
          typeof tag === "string"
            ? selectedTags.includes(tag)
            : selectedTags.includes(tag._id)
        )
      );
    }

    setFilteredTests(filtered);
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="bg-gray-400 w-full min-h-screen dark:bg-gray-900 overflow-x-hidden">
      <div className="mx-auto p-4 max-w-[1400px]">
        <NavBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={applyFilters}
        />

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
                style={{ maxWidth: "fit-content" }}
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
              title={test.title}
              description={test.description}
              imageUrl={test.imageUrl}
              updatedAt={test.updatedAt}
              tags={test.tags}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

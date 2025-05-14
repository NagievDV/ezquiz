"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import TestForm from "@/components/Test/TestForm";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { Test } from "@/types/test";

// Создаем отдельный компонент для контента
function CreateTestContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("edit");
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(!!testId);

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      router.push("/");
      return;
    }

    if (testId) {
      fetchTest();
    }
  }, [user, router, testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test");
      }
      const data = await response.json();
      setTest(data);
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== "teacher") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              Назад к профилю
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {testId ? "Редактирование теста" : "Создание теста"}
            </h1>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <TestForm initialData={test || undefined} isEditing={!!testId} />
        </div>
      </div>
    </div>
  );
}

// Основной компонент страницы с Suspense
export default function CreateTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <CreateTestContent />
    </Suspense>
  );
}

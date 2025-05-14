"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TestForm from "@/components/Test/TestForm";
import { Test } from "@/types/test";

interface EditTestPageProps {
  params: {
    id: string;
  };
}

export default function EditTestPage({ params }: EditTestPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      router.push("/");
      return;
    }

    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${params.id}`);
        if (!response.ok) {
          throw new Error("Не удалось загрузить тест");
        }
        const data = await response.json();
        setTest(data);
      } catch (error) {
        console.error("Error fetching test:", error);
        setError("Произошла ошибка при загрузке теста");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [params.id, user, router]);

  if (!user || user.role !== "teacher") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">
          {error || "Тест не найден"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <TestForm initialData={test} isEditing={true} />
    </div>
  );
}

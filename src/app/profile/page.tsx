"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { IoPersonSharp, IoLogOutOutline } from "react-icons/io5";
import { TbRefresh } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TestResult {
  _id: string;
  test: {
    _id: string;
    title: string;
    author: {
      name: string;
    };
  };
  score: number;
  maxScore: number;
  submittedAt: string;
}

interface PaginationData {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    isLoading: true,
  });
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 5,
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const loadTestHistory = async (page: number) => {
    if (!user) return;

    setIsHistoryLoading(true);
    setError(null);

    try {
      console.log("📤 Calling API with userId:", user.id);
      const apiUrl = `/api/users/results?userId=${user.id}&page=${page}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      console.log("📥 API Response:", { status: res.status, data });

      if (!res.ok) {
        console.error("❌ Failed to load test history:", {
          status: res.status,
          data,
        });
        throw new Error(
          data?.error ||
            data?.details ||
            res.statusText ||
            "Ошибка загрузки истории тестов"
        );
      }

      if (!data || !Array.isArray(data.results)) {
        console.error("❌ Invalid response format:", data);
        throw new Error("Неверный формат данных от сервера");
      }

      setTestHistory(data.results);
      setPagination(
        data.pagination || {
          total: data.results.length,
          pages: 1,
          currentPage: 1,
          perPage: 5,
        }
      );
      setError(null);
    } catch (error) {
      console.error("❌ Error in loadTestHistory:", error);
      setError(
        error instanceof Error ? error.message : "Произошла неизвестная ошибка"
      );
      setTestHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Загрузка статистики
        const statsRes = await fetch(`/api/users/stats?userId=${user.id}`);
        const statsData = await statsRes.json();

        if (!statsRes.ok) {
          throw new Error(statsData.error || "Ошибка загрузки статистики");
        }

        setStats({
          totalTests: statsData.totalTests,
          averageScore: Math.round(statsData.averageScore * 100),
          isLoading: false,
        });
      } catch (error) {
        console.error("❌ Error loading stats:", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }

      // Загрузка истории тестов
      await loadTestHistory(1);
    };

    loadData();
  }, [user]);

  const handlePageChange = (page: number) => {
    loadTestHistory(page);
  };

  const roleTranslations = {
    student: "Студент",
    admin: "Администратор",
    teacher: "Преподаватель",
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-400 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <p className="text-red-500 dark:text-red-400">
            Доступ запрещён.{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Войти
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-400 dark:bg-gray-900 px-4 py-6 sm:p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-gray-200">
          Личный кабинет
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 transition-colors relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 flex items-center gap-1 sm:gap-2 
                     text-red-500 hover:text-red-600 dark:text-red-400 
                     dark:hover:text-red-500 transition-colors text-sm sm:text-base"
          >
            <IoLogOutOutline className="text-lg sm:text-xl" />
            <span>Выйти</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-blue-100 dark:bg-blue-900 rounded-full self-start">
              <IoPersonSharp className="text-2xl sm:text-3xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200">
                {user.name}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm">
                {roleTranslations[user.role as keyof typeof roleTranslations]}
              </span>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-lg mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              Статистика
            </h3>
            {stats.isLoading ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Пройдено тестов
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {stats.totalTests}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    Средний результат
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {stats.averageScore}%
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-lg mb-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
              История тестов
            </h3>

            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg text-sm sm:text-base">
                <p>{error}</p>
                <button
                  onClick={() => loadTestHistory(pagination.currentPage)}
                  className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {isHistoryLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"
                  />
                ))}
              </div>
            ) : testHistory.length > 0 ? (
              <>
                <div className="space-y-4">
                  {testHistory.map((result) => (
                    <div
                      key={result._id}
                      className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                            {result.test.title}
                          </h4>
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            от {result.test.author.name}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Пройден:{" "}
                          {new Date(result.submittedAt).toLocaleDateString()} в{" "}
                          {new Date(result.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                            {Math.round((result.score / result.maxScore) * 100)}
                            %
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {result.score} из {result.maxScore}
                          </p>
                        </div>
                        <Link
                          href={`/test/${result.test._id}`}
                          className="group relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          title="Пройти заново"
                        >
                          <TbRefresh className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
                          <span className="sr-only">Пройти заново</span>
                          <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap transition-all duration-200">
                            Пройти заново
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-1 sm:gap-2 mt-6 flex-wrap">
                    {(() => {
                      const showPages = [];
                      const totalPages = pagination.pages;
                      const current = pagination.currentPage;

                      // Always show first page
                      if (totalPages > 0) showPages.push(1);

                      // Calculate range around current page
                      let start = Math.max(2, current - 1);
                      let end = Math.min(totalPages - 1, current + 1);

                      // Adjust range if at the edges
                      if (current <= 3) {
                        end = Math.min(4, totalPages - 1);
                      } else if (current >= totalPages - 2) {
                        start = Math.max(totalPages - 3, 2);
                      }

                      // Add ellipsis and pages
                      if (start > 2) showPages.push("...");
                      for (let i = start; i <= end; i++) {
                        showPages.push(i);
                      }
                      if (end < totalPages - 1) showPages.push("...");

                      // Always show last page if there is more than one page
                      if (totalPages > 1) showPages.push(totalPages);

                      return showPages.map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 sm:px-3 py-1 text-gray-500 dark:text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${
                              page === pagination.currentPage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
                {error ? "Не удалось загрузить историю" : "История пуста"}
              </p>
            )}
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

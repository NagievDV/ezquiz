"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { IoPersonSharp, IoLogOutOutline } from "react-icons/io5";
import { TbRefresh } from "react-icons/tb";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import TestCard from "@/components/TestCard";

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

interface Tag {
  _id: string;
  name: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  tags: Tag[];
  type: "quiz" | "test";
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
  const [authorTests, setAuthorTests] = useState<Test[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isAuthorTestsLoading, setIsAuthorTestsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 5,
  });
  const [authorTestsPagination, setAuthorTestsPagination] =
    useState<PaginationData>({
      total: 0,
      pages: 1,
      currentPage: 1,
      perPage: 6,
    });
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const loadAuthorTests = useCallback(
    async (page: number = 1) => {
      if (!user) return;

      setIsAuthorTestsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/tests?author=${user.id}&page=${page}&perPage=${authorTestsPagination.perPage}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Ошибка загрузки тестов");
        }

        setAuthorTests(data.results);
        setAuthorTestsPagination(data.pagination);
      } catch (error) {
        console.error("Ошибка при загрузке тестов:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Произошла неизвестная ошибка"
        );
      } finally {
        setIsAuthorTestsLoading(false);
      }
    },
    [user, authorTestsPagination.perPage]
  );

  const loadTestHistory = useCallback(
    async (page: number) => {
      if (!user) return;

      setIsHistoryLoading(true);
      setError(null);

      try {
        const apiUrl = `/api/users/results?userId=${user.id}&page=${page}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (!res.ok) {
          console.error("Ошибка при загрузке истории тестов", {
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
          console.error("Неверный формат данных от сервера", data);
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
        console.error("Ошибка при загрузке истории тестов", error);
        setError(
          error instanceof Error
            ? error.message
            : "Произошла неизвестная ошибка"
        );
        setTestHistory([]);
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
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

        if (user.role === "teacher") {
          await loadAuthorTests(1);
        } else {
          await loadTestHistory(1);
        }
      } catch (error) {
        console.error("Ошибка при загрузке статистики", error);
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadData();
  }, [user, loadAuthorTests, loadTestHistory]);

  const handlePageChange = (page: number) => {
    loadTestHistory(page);
  };

  const handleAuthorPageChange = (page: number) => {
    loadAuthorTests(page);
  };

  const handleDeleteTest = (deletedTestId: string) => {
    setAuthorTests((prevTests) =>
      prevTests.filter((test) => test._id !== deletedTestId)
    );
    router.refresh();
  };

  const handleRetakeTest = (testId: string) => {
    router.push(`/test/${testId}`);
  };

  const roleTranslations = {
    student: "Студент",
    admin: "Администратор",
    teacher: "Преподаватель",
  };

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    const renderPageButton = (pageNum: number) => (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={`min-w-[28px] sm:min-w-[32px] h-[28px] sm:h-[32px] px-2 sm:px-3 text-sm sm:text-base rounded flex items-center justify-center ${
          currentPage === pageNum
            ? "bg-blue-600 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        {pageNum}
      </button>
    );

    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

    pages.push(renderPageButton(1));

    if (totalPages <= maxVisiblePages) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      let startPage = Math.max(
        2,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(
        totalPages - 1,
        currentPage + Math.floor(maxVisiblePages / 2)
      );

      if (currentPage <= Math.floor(maxVisiblePages / 2) + 1) {
        endPage = maxVisiblePages - 1;
      } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
        startPage = totalPages - (maxVisiblePages - 2);
      }

      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis-start"
            className="px-1 sm:px-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center"
          >
            ...
          </span>
        );
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(renderPageButton(i));
      }

      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis-end"
            className="px-1 sm:px-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 flex items-center"
          >
            ...
          </span>
        );
      }

      if (totalPages > 1) {
        pages.push(renderPageButton(totalPages));
      }
    }

    return (
      <div className="flex justify-center items-center gap-1 mt-6 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`min-w-[28px] sm:min-w-[32px] h-[28px] sm:h-[32px] px-2 sm:px-3 text-sm sm:text-base rounded flex items-center justify-center ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          ←
        </button>

        {pages}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`min-w-[28px] sm:min-w-[32px] h-[28px] sm:h-[32px] px-2 sm:px-3 text-sm sm:text-base rounded flex items-center justify-center ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          →
        </button>
      </div>
    );
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

  const renderContent = () => {
    if (user.role === "teacher") {
      if (isAuthorTestsLoading) {
        return (
          <div className="text-center text-gray-600 dark:text-gray-400">
            Загрузка тестов...
          </div>
        );
      }

      return (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Мои тесты
            </h3>
            <Link
              href="/create-test"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать тест
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authorTests.map((test) => (
              <TestCard
                key={test._id}
                testId={test._id}
                title={test.title}
                description={test.description}
                imageUrl={test.imageUrl}
                updatedAt={test.updatedAt}
                type={test.type}
                tags={test.tags}
                isTeacher={true}
                onDelete={() => handleDeleteTest(test._id)}
              />
            ))}
          </div>

          {authorTests.length === 0 && (
            <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
              У вас пока нет созданных тестов
            </div>
          )}

          {authorTestsPagination.pages > 1 &&
            renderPagination(
              authorTestsPagination.currentPage,
              authorTestsPagination.pages,
              handleAuthorPageChange
            )}
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          История тестов
        </h3>

        {isHistoryLoading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">
            Загрузка истории...
          </div>
        ) : (
          <>
            {testHistory.map((result) => {
              const percentage = Math.round(
                (result.score / result.maxScore) * 100
              );
              const date = new Date(result.submittedAt);
              return (
                <div
                  key={result._id}
                  className="bg-white dark:bg-gray-700 p-4 rounded-lg mb-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">
                        {result.test.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Автор: {result.test.author.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Пройден: {date.toLocaleDateString()} в{" "}
                        {date.toLocaleTimeString()}
                      </p>
                      <button
                        onClick={() => handleRetakeTest(result.test._id)}
                        className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                      >
                        <TbRefresh className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
                        <span className="text-sm">Пройти заново</span>
                      </button>
                    </div>
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.score}/{result.maxScore}
                      </div>
                      <div
                        className={`h-1.5 w-full mt-2 rounded-full ${
                          percentage >= 80
                            ? "bg-green-500"
                            : percentage >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-opacity-20 dark:bg-opacity-40 bg-white"
                          style={{ width: `${100 - percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {testHistory.length === 0 && (
              <div className="text-center text-gray-600 dark:text-gray-400">
                История пуста
              </div>
            )}

            {pagination.pages > 1 &&
              renderPagination(
                pagination.currentPage,
                pagination.pages,
                handlePageChange
              )}
          </>
        )}
      </div>
    );
  };

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

          {user.role !== "teacher" && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {stats.isLoading ? "-" : stats.totalTests}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Пройдено тестов
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {stats.isLoading ? "-" : `${stats.averageScore}%`}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Средний балл
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderContent()}

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors text-sm sm:text-base"
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

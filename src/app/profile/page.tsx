"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { IoPersonSharp, IoLogOutOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    isLoading: true,
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    if (user?.role === "student") {
      fetch(`/api/users/stats?userId=${user._id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка загрузки статистики");
          return res.json();
        })
        .then((data) => {
          setStats({
            totalTests: data.totalTests,
            averageScore: Math.round(data.averageScore * 100),
            isLoading: false,
          });
        })
        .catch(() => setStats((prev) => ({ ...prev, isLoading: false })));
    }
  }, [user]);

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
    <div className="min-h-screen bg-gray-400 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">
          Личный кабинет
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 flex items-center gap-2 
                     text-red-500 hover:text-red-600 dark:text-red-400 
                     dark:hover:text-red-500 transition-colors"
          >
            <IoLogOutOutline className="text-xl" />
            <span className="text-sm">Выйти</span>
          </button>

          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <IoPersonSharp className="text-3xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {user.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user.email}
              </p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                {roleTranslations[user.role as keyof typeof roleTranslations]}
              </span>
            </div>
          </div>

          {user.role === "student" && (
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                Статистика
              </h3>
              {stats.isLoading ? (
                <div className="animate-pulse grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <p className="text-gray-600 dark:text-gray-400">
                      Пройдено тестов
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {stats.totalTests}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <p className="text-gray-600 dark:text-gray-400">
                      Средний результат
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {stats.averageScore}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const rawData = await response.text();

      if (!rawData.trim()) {
        throw new Error("Сервер вернул пустой ответ");
      }

      const userData = JSON.parse(rawData);

      if (!response.ok) {
        throw new Error(userData.message || "Ошибка авторизации");
      }

      login(userData);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Неверный email или пароль");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400 dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-80 transition-colors"
      >
        <h2 className="text-2xl mb-4 text-center text-gray-800 dark:text-gray-200">
          Вход в систему
        </h2>

        {error && (
          <p className="mb-4 text-red-500 dark:text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded-lg 
                   dark:border-gray-600 dark:bg-gray-700 
                   dark:text-gray-200 focus:ring-2 focus:ring-blue-500
                   transition-all"
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg 
                   dark:border-gray-600 dark:bg-gray-700 
                   dark:text-gray-200 focus:ring-2 focus:ring-blue-500
                   transition-all"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 
                   dark:hover:bg-blue-800 text-white p-2 rounded-lg
                   transition-colors"
        >
          Войти
        </button>

        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Регистрация
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
          >
            ← Вернуться на главную
          </Link>
        </div>
      </form>
    </div>
  );
}

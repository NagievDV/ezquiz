"use client";

<<<<<<< HEAD
import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

const AuthContext = createContext<{
  user: User;
  login: (userData: User) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
=======
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type UserData = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: any) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Упрощенная валидация
  const validateUserData = (data: any): data is UserData => {
    return (
      data &&
      (data._id || data.id) && // Принимаем и _id и id
      data.name &&
      data.email &&
      data.role
    );
  };

  // 2. Восстановление сохранения в localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (validateUserData(parsed)) {
          setUser({
            _id: parsed._id || parsed._id,
            name: parsed.name,
            email: parsed.email,
            role: parsed.role,
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // 3. Гарантированное сохранение при логине
  const login = useCallback((rawData: any) => {
    const userData = {
      _id: rawData._id || rawData.id,
      name: rawData.name,
      email: rawData.email,
      role: rawData.role,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Фиксим строку
  }, []);

  // 4. Гарантированная очистка при логауте
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
>>>>>>> saved-state
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

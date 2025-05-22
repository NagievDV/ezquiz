"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type UserData = {
  id: string;
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

  const validateUserData = (data: any): data is UserData => {
    return data && data.id && data.name && data.email && data.role;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (validateUserData(parsed)) {
          setUser({
            id: parsed.id,
            name: parsed.name,
            email: parsed.email,
            role: parsed.role,
          });
        }
      } catch (error) {
        console.error("Ошибка при парсинге данных пользователя:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((rawData: any) => {
    const userData = {
      id: rawData.id || rawData._id,
      name: rawData.name,
      email: rawData.email,
      role: rawData.role,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

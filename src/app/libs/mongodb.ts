import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Отсутствует MONGODB_URI в .env");
}

let isConnecting = false;
let connectionError: Error | null = null;

export const connectDB = async (): Promise<void> => {
  // Если уже подключено, возвращаем
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Если есть ошибка подключения, пробуем снова через 5 секунд
  if (connectionError) {
    console.log("🔄 Повторная попытка подключения к MongoDB...");
    connectionError = null;
  }

  // Если уже идет процесс подключения, ждем
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return connectDB();
  }

  try {
    isConnecting = true;
    await mongoose.connect(MONGODB_URI, {
      dbName: "db",
      serverSelectionTimeoutMS: 5000, // Таймаут выбора сервера
      socketTimeoutMS: 45000, // Таймаут сокета
      connectTimeoutMS: 10000, // Таймаут подключения
    });
    console.log("✅ Подключено к MongoDB");
    isConnecting = false;
  } catch (error) {
    isConnecting = false;
    connectionError = error as Error;
    console.error("❌ Ошибка подключения к MongoDB:", error);
    throw new Error(
      `Ошибка подключения к базе данных: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

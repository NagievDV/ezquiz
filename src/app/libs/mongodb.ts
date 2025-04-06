import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Отсутствует MONGODB_URI в .env");
}

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ Уже подключено к MongoDB");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "db",
    });
    console.log("✅ Подключено к MongoDB");
  } catch (error) {
    console.error("❌ Ошибка подключения к MongoDB:", error);
    throw new Error("Ошибка подключения к базе данных");
  }
};

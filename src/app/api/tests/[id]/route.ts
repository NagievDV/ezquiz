import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import { Types } from "mongoose";
import Test from "@/models/Test";
import Question from "@/models/Question";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверка наличия ID в параметрах
    if (!params?.id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    // Валидация формата ID
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Неверный формат ID теста" },
        { status: 400 }
      );
    }

    // Подключение к базе данных
    await connectDB();
    
    // Поиск теста с полной информацией о вопросах
    const test = await Test.findById(params.id)
      .populate({
        path: "questions",
        model: Question, // Используем модель напрямую
        select: "-createdAt -updatedAt -__v" // Исключаем служебные поля
      })
      .lean()
      .select("-createdAt -updatedAt -__v"); // Чистый вывод для теста

    if (!test) {
      return NextResponse.json(
        { error: "Тест не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(test);

  } catch (error) {
    console.error("Ошибка в GET /api/tests/[id]:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
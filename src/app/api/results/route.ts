import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserResult from "@/models/UserResult";
import UserAnswer from "@/models/UserAnswer";

export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const { userId, testId, answers, score, maxScore } = await req.json();

    // 1. Создаем запись результата
    const result = await UserResult.create({
      user: userId,
      test: testId,
      score,
      maxScore
    });

    // 2. Преобразуем ответы в правильный формат
    const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
      resultId: result._id,
      questionId,
      userAnswer: answer
    }));

    // 3. Сохраняем ответы с обработкой ошибок
    if (answerRecords.length > 0) {
      await UserAnswer.insertMany(answerRecords);
    }

    return NextResponse.json({ 
      success: true,
      resultId: result._id 
    });

  } catch (error) {
    console.error("Ошибка сохранения:", error);
    return NextResponse.json(
      { error: "Ошибка сервера: " + (error as Error).message },
      { status: 500 }
    );
  }
}
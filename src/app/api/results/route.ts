import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserResult from "@/models/UserResult";
import UserAnswer from "@/models/UserAnswer";

export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const { userId, testId, answers, score, maxScore } = await req.json();

    const result = await UserResult.create({
      user: userId,
      test: testId,
      score,
      maxScore
    });

    const answerRecords = Object.entries(answers).map(([questionId, answer]) => ({
      resultId: result._id,
      questionId,
      userAnswer: answer
    }));

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
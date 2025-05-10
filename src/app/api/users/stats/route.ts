import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserResult from "@/models/UserResult";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    await connectDB();

    const results = await UserResult.find({ user: userId }).select("score maxScore");

    return NextResponse.json({
      totalTests: results.length,
      averageScore: results.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / results.length || 0
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Ошибка получения статистики" },
      { status: 500 }
    );
  }
}
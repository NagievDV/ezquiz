import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import Test from "@/models/Test";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  
  try {
    const test = await Test.findById(params.id)
      .populate({
        path: 'questions',
        model: 'Question',
        select: 'question type options correctAnswer points'
      })
      .lean();

    if (!test) return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
    
    return NextResponse.json(test);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
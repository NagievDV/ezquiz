import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserAnswer from "@/models/UserAnswer";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await connectDB();

  const searchParams = req.nextUrl.searchParams;
  const resultId = searchParams.get("result");

  let filter = {};

  if (resultId && mongoose.Types.ObjectId.isValid(resultId)) {
    filter = { resultId: new mongoose.Types.ObjectId(resultId) };
  }

  try {
    const answers = await UserAnswer.find(filter);
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Ошибка при получении ответов:", error);
    return NextResponse.json({ error: "Не удалось получить ответы" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const data = await req.json();

    const created = await UserAnswer.insertMany(Array.isArray(data) ? data : [data]);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Ошибка при сохранении ответов:", error);
    return NextResponse.json({ error: "Не удалось сохранить ответы" }, { status: 500 });
  }
}

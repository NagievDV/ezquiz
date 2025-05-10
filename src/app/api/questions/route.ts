import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import Question from "@/models/Question";

export async function GET(req: NextRequest) {
  await connectDB();
  const searchParams = req.nextUrl.searchParams;
  const testId = searchParams.get("testId");

  const filter: any = {};
  if (testId) filter.testId = testId;

  try {
    const questions = await Question.find(filter);
    return NextResponse.json(questions);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const data = await req.json();
    const newQuestion = await Question.create(data);
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

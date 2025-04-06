import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/libs/mongodb";
import Test from "@/app/models/Test";

export async function GET(req: NextRequest) {
  await connectDB();

  const searchParams = req.nextUrl.searchParams;

  const type = searchParams.get("type");
  const author = searchParams.get("author");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const tags = searchParams.getAll("tags");

  const filter: any = {};

  if (type) filter.type = type;
  if (author) filter.author = author;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  if (tags.length > 0) {
    filter.tags = { $in: tags };
  }

  try {
    const tests = await Test.find(filter);
    return NextResponse.json(tests);
  } catch (error) {
    console.error("❌ Ошибка при создании теста:", error);
    return NextResponse.json({ error: "Ошибка при создании теста", details: error }, { status: 500 });
  }
  
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const data = await req.json();
    const newTest = await Test.create(data);
    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await connectDB();

  try {
    const { testId, questions } = await req.json();

    if (!testId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "testId и массив questions обязательны" }, { status: 400 });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      testId,
      { $addToSet: { questions: { $each: questions } } },
      { new: true }
    );

    if (!updatedTest) {
      return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
    }

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("❌ Ошибка при обновлении теста:", error);
    return NextResponse.json({ error: "Ошибка при обновлении теста", details: error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const { testId, title, description, type, tags, author, questions, imageUrl } = await req.json();

    if (!testId) {
      return NextResponse.json({ error: "testId обязательный параметр" }, { status: 400 });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (type) updateData.type = type;
    if (tags) updateData.tags = tags;
    if (author) updateData.author = author;
    if (questions) updateData.questions = questions;
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedTest = await Test.findByIdAndUpdate(testId, updateData, { new: true });

    if (!updatedTest) {
      return NextResponse.json({ error: "Тест не найден" }, { status: 404 });
    }

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("❌ Ошибка при обновлении теста:", error);
    return NextResponse.json({ error: "Ошибка при обновлении теста", details: error }, { status: 500 });
  }
}



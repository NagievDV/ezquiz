import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import { Types } from "mongoose";
import Test from "@/models/Test";
import Question from "@/models/Question";
import { deleteImage } from "@/libs/imageprocess";

// Define the params type
type RouteParams = { params: { id: string } }

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    if (!context.params?.id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(context.params.id)) {
      return NextResponse.json(
        { error: "Неверный формат ID теста" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const test = await Test.findById(context.params.id)
      .populate({
        path: "questions",
        model: Question,
        select: "-createdAt -updatedAt -__v"
      })
      .populate({
        path: "tags",
        model: "Tag",
        select: "name"
      })
      .lean()
      .select("-createdAt -updatedAt -__v");

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

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    if (!context.params?.id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(context.params.id)) {
      return NextResponse.json(
        { error: "Неверный формат ID теста" },
        { status: 400 }
      );
    }

    await connectDB();

    const data = await request.json();
    const { title, description, type, tags, author, questions, imageUrl } = data;

    if (!title || !description || !type || !author) {
      return NextResponse.json(
        { error: "Отсутствуют обязательные поля" },
        { status: 400 }
      );
    }

    const questionIds = [];
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        if (question._id) {
          await Question.findByIdAndUpdate(question._id, question);
          questionIds.push(question._id);
        } else {
          const newQuestion = await Question.create(question);
          questionIds.push(newQuestion._id);
        }
      }
    }

    const updateData = {
      title,
      description,
      type,
      tags,
      author,
      questions: questionIds,
      imageUrl,
    };

    const updatedTest = await Test.findByIdAndUpdate(
      context.params.id,
      updateData,
      { new: true }
    ).populate({
      path: "questions",
      model: Question,
      select: "-createdAt -updatedAt -__v"
    }).populate({
      path: "tags",
      model: "Tag",
      select: "name"
    });

    if (!updatedTest) {
      return NextResponse.json(
        { error: "Тест не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("Ошибка при обновлении теста:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка при обновлении теста" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    await connectDB();

    const test = await Test.findById(context.params.id).populate({
      path: "questions",
      model: Question,
      select: "imageUrl"
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    if (test.imageUrl) {
      const filename = test.imageUrl.split("/").pop();
      if (filename) {
        await deleteImage(filename);
      }
    }

    for (const question of test.questions) {
      if (question.imageUrl) {
        const filename = question.imageUrl.split("/").pop();
        if (filename) {
          await deleteImage(filename);
        }
      }
    }

    await Question.deleteMany({ 
      _id: { 
        $in: test.questions.map((q: { _id: string }) => q._id) 
      } 
    });

    await Test.findByIdAndDelete(context.params.id);

    return NextResponse.json({ message: "Test deleted successfully" });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}
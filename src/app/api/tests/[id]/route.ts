import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import { Types } from "mongoose";
import Test from "@/models/Test";
import Question from "@/models/Question";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

type RouteParams = { params: { id: string } }

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Неверный формат ID теста" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const test = await Test.findById(id)
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
  { params }: RouteParams
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
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
      id,
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
  { params }: RouteParams
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Не указан ID теста" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Неверный формат ID теста" },
        { status: 400 }
      );
    }

    await connectDB();

    const test = await Test.findById(id).populate({
      path: "questions",
      model: Question,
      select: "imageUrl"
    });

    if (!test) {
      return NextResponse.json(
        { error: "Тест не найден" },
        { status: 404 }
      );
    }

    if (test.imageUrl) {
      const publicId = test.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Ошибка при удалении изображения теста:', error);
      }
    }

    for (const question of test.questions) {
      if (question.imageUrl) {
        const publicId = question.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Ошибка при удалении изображения вопроса:', error);
        }
      }
    }

    await Question.deleteMany({ 
      _id: { 
        $in: test.questions.map((q: { _id: string }) => q._id) 
      } 
    });

    await Test.findByIdAndDelete(id);

    return NextResponse.json({ message: "Тест удален успешно" });
  } catch (error) {
    console.error("Ошибка при удалении теста:", error);
    return NextResponse.json(
      { error: "Не удалось удалить тест" },
      { status: 500 }
    );
  }
}
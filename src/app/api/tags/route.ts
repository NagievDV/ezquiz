import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import Tag from "@/models/Tag";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const id = searchParams.get("id");

    if (id) {
      const tag = await Tag.findById(id);
      if (!tag) {
        return NextResponse.json({ error: "Тег не найден" }, { status: 404 });
      }
      return NextResponse.json(tag);
    }

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const tags = await Tag.find(query).sort({ name: 1 });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Ошибка при получении тегов:", error);
    return NextResponse.json(
      { error: "Не удалось получить теги" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Требуется имя тега" },
        { status: 400 }
      );
    }

    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    const tag = await Tag.create({ name });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании тега:", error);
    return NextResponse.json(
      { error: "Не удалось создать тег" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  await connectDB();

  try {
    const deletedTag = await Tag.findByIdAndDelete(id);
    if (!deletedTag) {
      return NextResponse.json({ error: "Тег не найден" }, { status: 404 });
    }
    return NextResponse.json({ message: "Тег удален успешно" });
  } catch (error) {
    console.error("Ошибка при удалении тега:", error);
    return NextResponse.json({ error: "Не удалось удалить тег" }, { status: 500 });
  }
}

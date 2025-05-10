// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
<<<<<<< HEAD
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../libs/mongodb";
=======
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "@/libs/mongodb";
>>>>>>> saved-state

// Обработчик POST-запросов
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    await connectDB();

    const user = await User.findOne({ email }).select("+passwordHash");
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { message: "Неверные учетные данные" },
        { status: 401 }
      );
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return NextResponse.json(
      { message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}

// Запретите другие методы
export async function GET() {
  return NextResponse.json(
    { error: "Метод GET не поддерживается" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Метод PUT не поддерживается" },
    { status: 405 }
  );
}
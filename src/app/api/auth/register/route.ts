import { NextResponse } from "next/server";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { connectDB } from "../../../libs/mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    const allowedRoles = ['student', 'teacher', 'admin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { message: "Недопустимая роль пользователя" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      role
    });

    const userData = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    return NextResponse.json(userData, { status: 201 });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json(
      { message: "Ошибка при создании пользователя" },
      { status: 500 }
    );
  }
}
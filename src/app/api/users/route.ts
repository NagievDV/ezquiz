import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
<<<<<<< HEAD
import { connectDB } from "@/app/libs/mongodb";
import User from "@/app/models/User";
=======
import { connectDB } from "@/libs/mongodb";
import User from "@/models/User";

>>>>>>> saved-state


export async function GET(req: NextRequest) {
  await connectDB();

  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  const role = searchParams.get("role");

  try {
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    const filter: any = {};
    if (role) filter.role = role;

    const users = await User.find(filter);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching user(s):", error);
    return NextResponse.json({ error: "Failed to fetch user(s)" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { passwordHash, ...data } = await req.json();
    
    const hashedPassword = await bcrypt.hash(passwordHash, 10);
    
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const user = await User.create({ ...data, passwordHash: hashedPassword });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

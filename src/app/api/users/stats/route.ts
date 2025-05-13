import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserResult from "@/models/UserResult";
import mongoose from "mongoose";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { error: "Invalid user ID format" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const results = await UserResult.find({ user: userId })
      .select("score maxScore")
      .lean();

    if (!results) {
      return NextResponse.json({
        totalTests: 0,
        averageScore: 0
      });
    }

    return NextResponse.json({
      totalTests: results.length,
      averageScore: results.length > 0 
        ? results.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / results.length 
        : 0
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/libs/mongodb";
import Result from "@/app/models/UserResult";

export async function GET(req: NextRequest) {
  await connectDB();

  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("user");
  const testId = searchParams.get("test");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const filter: any = {};
  if (userId) filter.user = userId;
  if (testId) filter.test = testId;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  try {
    const results = await Result.find(filter);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const data = await req.json();
    const result = await Result.create(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}

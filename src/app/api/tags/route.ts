import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/libs/mongodb";
import Tag from "@/app/models/Tag";

export async function GET() {
  await connectDB();
  
  try {
    const tags = await Tag.find();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function GET_BY_ID(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  await connectDB();
  
  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json(tag);
  } catch (error) {
    console.error("Error fetching tag by ID:", error);
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { name } = await req.json();
    console.log("Received data:", name);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newTag = await Tag.create({ name });
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "Failed to create tag: " + error }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  await connectDB();

  try {
    const deletedTag = await Tag.findByIdAndDelete(id);
    if (!deletedTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}

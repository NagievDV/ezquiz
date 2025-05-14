import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import Tag from "@/models/Tag";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");
    const id = searchParams.get("id");

    // If ID is provided, return single tag
    if (id) {
      const tag = await Tag.findById(id);
      if (!tag) {
        return NextResponse.json({ error: "Tag not found" }, { status: 404 });
      }
      return NextResponse.json(tag);
    }

    // Otherwise, return filtered tags
    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: "i" } };
    }

    const tags = await Tag.find(query).sort({ name: 1 });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingTag) {
      return NextResponse.json(existingTag);
    }

    // Create new tag
    const tag = await Tag.create({ name });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
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
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}

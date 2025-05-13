import { NextResponse } from "next/server";
import { connectDB } from "@/libs/mongodb";
import UserResult from "@/models/UserResult";
import User from "@/models/User";
import Test from "@/models/Test";
import mongoose from "mongoose";

export async function GET(request: Request) {
  console.log("🚀 Starting GET request for user results");
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 5;

    console.log("📝 Request parameters:", { userId, page, limit });

    if (!userId) {
      console.error("❌ Missing userId in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId format:", userId);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    console.log("🔌 Connecting to database...");
    try {
      await connectDB();
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Failed to connect to database", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 }
      );
    }

    // Убедимся, что модели зарегистрированы
    if (!mongoose.models.User) {
      console.log("ℹ️ Registering User model");
      mongoose.model('User', User.schema);
    }
    if (!mongoose.models.Test) {
      console.log("ℹ️ Registering Test model");
      mongoose.model('Test', Test.schema);
    }

    console.log("📊 Counting total documents...");
    let total;
    try {
      total = await UserResult.countDocuments({ user: userId });
      console.log(`✅ Found ${total} total results for user ${userId}`);
    } catch (countError) {
      console.error("❌ Error counting documents:", countError);
      return NextResponse.json(
        { error: "Failed to count results", details: countError instanceof Error ? countError.message : String(countError) },
        { status: 500 }
      );
    }

    if (total === 0) {
      console.log("ℹ️ No results found for user");
      return NextResponse.json({
        results: [],
        pagination: {
          total: 0,
          pages: 0,
          currentPage: page,
          perPage: limit
        }
      });
    }

    console.log("🔍 Fetching results with population...");
    let results;
    try {
      results = await UserResult.find({ user: userId })
        .sort({ submittedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "test",
          model: "Test",
          select: "title author imageUrl",
          populate: {
            path: "author",
            model: "User",
            select: "name"
          }
        })
        .lean()
        .exec();
      
      console.log(`✅ Successfully fetched ${results.length} results:`, results);
    } catch (fetchError) {
      console.error("❌ Error fetching results:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch results", details: fetchError instanceof Error ? fetchError.message : String(fetchError) },
        { status: 500 }
      );
    }

    if (!results || !Array.isArray(results)) {
      console.error("❌ Invalid results format:", results);
      return NextResponse.json(
        { error: "Invalid results format from database" },
        { status: 500 }
      );
    }

    console.log("🔍 Processing results...");
    const validResults = results.map(result => {
      if (!result) {
        console.warn("⚠️ Found null result");
        return null;
      }

      if (!result.test || !result.test.author) {
        console.warn("⚠️ Found result with missing test or author data:", result);
        return null;
      }

      // Проверяем наличие обязательных полей
      const requiredFields = {
        test: result.test,
        'test.title': result.test?.title,
        'test.author': result.test?.author,
        'test.author.name': result.test?.author?.name,
        score: result.score,
        maxScore: result.maxScore,
        submittedAt: result.submittedAt
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined)
        .map(([field]) => field);

      if (missingFields.length > 0) {
        console.warn(`⚠️ Result ${result._id} missing fields:`, missingFields);
        return null;
      }

      return {
        _id: result._id,
        test: {
          _id: result.test._id,
          title: result.test.title,
          author: {
            name: result.test.author.name
          },
          imageUrl: result.test.imageUrl || null
        },
        score: result.score,
        maxScore: result.maxScore,
        submittedAt: result.submittedAt
      };
    }).filter(Boolean);

    console.log(`✅ Successfully processed ${validResults.length} valid results:`, validResults);

    const response = {
      results: validResults,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    };

    console.log("📤 Sending response:", response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("❌ Unhandled error in results route:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: "Unhandled server error", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 
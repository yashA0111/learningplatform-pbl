import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import QuizResult from "@/models/QuizResult";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseName, score, totalQuestions, weakPoints } = await req.json();

    if (!courseName || score === undefined || !totalQuestions) {
      return NextResponse.json(
        { error: "courseName, score, and totalQuestions are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await QuizResult.create({
      userId: user._id,
      courseName,
      score,
      totalQuestions,
      weakPoints: weakPoints || [],
    });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    console.error("Error saving quiz result:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to save quiz result", details: errorMessage },
      { status: 500 }
    );
  }
}

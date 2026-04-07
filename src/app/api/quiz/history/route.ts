import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import QuizResult from "@/models/QuizResult";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const results = await QuizResult.find({ userId: user._id })
      .sort({ dateTaken: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Error fetching quiz history:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch quiz history", details: errorMessage },
      { status: 500 }
    );
  }
}

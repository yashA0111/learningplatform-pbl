import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import { courseSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = courseSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { message: firstError },
        { status: 400 }
      );
    }

    const { title, url, platform, tags } = result.data;

    await connectToDatabase();

    const dbUser = await User.findOne({ email: session.user.email });
    if (!dbUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const newCourse = await Course.create({
      title,
      url,
      platform,
      tags,
      submittedBy: dbUser._id,
    });

    // --- SYNC WITH JAVA ENGINE ---
    try {
      const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
      await fetch(`${engineUrl}/api/recommend/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCourse._id.toString(),
          title: newCourse.title,
          url: newCourse.url,
          tags: newCourse.tags,
        }),
      });
      console.log(`[API] Course synced to Java Engine: ${newCourse.title}`);
    } catch (syncError) {
      console.error("[API] Failed to sync course to Java Engine:", syncError);
      // We don't fail the request if sync fails, but we log it
    }
    // ----------------------------

    return NextResponse.json(
      { message: "Course submitted successfully", course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course submission error:", error);
    return NextResponse.json(
      { message: "An error occurred while submitting the course" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all courses, populate the user info
    // Sort by newest first
    const courses = await Course.find({})
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching courses" },
      { status: 500 }
    );
  }
}

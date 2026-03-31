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

    // Format tags (trim whitespace, remove empty)
    const formattedTags = Array.isArray(tags) 
      ? tags.map(tag => tag.trim()).filter(tag => tag !== "")
      : [];

    const newCourse = await Course.create({
      title,
      url,
      platform,
      tags: formattedTags,
      submittedBy: dbUser._id,
    });

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

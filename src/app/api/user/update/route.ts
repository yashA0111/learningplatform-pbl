import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { interests, completedCourses } = body;

  await connectToDatabase();

  const updateData: Record<string, unknown> = {};
  if (interests !== undefined) updateData.interests = interests;
  if (completedCourses !== undefined) updateData.completedCourses = completedCourses;

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: updateData },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    interests: updatedUser.interests,
    completedCourses: updatedUser.completedCourses,
  });
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { otpSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = otpSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { email, otp } = result.data;

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ message: "No OTP found. Please request a new one." }, { status: 400 });
    }

    // Check expiry
    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    // Compare OTP
    const isValidOtp = await bcrypt.compare(otp, user.otp);
    if (!isValidOtp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // Mark user as verified and clear OTP fields
    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

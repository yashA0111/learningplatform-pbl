import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: "No account found with this email" }, { status: 404 });
    }

    if (user.verified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const { data, error: resendError } = await resend.emails.send({
      from: "LearnPath <onboarding@resend.dev>",
      to: email,
      subject: "Your LearnPath Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4f46e5;">LearnPath Verification</h2>
          <p>Your new verification code is:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend API Error:", resendError);
      return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
    }

    console.log("OTP Resent successfully, Resend ID:", data?.id);

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { signupSchema } from "@/lib/validations";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { name, email, password } = result.data;

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    // If user exists and IS verified → reject
    if (existingUser && existingUser.verified) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingUser && !existingUser.verified) {
      // User exists but NOT verified → update their data and resend OTP
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.otp = hashedOtp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      // New user → create unverified account
      await User.create({
        name,
        email,
        password: hashedPassword,
        verified: false,
        otp: hashedOtp,
        otpExpiry,
      });
    }

    // Send OTP email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: "LearnPath <onboarding@resend.dev>",
      to: email,
      subject: "Your LearnPath Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #4f46e5;">Welcome to LearnPath!</h2>
          <p>Your verification code is:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend API Error:", resendError);
      return NextResponse.json({ message: "Failed to send verification email" }, { status: 500 });
    }

    console.log("Email sent successfully, Resend ID:", data?.id);

    return NextResponse.json({ message: "OTP sent to your email" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

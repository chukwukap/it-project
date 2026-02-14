import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expiresAt,
      },
    });

    // Send email
    const result = await sendPasswordResetEmail(email, token);

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

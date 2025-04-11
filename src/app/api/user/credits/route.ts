import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "../../../../../models/user";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    let user = await User.findOne({ userId });
    
    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        userId,
        credits: 100,
        totalQuestionsGenerated: 0
      });
    }

    return NextResponse.json({
      credits: user.credits,
      totalQuestionsGenerated: user.totalQuestionsGenerated
    });
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

// Deduct credits
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();
    
    await connectToDatabase();
    
    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.credits < amount) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    user.credits -= amount;
    user.totalQuestionsGenerated += amount;
    await user.save();

    return NextResponse.json({
      credits: user.credits,
      totalQuestionsGenerated: user.totalQuestionsGenerated
    });
  } catch (error) {
    console.error("Error updating credits:", error);
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 }
    );
  }
} 
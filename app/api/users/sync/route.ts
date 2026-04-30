import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.log("No userId found in auth()");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Syncing user:", userId);
    await connectDB();

    // Get user from Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      console.error("CLERK_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const clerkUserResponse = await fetch(
      `https://api.clerk.com/v1/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }
    );

    if (!clerkUserResponse.ok) {
      console.error("Failed to fetch user from Clerk:", clerkUserResponse.status);
      return NextResponse.json(
        { error: "Failed to fetch user from Clerk" },
        { status: 500 }
      );
    }

    const clerkUser = await clerkUserResponse.json();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "User not found in Clerk" },
        { status: 404 }
      );
    }

    const email = clerkUser.email_addresses[0]?.email_address || "";
    const name = clerkUser.full_name || clerkUser.first_name || "User";

    // Find or create user in database
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (OAuth users don't need password)
      // Explicitly omit password field for Clerk-authenticated users
      const userData: any = {
        email,
        name,
        skills: {},
        streak: 0,
        xp: 0,
        badges: [],
      };
      // Don't include password field at all
      user = await User.create(userData);
    } else {
      // Update name if changed
      if (user.name !== name) {
        user.name = name;
        await user.save();
      }
    }

    return NextResponse.json({
      user: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        skills: user.skills,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges,
      },
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}


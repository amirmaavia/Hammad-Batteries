import { testDatabaseConnection } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const isConnected = await testDatabaseConnection();

    if (isConnected) {
      return NextResponse.json(
        {
          success: true,
          message: "Database connected successfully",
          uri: process.env.MONGODB_URI,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database connection test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Connection test failed",
      },
      { status: 500 }
    );
  }
}

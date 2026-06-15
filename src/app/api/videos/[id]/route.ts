import { getProductVideoById } from "@/lib/db/videos";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const video = await getProductVideoById(id);

    if (!video) {
      return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: video._id?.toString(),
        productId: video.productId || "",
        productName: video.productName,
        video: video.data,
      },
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch video" },
      { status: 500 }
    );
  }
}

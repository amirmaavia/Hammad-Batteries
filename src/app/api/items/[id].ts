import { updateItem, getItemById } from "@/lib/db/crud";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { _id: string } }) {
  try {
    const { _id } = await Promise.resolve(params);
    const body = await req.json();

    const item = await getItemById(_id);
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 }
      );
    }

    const updated = await updateItem(_id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update item",
        },
        { status: 500 }
      );
    }

    const updatedItem = await getItemById(_id);
    return NextResponse.json(
      {
        success: true,
        data: updatedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update item",
      },
      { status: 500 }
    );
  }
}

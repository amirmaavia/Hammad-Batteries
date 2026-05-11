import { deleteItem } from "@/lib/db/crud";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await Promise.resolve(params);

    const deleted = await deleteItem(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Item deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete item",
      },
      { status: 500 }
    );
  }
}

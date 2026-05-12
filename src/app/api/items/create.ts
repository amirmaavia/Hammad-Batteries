import { createItem } from "@/lib/db/crud";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, subCategory, defaultPrice, originalPrice, stock, image } = body;

    if (!name || !brand || !subCategory || !defaultPrice || originalPrice || !stock) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const id = await createItem({
      name,
      brand,
      subCategory,
      defaultPrice,
      originalPrice,
      stock,
      image: image || "",
    });

    return NextResponse.json(
      {
        success: true,
        data: { _id: id, name, brand, subCategory, defaultPrice, originalPrice, stock, image },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
      },
      { status: 500 }
    );
  }
}

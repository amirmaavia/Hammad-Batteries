import { loadCatalogItemsById } from "@/lib/catalog";
import { getAllItems, createItem } from "@/lib/db/crud";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const items = await getAllItems();
    return NextResponse.json(
      {
        success: true,
        data: items,
        count: items.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch items",
      },
      { status: 500 }
    );
  }
}
export async function GETBYID(req: Request, { params }: { params: { id: string } }) {
  try {
    const item = await loadCatalogItemsById(params.id);
    if (!item) {
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
        data: item,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch item",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, subCategory, description, defaultPrice, originalPrice, stock, image, imageFit } = body;

    if (!name || !brand || !subCategory || !defaultPrice || !originalPrice || !stock) {
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
      description: description || "",
      originalPrice,
      defaultPrice,
      stock,
      image: image || "",
      imageFit: imageFit || "fit",
    });

    return NextResponse.json(
      {
        success: true,
        data: { _id: id, name, brand, subCategory, description: description || "", defaultPrice, originalPrice, stock, image, imageFit: imageFit || "fit" },
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

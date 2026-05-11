import { insertManyItems, getAllItems } from "@/lib/db/crud";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if items already exist
    const existingItems = await getAllItems();

    if (existingItems.length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Database already has items",
          count: existingItems.length,
          data: existingItems,
        },
        { status: 200 }
      );
    }

    // Insert default items if database is empty
    const defaultItems = [
      {
        name: "Samsung Galaxy S24 Ultra Battery",
        brand: "Samsung",
        subCategory: "S Series",
        price: "Rs. 14,999",
        stock: "In Stock",
        image: "",
      },
      {
        name: "Samsung Galaxy Note 20 Battery",
        brand: "Samsung",
        subCategory: "Note Series",
        price: "Rs. 10,500",
        stock: "In Stock",
        image: "",
      },
      {
        name: "Samsung Galaxy A54 Battery",
        brand: "Samsung",
        subCategory: "A Series",
        price: "Rs. 8,999",
        stock: "In Stock",
        image: "",
      },
      {
        name: "iPhone 15 Pro Max Battery",
        brand: "Apple",
        subCategory: "Pro Max Series",
        price: "Rs. 18,500",
        stock: "Out of Stock",
        image: "",
      },
      {
        name: "iPhone 14 Pro Battery",
        brand: "Apple",
        subCategory: "Pro Series",
        price: "Rs. 16,999",
        stock: "In Stock",
        image: "",
      },
      {
        name: "OnePlus 12 Battery",
        brand: "OnePlus",
        subCategory: "OnePlus 12 Series",
        price: "Rs. 7,999",
        stock: "In Stock",
        image: "",
      },
    ];

    const insertedIds = await insertManyItems(defaultItems);

    const allItems = await getAllItems();

    return NextResponse.json(
      {
        success: true,
        message: `Inserted ${insertedIds.length} default items into database`,
        insertedCount: insertedIds.length,
        data: allItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize database",
      },
      { status: 500 }
    );
  }
}

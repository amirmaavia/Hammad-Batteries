// import { insertManyItems, getAllItems } from "@/lib/db/crud";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     // Check if items already exist
//     const existingItems = await getAllItems();

//     if (existingItems.length > 0) {
//       return NextResponse.json(
//         {
//           success: true,
//           message: "Database already has items",
//           count: existingItems.length,
//           data: existingItems,
//         },
//         { status: 200 }
//       );
//     }

//     // Insert default items if database is empty
//     const defaultItems = [
//       {
//         name: "Samsung Galaxy S24 Ultra Battery",
//         brand: "Samsung",
//         subCategory: "S Series",
//         defaultPrice: "Rs. 14,999",
//         originalPrice: "Rs. 16,999",
//         price: "Rs. 14,999",
//         stock: "In Stock",
//         image: "",}
//     ];

//     const insertedIds = await insertManyItems(defaultItems);

//     const allItems = await getAllItems();

//     return NextResponse.json(
//       {
//         success: true,
//         message: `Inserted ${insertedIds.length} default items into database`,
//         insertedCount: insertedIds.length,
//         data: allItems,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error initializing database:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to initialize database",
//       },
//       { status: 500 }
//     );
//   }
// }

import { createItem, updateItem } from "@/lib/db/crud";
import { createProductVideo } from "@/lib/db/videos";
import { NextResponse } from "next/server";

const productImages = (image?: string, images?: string[]) =>
  Array.from(new Set([...(Array.isArray(images) ? images : []), image || ""].map((value) => value.trim()).filter(Boolean)));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, subCategory, description, defaultPrice, originalPrice, stock, image, images, video, videoId, featured, imageFit } = body;
    const galleryImages = productImages(image, images);
    const primaryImage = galleryImages[0] || "";

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
      image: primaryImage,
      images: galleryImages,
      video: "",
      videoId: videoId || "",
      featured: Boolean(featured),
      imageFit: imageFit || "fit",
    });

    const savedVideoId = video
      ? await createProductVideo({
          productId: id,
          productName: name,
          data: video,
        })
      : videoId || "";

    if (savedVideoId !== (videoId || "")) {
      await updateItem(id, { video: "", videoId: savedVideoId });
    }

    return NextResponse.json(
      {
        success: true,
        data: { _id: id, name, brand, subCategory, description: description || "", defaultPrice, originalPrice, stock, image: primaryImage, images: galleryImages, video: "", videoId: savedVideoId, featured: Boolean(featured), imageFit: imageFit || "fit" },
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

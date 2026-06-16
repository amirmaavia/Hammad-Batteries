import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getItemById } from "@/lib/db/crud";

type ItemLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

const cleanKeywords = (keywords?: string) =>
  (keywords || "")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

const usableImage = (image?: string) => {
  if (!image) return "/icon.png";
  return image.startsWith("http") || image.startsWith("/") ? image : "/icon.png";
};

export async function generateMetadata({ params }: Omit<ItemLayoutProps, "children">): Promise<Metadata> {
  const { id } = await params;

  try {
    const item = await getItemById(id);

    if (!item) {
      return {
        title: "Product Not Found",
        description: "This product is not currently available at Hammad Batteries.",
      };
    }

    const title = item.seoTitle || item.name;
    const description =
      item.seoDescription ||
      item.description ||
      `Buy ${item.name} from Hammad Batteries. Premium mobile batteries and accessories in Pakistan.`;
    const image = usableImage(item.image || item.images?.[0]);
    const keywords = cleanKeywords(item.seoKeywords);

    return {
      title,
      description,
      keywords: keywords.length ? keywords : [item.name, item.brand, item.subCategory, "Hammad Batteries"].filter(Boolean),
      alternates: {
        canonical: `/items/${id}`,
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `/items/${id}`,
        images: [
          {
            url: image,
            alt: item.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Product",
      description: "View product details at Hammad Batteries.",
    };
  }
}

export default function ItemLayout({ children }: ItemLayoutProps) {
  return children;
}

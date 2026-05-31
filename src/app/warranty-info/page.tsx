import type { Metadata } from "next";
import Footer from "@/components/Footer";
import InfoPage from "@/components/InfoPage";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Warranty Info | Hammad Batteries",
  description: "Warranty information for Hammad Batteries mobile battery products.",
};

export default function WarrantyInfoPage() {
  return (
    <>
      <Navbar />
      <InfoPage
        eyebrow="Warranty Info"
        title="Warranty support for genuine product issues."
        intro="Warranty coverage depends on the product type and supplier terms. Contact us with your order details before opening, repairing, or modifying the battery."
        sections={[
          {
            title: "Coverage",
            body: "Warranty support generally applies to confirmed manufacturing faults, abnormal backup issues, or product defects reported within the applicable warranty period.",
          },
          {
            title: "What is not covered",
            body: "Physical damage, incorrect installation, water damage, short circuit damage, burns, swelling from misuse, or opened products are not covered.",
          },
          {
            title: "Required details",
            body: "Please keep your purchase proof and share clear photos or videos of the issue so our team can verify the product and guide you properly.",
          },
          {
            title: "Resolution",
            body: "After verification, eligible warranty cases may be handled through replacement, repair guidance, or supplier review depending on the product.",
          },
        ]}
      />
      <Footer />
    </>
  );
}

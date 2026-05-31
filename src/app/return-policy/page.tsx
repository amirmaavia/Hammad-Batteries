import type { Metadata } from "next";
import Footer from "@/components/Footer";
import InfoPage from "@/components/InfoPage";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Return Policy | Hammad Batteries",
  description: "Return policy for mobile batteries purchased from Hammad Batteries.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <Navbar />
      <InfoPage
        eyebrow="Return Policy"
        title="Simple returns for eligible battery orders."
        intro="Please check your product as soon as you receive it. If there is a mismatch, visible damage, or order issue, contact us quickly so we can help."
        sections={[
          {
            title: "Return window",
            body: "Return requests should be made within 7 days of receiving the product. The item should be unused, undamaged, and returned with its original packing where possible.",
          },
          {
            title: "Eligible reasons",
            body: "Returns may be accepted for wrong product, damaged product received, or a confirmed compatibility issue that was reported before installation.",
          },
          {
            title: "Non-returnable cases",
            body: "Installed, physically damaged, swollen due to misuse, water-damaged, or tampered batteries may not be eligible for return.",
          },
          {
            title: "How to request",
            body: "Share your order details, product photos, and issue description on WhatsApp. Our team will review and guide you on the next step.",
          },
        ]}
      />
      <Footer />
    </>
  );
}

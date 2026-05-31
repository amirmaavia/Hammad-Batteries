import type { Metadata } from "next";
import Footer from "@/components/Footer";
import InfoPage from "@/components/InfoPage";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About Us | Hammad Batteries",
  description: "Learn about Hammad Batteries and our mobile battery shop in Karachi.",
};

export default function AboutUsPage() {
  return (
    <>
      <Navbar />
      <InfoPage
        eyebrow="About Hammad Batteries"
        title="Reliable mobile batteries with local support."
        intro="Hammad Batteries helps customers find compatible replacement batteries for Samsung, Apple, Oppo, Vivo, Huawei, Xiaomi, and other popular phones."
        sections={[
          {
            title: "What we sell",
            body: "We focus on mobile phone batteries and related support, with product listings built around common models and practical availability checks.",
          },
          {
            title: "How we help",
            body: "If you are unsure which battery fits your phone, our team can guide you through WhatsApp before you place an order.",
          },
          {
            title: "Where we are",
            body: "You can visit us at Ub20 Star City Mall, Saddar Mobile Market, Karachi, or contact us online for product assistance.",
          },
          {
            title: "Our promise",
            body: "We aim to keep pricing clear, confirm availability quickly, and support customers after purchase with return and warranty guidance.",
          },
        ]}
      />
      <Footer />
    </>
  );
}

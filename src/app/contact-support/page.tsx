import type { Metadata } from "next";
import Footer from "@/components/Footer";
import InfoPage from "@/components/InfoPage";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Contact Support | Hammad Batteries",
  description: "Contact Hammad Batteries for mobile battery support, orders, and warranty help.",
};

export default function ContactSupportPage() {
  return (
    <>
      <Navbar />
      <InfoPage
        eyebrow="Contact Support"
        title="Get help with products, orders, and warranty questions."
        intro="Message us before ordering if you need compatibility help. For existing orders, send your order details so we can respond faster."
        actionLabel="Browse store"
        actionHref="/store"
        sections={[
          {
            title: "WhatsApp support",
            body: "For fastest help, send your phone model, battery code if available, and a photo of the old battery or phone back label.",
          },
          {
            title: "Phone support",
            body: "Call us during shop hours for availability checks, product guidance, and urgent order questions.",
          },
          {
            title: "Visit our shop",
            body: "Ub20 Star City Mall, Saddar Mobile Market, Karachi. Bring your phone model details for accurate compatibility support.",
          },
          {
            title: "Email",
            body: "You can also contact us at realhammad222@gmail.com for non-urgent questions and documentation requests.",
          },
        ]}
      />
      <Footer />
    </>
  );
}

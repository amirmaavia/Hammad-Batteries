import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { DISPLAY_PHONE_NUMBER, getWhatsAppLink, WHATSAPP_MESSAGES } from "@/lib/site";

type InfoSection = {
  title: string;
  body: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  actionLabel?: string;
  actionHref?: string;
};

export default function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  actionLabel = "Contact support",
  actionHref = "/contact-support",
}: InfoPageProps) {
  return (
    <main className="page-shell">
      <section style={{ marginBottom: "2.5rem" }}>
        <p className="theme-muted" style={{ marginBottom: "0.75rem", fontWeight: 700 }}>
          {eyebrow}
        </p>
        <h1 className="title" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          {title}
        </h1>
        <p className="subtitle" style={{ margin: 0, maxWidth: "760px" }}>
          {intro}
        </p>
      </section>

      <section className="grid grid-cols-2" style={{ alignItems: "stretch", marginBottom: "2rem" }}>
        {sections.map((section) => (
          <article className="theme-card" key={section.title}>
            <h2 style={{ color: "var(--heading)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              {section.title}
            </h2>
            <p className="theme-muted" style={{ lineHeight: 1.7 }}>
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="theme-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ color: "var(--heading)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
            Need quick help?
          </h2>
          <p className="theme-muted">Call or message us and we will guide you before you order.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <a className="btn btn-whatsapp" href={getWhatsAppLink(WHATSAPP_MESSAGES.productSupport)} target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            WhatsApp
          </a>
          <a className="btn btn-outline" href={`tel:${DISPLAY_PHONE_NUMBER}`}>
            <Phone size={16} />
            {DISPLAY_PHONE_NUMBER}
          </a>
          <Link className="btn btn-primary" href={actionHref}>
            {actionLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

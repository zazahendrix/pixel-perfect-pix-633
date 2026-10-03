import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/site/Navbar";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Curriculo" },
      { name: "description", content: "Nos offres arrivent bientôt." },
      { property: "og:title", content: "Tarifs — Curriculo" },
      { property: "og:description", content: "Nos offres arrivent bientôt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-5xl">Tarifs</h1>
        <p className="mt-4 text-muted-foreground">Nos offres arrivent très bientôt. En attendant, la création de CV est gratuite.</p>
      </section>
      <Footer />
    </div>
  ),
});

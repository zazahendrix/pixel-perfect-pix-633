import { createFileRoute } from "@tanstack/react-router";
import { Navbar, Footer } from "@/components/site/Navbar";
import { TemplatesShowcase } from "./index";

export const Route = createFileRoute("/modeles")({
  head: () => ({
    meta: [
      { title: "Modèles de CV — Curriculo" },
      { name: "description", content: "Découvrez nos modèles de CV Moderne, Classique et Minimaliste." },
      { property: "og:title", content: "Modèles de CV — Curriculo" },
      { property: "og:description", content: "Trois modèles de CV professionnels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="min-h-screen"><Navbar /><TemplatesShowcase /><Footer /></div>
  ),
});

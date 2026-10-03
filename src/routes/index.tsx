import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutTemplate, Zap, Palette, CloudCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar, Footer } from "@/components/site/Navbar";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { templates } from "@/components/resume/templates/registry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curriculo — Créez un CV professionnel en quelques minutes" },
      { name: "description", content: "Choisissez un modèle, ajoutez vos informations et personnalisez votre CV simplement." },
      { property: "og:title", content: "Curriculo — CV professionnel en ligne" },
      { property: "og:description", content: "Créez un CV élégant en quelques minutes avec nos modèles professionnels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const benefits = [
  { icon: LayoutTemplate, title: "Modèles professionnels", text: "Des mises en page conçues pour plaire aux recruteurs." },
  { icon: Zap, title: "Création simple et rapide", text: "Un parcours guidé, sans compétence technique." },
  { icon: Palette, title: "Personnalisation", text: "Couleurs, typographie : votre CV vous ressemble." },
  { icon: CloudCheck, title: "Sauvegarde automatique", text: "Vos CV sont enregistrés en toute sécurité." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex rounded-full border bg-card px-3 py-1 text-xs font-semibold text-accent-foreground">
              Nouveau · 3 modèles disponibles
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-6xl">
              Créez un CV professionnel <em className="text-gradient">en quelques minutes.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Choisissez un modèle, ajoutez vos informations et personnalisez votre CV simplement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg"><Link to="/signup">Créer mon CV</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/modeles">Voir les modèles</Link></Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rotate-3 rounded-3xl bg-gradient-primary opacity-15" />
            <ResumeRenderer template="modern" scale={14} className="relative shadow-elegant" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center font-display text-4xl">Tout ce qu'il faut pour se démarquer</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><b.icon className="h-5 w-5" /></div>
              <h3 className="mt-5 font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <TemplatesShowcase />

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="rounded-3xl bg-gradient-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-4xl">Prêt à décrocher votre prochain poste ?</h2>
          <Button asChild size="lg" variant="outline" className="mt-8 text-foreground"><Link to="/signup">Créer mon CV gratuitement</Link></Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function TemplatesShowcase() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="text-center font-display text-4xl">Nos modèles</h2>
        <p className="mt-3 text-center text-muted-foreground">Trois styles soigneusement conçus, pour chaque profil.</p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div key={t.id} className="group">
              <div className="rounded-2xl border bg-card p-4 shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-elegant">
                <ResumeRenderer template={t.id} scale={11} />
              </div>
              <h3 className="mt-4 font-semibold">{t.label}</h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

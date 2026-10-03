import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ResumeLoader } from "@/components/resume/ResumeLoader";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { getTemplate } from "@/components/resume/templates/registry";

export const Route = createFileRoute("/_authenticated/resume/$id/edit")({
  head: () => ({ meta: [{ title: "Modifier le CV — Curriculo" }] }),
  component: Edit,
});

function Edit() {
  const { id } = Route.useParams();
  return (
    <ResumeLoader id={id}>
      {(r) => (
        <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_420px]">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mes CV</Link>
            <h1 className="mt-4 font-display text-4xl">{r.name}</h1>
            <p className="mt-1 text-muted-foreground">Modèle {getTemplate(r.template).label}</p>
            <div className="mt-8 rounded-2xl border bg-card p-8 shadow-soft">
              <h2 className="font-semibold">L'éditeur arrive bientôt</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Vous pourrez bientôt renseigner vos informations personnelles, expériences, formations, compétences et plus encore, avec un aperçu en temps réel.
              </p>
            </div>
          </div>
          <ResumeRenderer template={r.template} scale={11} theme={{ primaryColor: r.primary_color, secondaryColor: r.secondary_color, fontFamily: r.font_family }} />
        </main>
      )}
    </ResumeLoader>
  );
}

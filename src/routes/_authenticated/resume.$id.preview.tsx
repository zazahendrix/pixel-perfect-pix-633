import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ResumeLoader } from "@/components/resume/ResumeLoader";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { normalizeResumeData } from "@/types/resume";

export const Route = createFileRoute("/_authenticated/resume/$id/preview")({
  head: () => ({ meta: [{ title: "Aperçu du CV — Curriculo" }] }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  return (
    <ResumeLoader id={id}>
      {(r) => (
        <main className="mx-auto max-w-3xl px-5 py-10">
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mes CV</Link>
          <h1 className="mb-6 mt-4 font-display text-3xl">{r.name}</h1>
          <ResumeRenderer template={r.template} data={normalizeResumeData(r.content)} scale={18} className="shadow-elegant"
            theme={{ primaryColor: r.primary_color, secondaryColor: r.secondary_color, fontFamily: r.font_family }} />
        </main>
      )}
    </ResumeLoader>
  );
}

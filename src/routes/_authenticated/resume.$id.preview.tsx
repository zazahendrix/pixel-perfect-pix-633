import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useRef } from "react";
import { DownloadPdfButton } from "@/components/resume/DownloadPdfButton";
import type { Resume } from "@/types/resume";
import { ResumeLoader } from "@/components/resume/ResumeLoader";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { normalizeResumeData } from "@/types/resume";

export const Route = createFileRoute("/_authenticated/resume/$id/preview")({
  head: () => ({ meta: [{ title: "Aperçu du CV — Curriculo" }] }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  return <ResumeLoader id={id}>{(r) => <PreviewBody r={r} />}</ResumeLoader>;
}

function PreviewBody({ r }: { r: Resume }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mes CV</Link>
      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{r.name}</h1>
        <DownloadPdfButton target={ref} filename={r.name} variant="hero" />
      </div>
      <div ref={ref}>
        <ResumeRenderer template={r.template} data={normalizeResumeData(r.content)} scale={18} className="rounded-none shadow-elegant"
          theme={{ primaryColor: r.primary_color, secondaryColor: r.secondary_color, fontFamily: r.font_family }} />
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { DownloadPdfButton } from "@/components/resume/DownloadPdfButton";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResumeLoader } from "@/components/resume/ResumeLoader";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { ResumeEditor } from "@/components/resume/editor/ResumeEditor";
import { getTemplate } from "@/components/resume/templates/registry";
import { saveResumeContent } from "@/lib/resumes";
import { normalizeResumeData, type Resume } from "@/types/resume";

export const Route = createFileRoute("/_authenticated/resume/$id/edit")({
  head: () => ({ meta: [{ title: "Modifier le CV — Curriculo" }] }),
  validateSearch: (s: Record<string, unknown>): { imported?: boolean } => (s["imported"] === true || s["imported"] === "true" ? { imported: true } : {}),
  component: Edit,
});

function Edit() {
  const { id } = Route.useParams();
  return <ResumeLoader id={id}>{(r) => <EditorPage resume={r} />}</ResumeLoader>;
}

function EditorPage({ resume }: { resume: Resume }) {
  const qc = useQueryClient();
  const [data, setData] = useState(() => normalizeResumeData(resume.content));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const { imported } = Route.useSearch();
  const [highlight, setHighlight] = useState(!!imported);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaving(true);
    try {
      await saveResumeContent(resume.id, data);
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["resumes"] });
      qc.invalidateQueries({ queryKey: ["resume", resume.id] });
      toast.success("Modifications enregistrées");
    } catch {
      toast.error("L'enregistrement a échoué");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mes CV</Link>
          <h1 className="mt-3 font-display text-4xl">{resume.name}</h1>
          <p className="text-sm text-muted-foreground">Modèle {getTemplate(resume.template).label}{dirty && " · modifications non enregistrées"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
        <DownloadPdfButton target={pdfRef} filename={resume.name} />
        <Button variant="hero" onClick={save} disabled={saving || !dirty}><Save /> {saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </div>
      {highlight && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-accent/50 p-4 text-sm text-accent-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">Les champs surlignés ont été importés depuis votre CV. Vérifiez-les et complétez ce qui manque avant d'enregistrer.</p>
          <button className="font-semibold" onClick={() => setHighlight(false)}>Masquer</button>
        </div>
      )}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_440px]">
        <ResumeEditor highlight={highlight} data={data} onChange={(d) => { setData(d); setDirty(true); }} />
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu en direct</p>
          <div ref={pdfRef}><ResumeRenderer template={resume.template} data={data} scale={11} className="shadow-elegant rounded-none"
            theme={{ primaryColor: resume.primary_color, secondaryColor: resume.secondary_color, fontFamily: resume.font_family }} /></div>
        </div>
      </div>
    </main>
  );
}

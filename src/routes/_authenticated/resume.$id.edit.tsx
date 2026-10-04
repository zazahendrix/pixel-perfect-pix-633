import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
        <Button variant="hero" onClick={save} disabled={saving || !dirty}><Save /> {saving ? "Enregistrement…" : "Enregistrer"}</Button>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_440px]">
        <ResumeEditor data={data} onChange={(d) => { setData(d); setDirty(true); }} />
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aperçu en direct</p>
          <ResumeRenderer template={resume.template} data={data} scale={11} className="shadow-elegant"
            theme={{ primaryColor: resume.primary_color, secondaryColor: resume.secondary_color, fontFamily: resume.font_family }} />
        </div>
      </div>
    </main>
  );
}

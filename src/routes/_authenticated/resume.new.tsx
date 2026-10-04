import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { templates } from "@/components/resume/templates/registry";
import { createResume } from "@/lib/resumes";
import type { TemplateId } from "@/types/resume";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/resume/new")({
  head: () => ({ meta: [{ title: "Nouveau CV — Curriculo" }] }),
  component: NewResume,
});

function NewResume() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Donnez un nom à votre CV"); return; }
    if (trimmed.length > 100) { toast.error("Nom trop long"); return; }
    setLoading(true);
    try {
      const r = await createResume({ name: trimmed, template });
      navigate({ to: "/resume/$id/edit", params: { id: r.id } });
    } catch {
      toast.error("Impossible de créer le CV");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-4xl">Quel type de CV souhaitez-vous créer ?</h1>
      <div className="mt-8 max-w-md space-y-2">
        <Label htmlFor="name">Nom du CV</Label>
        <Input id="name" placeholder="CV Développeur Web" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
      </div>
      <h2 className="mt-10 font-semibold">Choisissez un modèle</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-3">
        {templates.map((t) => (
          <button key={t.id} type="button" onClick={() => setTemplate(t.id)}
            className={cn("relative rounded-2xl border-2 bg-card p-3 text-left transition", template === t.id ? "border-primary shadow-elegant" : "border-transparent shadow-soft hover:border-border")}>
            {template === t.id && <span className="absolute right-4 top-4 z-10 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></span>}
            <ResumeRenderer template={t.id} scale={9} />
            <p className="mt-3 font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <Button variant="hero" size="lg" onClick={submit} disabled={loading}>{loading ? "Création…" : "Créer mon CV"}</Button>
      </div>
    </main>
  );
}

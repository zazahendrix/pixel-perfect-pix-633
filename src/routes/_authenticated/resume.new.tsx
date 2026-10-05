import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Check, FilePlus2, FileUp, Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { templates } from "@/components/resume/templates/registry";
import { createResume, saveResumeContent } from "@/lib/resumes";
import { extractCv } from "@/lib/cv-import.functions";
import { prepareCvFile, validateCvFile } from "@/lib/cv-file";
import { normalizeResumeData, type TemplateId } from "@/types/resume";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/resume/new")({
  head: () => ({ meta: [{ title: "Nouveau CV — Curriculo" }] }),
  component: NewResume,
});

type Mode = "scratch" | "import";

function NewResume() {
  const navigate = useNavigate();
  const extract = useServerFn(extractCv);
  const fileInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("scratch");
  const [name, setName] = useState("");
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<"" | "reading" | "analyzing" | "creating">("");

  function pickFile(f: File | undefined) {
    if (!f) return;
    const err = validateCvFile(f);
    setFileError(err ?? "");
    setFile(err ? null : f);
    if (!err && !name.trim()) setName(f.name.replace(/\.(pdf|docx)$/i, "").slice(0, 100));
  }

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Donnez un nom à votre CV"); return; }
    if (trimmed.length > 100) { toast.error("Nom trop long"); return; }
    if (mode === "import" && !file) { setFileError("Choisissez un fichier PDF ou Word."); return; }

    try {
      if (mode === "scratch") {
        setStatus("creating");
        const r = await createResume({ name: trimmed, template });
        navigate({ to: "/resume/$id/edit", params: { id: r.id } });
        return;
      }
      setStatus("reading");
      const prepared = await prepareCvFile(file!);
      setStatus("analyzing");
      const result = await extract({ data: prepared });
      if (!result.ok) { setFileError(result.error); setStatus(""); return; }
      const content = normalizeResumeData(JSON.parse(result.json));
      setStatus("creating");
      const r = await createResume({ name: trimmed, template });
      await saveResumeContent(r.id, content);
      navigate({ to: "/resume/$id/edit", params: { id: r.id }, search: { imported: true } });
    } catch (e) {
      setFileError(e instanceof Error && e.message.includes("Word") ? e.message : "Le fichier n'a pas pu être traité. Vérifiez qu'il n'est pas protégé ou endommagé.");
      setStatus("");
    }
  }

  const busy = status !== "";
  const statusLabel = { reading: "Lecture du fichier…", analyzing: "Analyse de votre CV…", creating: "Création du CV…", "": "" }[status];

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <h1 className="font-display text-4xl">Quel type de CV souhaitez-vous créer ?</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {([
          { id: "scratch", icon: FilePlus2, title: "Partir de zéro", text: "Remplissez votre CV étape par étape." },
          { id: "import", icon: FileUp, title: "Importer un CV existant", text: "Envoyez un PDF ou Word, nous préremplissons les champs." },
        ] as const).map((o) => (
          <button key={o.id} type="button" disabled={busy} onClick={() => setMode(o.id)}
            className={cn("flex items-start gap-4 rounded-2xl border-2 bg-card p-5 text-left transition", mode === o.id ? "border-primary shadow-elegant" : "border-transparent shadow-soft hover:border-border")}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><o.icon className="h-5 w-5" /></span>
            <span><span className="block font-semibold">{o.title}</span><span className="text-sm text-muted-foreground">{o.text}</span></span>
          </button>
        ))}
      </div>

      {mode === "import" && (
        <div className="mt-6">
          <input ref={fileInput} type="file" className="hidden" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); if (!busy) pickFile(e.dataTransfer.files[0]); }}
            className="flex flex-col items-center rounded-2xl border-2 border-dashed border-primary/30 bg-card p-8 text-center">
            {busy && status !== "creating" ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 font-semibold">{statusLabel}</p>
                <p className="text-sm text-muted-foreground">Cela peut prendre jusqu'à une minute.</p>
              </>
            ) : file ? (
              <div className="flex items-center gap-3">
                <FileUp className="h-5 w-5 text-primary" />
                <span className="font-medium">{file.name}</span>
                <button aria-label="Retirer le fichier" onClick={() => setFile(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-primary" />
                <p className="mt-3 font-semibold">Glissez votre CV ici</p>
                <p className="text-sm text-muted-foreground">PDF ou Word (.docx), 10 Mo maximum</p>
                <Button variant="outline" className="mt-4" onClick={() => fileInput.current?.click()}>Choisir un fichier</Button>
              </>
            )}
          </div>
          {fileError && <p className="mt-2 text-sm text-destructive">{fileError}</p>}
        </div>
      )}

      <div className="mt-8 max-w-md space-y-2">
        <Label htmlFor="name">Nom du CV</Label>
        <Input id="name" placeholder="CV Développeur Web" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} disabled={busy} />
      </div>
      <h2 className="mt-10 font-semibold">Choisissez un modèle</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-3">
        {templates.map((t) => (
          <button key={t.id} type="button" onClick={() => setTemplate(t.id)} disabled={busy}
            className={cn("relative rounded-2xl border-2 bg-card p-3 text-left transition", template === t.id ? "border-primary shadow-elegant" : "border-transparent shadow-soft hover:border-border")}>
            {template === t.id && <span className="absolute right-4 top-4 z-10 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" /></span>}
            <ResumeRenderer template={t.id} scale={9} />
            <p className="mt-3 font-semibold">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-end">
        <Button variant="hero" size="lg" onClick={submit} disabled={busy}>
          {busy ? statusLabel : mode === "import" ? "Importer et créer mon CV" : "Créer mon CV"}
        </Button>
      </div>
    </main>
  );
}

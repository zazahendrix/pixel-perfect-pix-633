import { useState, type ReactNode } from "react";
import { Copy, Eye, EyeOff, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BUILTIN_SECTIONS, defaultSections, newId, type Experience, type ResumeData, type SectionConfig } from "@/types/resume";
import { SortableList } from "./Sortable";
import { ExperienceItem, Suggestion } from "./ExperienceItem";
import { useAssist } from "./useAssist";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  /** Highlights non-empty fields after an import so the user can review them. */
  highlight?: boolean;
}

function Field({ label, value, onChange, placeholder, type = "text", hl }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; hl: (v: string) => string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input className={hl(value)} type={type} value={value} placeholder={placeholder} maxLength={200} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ResumeEditor({ data, onChange, highlight = false }: Props) {
  const hl = (v: string) => (highlight && v.trim() ? "border-primary/50 bg-accent/40" : "");
  const sections = data.sections?.length ? data.sections : defaultSections();
  const setSections = (s: SectionConfig[]) => onChange({ ...data, sections: s });
  const patchSection = (id: string, p: Partial<SectionConfig>) => setSections(sections.map((s) => (s.id === id ? { ...s, ...p } : s)));
  const setPersonal = (k: keyof ResumeData["personal"], v: string) => onChange({ ...data, personal: { ...data.personal, [k]: v } });

  const missing = BUILTIN_SECTIONS.filter((b) => !sections.some((s) => s.type === b.type));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field hl={hl} label="Prénom" value={data.personal.firstName} onChange={(v) => setPersonal("firstName", v)} />
          <Field hl={hl} label="Nom" value={data.personal.lastName} onChange={(v) => setPersonal("lastName", v)} />
          <div className="sm:col-span-2"><Field hl={hl} label="Intitulé du poste" value={data.personal.title} placeholder="Développeur Web" onChange={(v) => setPersonal("title", v)} /></div>
          <Field hl={hl} label="E-mail" type="email" value={data.personal.email} onChange={(v) => setPersonal("email", v)} />
          <Field hl={hl} label="Téléphone" value={data.personal.phone} onChange={(v) => setPersonal("phone", v)} />
          <div className="sm:col-span-2"><Field hl={hl} label="Ville" value={data.personal.location} placeholder="Paris, France" onChange={(v) => setPersonal("location", v)} /></div>
        </div>
      </section>

      <SortableList items={sections} ids={sections.map((s) => s.id)} onReorder={setSections} render={(s, _i, handle) => (
        <section className={`mb-6 rounded-2xl border bg-card p-6 shadow-soft ${s.visible ? "" : "opacity-60"}`}>
          <div className="mb-4 flex items-center gap-2">
            {handle}
            <Input aria-label="Titre de la section" className="h-8 flex-1 border-transparent px-1 font-semibold shadow-none hover:border-input focus-visible:border-input" value={s.title} maxLength={60} onChange={(e) => patchSection(s.id, { title: e.target.value })} />
            <Button size="icon" variant="ghost" aria-label={s.visible ? "Masquer la section" : "Afficher la section"} onClick={() => patchSection(s.id, { visible: !s.visible })}>{s.visible ? <Eye /> : <EyeOff />}</Button>
            {s.type === "custom" && (
              <Button size="icon" variant="ghost" aria-label="Dupliquer la section" onClick={() => {
                const i = sections.findIndex((x) => x.id === s.id);
                setSections([...sections.slice(0, i + 1), { ...s, id: newId(), title: `${s.title} (copie)` }, ...sections.slice(i + 1)]);
              }}><Copy /></Button>
            )}
            <Button size="icon" variant="ghost" className="text-destructive" aria-label="Supprimer la section" onClick={() => setSections(sections.filter((x) => x.id !== s.id))}><Trash2 /></Button>
          </div>
          {s.visible ? <SectionBody section={s} data={data} onChange={onChange} hl={hl} onSection={(p) => patchSection(s.id, p)} /> : <p className="text-sm text-muted-foreground">Section masquée sur le CV.</p>}
        </section>
      )} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="outline" className="w-full border-dashed"><Plus /> Ajouter une section</Button></DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          {missing.map((b) => (
            <DropdownMenuItem key={b.type} onClick={() => setSections([...sections, { id: b.type, type: b.type, title: b.title, visible: true }])}>{b.title}</DropdownMenuItem>
          ))}
          {missing.length > 0 && <DropdownMenuSeparator />}
          {["Certifications", "Projets", "Centres d'intérêt", "Bénévolat"].map((t) => (
            <DropdownMenuItem key={t} onClick={() => setSections([...sections, { id: newId(), type: "custom", title: t, visible: true, content: "" }])}>{t}</DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setSections([...sections, { id: newId(), type: "custom", title: "Nouvelle section", visible: true, content: "" }])}>Section personnalisée</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SectionBody({ section, data, onChange, hl, onSection }: { section: SectionConfig; data: ResumeData; onChange: (d: ResumeData) => void; hl: (v: string) => string; onSection: (p: Partial<SectionConfig>) => void }) {
  switch (section.type) {
    case "summary":
      return <Textarea className={hl(data.summary)} rows={3} maxLength={800} value={data.summary} onChange={(e) => onChange({ ...data, summary: e.target.value })} placeholder="Quelques lignes pour vous présenter…" />;
    case "experience":
      return <Experiences data={data} onChange={onChange} hl={hl} />;
    case "education":
      return <EducationList data={data} onChange={onChange} hl={hl} />;
    case "skills":
      return <Skills data={data} onChange={onChange} />;
    case "languages":
      return <Languages data={data} onChange={onChange} hl={hl} />;
    case "custom":
      return <Textarea rows={4} maxLength={2000} value={section.content ?? ""} placeholder="Un élément par ligne" onChange={(e) => onSection({ content: e.target.value })} />;
  }
}

function AddBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button size="sm" variant="secondary" onClick={onClick}><Plus /> {children}</Button>;
}

function Experiences({ data, onChange, hl }: { data: ResumeData; onChange: (d: ResumeData) => void; hl: (v: string) => string }) {
  const list = data.experiences;
  const set = (experiences: Experience[]) => onChange({ ...data, experiences });
  return (
    <>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Aucune expérience pour le moment.</p>}
      <SortableList items={list} ids={list.map((e) => e.id!)} onReorder={set} render={(e, i, handle) => (
        <ExperienceItem exp={e} handle={handle} hl={hl}
          onChange={(p) => set(list.map((x, j) => (j === i ? { ...x, ...p } : x)))}
          onDuplicate={() => set([...list.slice(0, i + 1), { ...e, id: newId(), bullets: [...(e.bullets ?? [])] }, ...list.slice(i + 1)])}
          onRemove={() => set(list.filter((_, j) => j !== i))} />
      )} />
      <AddBtn onClick={() => set([...list, { id: newId(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, period: "", description: "", bullets: [] }])}>Ajouter une expérience</AddBtn>
    </>
  );
}

function EducationList({ data, onChange, hl }: { data: ResumeData; onChange: (d: ResumeData) => void; hl: (v: string) => string }) {
  const list = data.education;
  const set = (education: ResumeData["education"]) => onChange({ ...data, education });
  return (
    <>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Aucune formation pour le moment.</p>}
      <SortableList items={list} ids={list.map((e) => e.id!)} onReorder={set} render={(e, i, handle) => (
        <div className="mb-3 space-y-3 rounded-xl border bg-surface p-4">
          <div className="flex items-center justify-between">
            {handle}
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label="Dupliquer la formation" onClick={() => set([...list.slice(0, i + 1), { ...e, id: newId() }, ...list.slice(i + 1)])}><Copy /></Button>
              <Button size="icon" variant="ghost" className="text-destructive" aria-label="Supprimer la formation" onClick={() => set(list.filter((_, j) => j !== i))}><Trash2 /></Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field hl={hl} label="Diplôme" value={e.degree} onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, degree: v } : x)))} />
            <Field hl={hl} label="Établissement" value={e.school} onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, school: v } : x)))} />
            <Field hl={hl} label="Période" value={e.period} placeholder="2017 — 2019" onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, period: v } : x)))} />
          </div>
        </div>
      )} />
      <AddBtn onClick={() => set([...list, { id: newId(), degree: "", school: "", period: "" }])}>Ajouter une formation</AddBtn>
    </>
  );
}

function Skills({ data, onChange }: { data: ResumeData; onChange: (d: ResumeData) => void }) {
  const [skill, setSkill] = useState("");
  const [suggested, setSuggested] = useState<string[] | null>(null);
  const { run, loading } = useAssist();
  const add = (raw: string) => {
    const s = raw.trim().slice(0, 50);
    if (!s || data.skills.includes(s)) return;
    onChange({ ...data, skills: [...data.skills, s] });
  };
  const canSuggest = !!(data.personal.title.trim() || data.experiences.some((e) => e.role.trim()));
  async function suggest() {
    const last = data.experiences[0];
    const r = await run("skills", {
      action: "skills",
      jobTitle: data.personal.title,
      role: last?.role ?? "",
      company: last?.company ?? "",
      description: data.experiences.map((e) => `${e.role}: ${e.description} ${(e.bullets ?? []).join("; ")}`).join("\n").slice(0, 3000),
      existingSkills: data.skills,
    });
    if (r?.items.length) setSuggested(r.items.filter((s) => !data.skills.includes(s)));
  }
  return (
    <>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(skill); setSkill(""); }}>
        <Input value={skill} placeholder="Ex. : React, Gestion de projet…" onChange={(e) => setSkill(e.target.value)} />
        <Button type="submit" variant="secondary"><Plus /> Ajouter</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">
            {s}
            <button aria-label={`Retirer ${s}`} onClick={() => onChange({ ...data, skills: data.skills.filter((x) => x !== s) })}><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
      </div>
      <Button size="sm" variant="ghost" disabled={!!loading || !canSuggest} onClick={suggest} title={canSuggest ? undefined : "Renseignez un intitulé de poste ou une expérience"}>
        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />} Suggérer des compétences
      </Button>
      {suggested && suggested.length > 0 && (
        <Suggestion onDismiss={() => setSuggested(null)}>
          <div className="flex flex-wrap gap-2">
            {suggested.map((s) => (
              <button key={s} className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1 text-sm hover:bg-primary/10"
                onClick={() => { add(s); setSuggested(suggested.filter((x) => x !== s)); }}><Plus className="h-3.5 w-3.5" />{s}</button>
            ))}
          </div>
        </Suggestion>
      )}
    </>
  );
}

function Languages({ data, onChange, hl }: { data: ResumeData; onChange: (d: ResumeData) => void; hl: (v: string) => string }) {
  const list = data.languages;
  const set = (languages: ResumeData["languages"]) => onChange({ ...data, languages });
  return (
    <>
      {list.map((l, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1"><Field hl={hl} label="Langue" value={l.name} onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, name: v } : x)))} /></div>
          <div className="flex-1"><Field hl={hl} label="Niveau" value={l.level} placeholder="Courant" onChange={(v) => set(list.map((x, j) => (j === i ? { ...x, level: v } : x)))} /></div>
          <Button size="icon" variant="ghost" className="text-destructive" aria-label="Supprimer la langue" onClick={() => set(list.filter((_, j) => j !== i))}><Trash2 /></Button>
        </div>
      ))}
      <AddBtn onClick={() => set([...list, { name: "", level: "" }])}>Ajouter une langue</AddBtn>
    </>
  );
}

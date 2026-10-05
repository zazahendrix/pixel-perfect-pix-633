import { useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ResumeData } from "@/types/resume";

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  /** Highlights non-empty fields after an import so the user can review them. */
  highlight?: boolean;
}

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

let highlightOn = false;
const hl = (v: string) => (highlightOn && v.trim() ? "border-primary/50 bg-accent/40" : "");

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input className={hl(value)} type={type} value={value} placeholder={placeholder} maxLength={200} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ResumeEditor({ data, onChange, highlight = false }: Props) {
  highlightOn = highlight;
  const [skill, setSkill] = useState("");
  const setPersonal = (k: keyof ResumeData["personal"], v: string) => onChange({ ...data, personal: { ...data.personal, [k]: v } });

  const updateList = <K extends "experiences" | "education">(key: K, i: number, patch: Partial<ResumeData[K][number]>) =>
    onChange({ ...data, [key]: data[key].map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const removeAt = (key: "experiences" | "education", i: number) => onChange({ ...data, [key]: data[key].filter((_, idx) => idx !== i) });

  function addSkill() {
    const s = skill.trim().slice(0, 50);
    if (!s || data.skills.includes(s)) return;
    onChange({ ...data, skills: [...data.skills, s] });
    setSkill("");
  }

  return (
    <div className="space-y-6">
      <Section title="Coordonnées">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" value={data.personal.firstName} onChange={(v) => setPersonal("firstName", v)} />
          <Field label="Nom" value={data.personal.lastName} onChange={(v) => setPersonal("lastName", v)} />
          <div className="sm:col-span-2"><Field label="Intitulé du poste" value={data.personal.title} placeholder="Développeur Web" onChange={(v) => setPersonal("title", v)} /></div>
          <Field label="E-mail" type="email" value={data.personal.email} onChange={(v) => setPersonal("email", v)} />
          <Field label="Téléphone" value={data.personal.phone} onChange={(v) => setPersonal("phone", v)} />
          <div className="sm:col-span-2"><Field label="Ville" value={data.personal.location} placeholder="Paris, France" onChange={(v) => setPersonal("location", v)} /></div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Profil / résumé</Label>
          <Textarea className={hl(data.summary)} rows={3} maxLength={800} value={data.summary} onChange={(e) => onChange({ ...data, summary: e.target.value })} placeholder="Quelques lignes pour vous présenter…" />
        </div>
      </Section>

      <Section title="Expériences" action={
        <Button size="sm" variant="secondary" onClick={() => onChange({ ...data, experiences: [...data.experiences, { role: "", company: "", period: "", description: "" }] })}><Plus /> Ajouter</Button>
      }>
        {data.experiences.length === 0 && <p className="text-sm text-muted-foreground">Aucune expérience pour le moment.</p>}
        {data.experiences.map((e, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Poste" value={e.role} onChange={(v) => updateList("experiences", i, { role: v })} />
              <Field label="Entreprise" value={e.company} onChange={(v) => updateList("experiences", i, { company: v })} />
              <Field label="Période" value={e.period} placeholder="2021 — Aujourd'hui" onChange={(v) => updateList("experiences", i, { period: v })} />
            </div>
            <Textarea className={hl(e.description)} rows={2} maxLength={600} placeholder="Missions et réalisations" value={e.description} onChange={(ev) => updateList("experiences", i, { description: ev.target.value })} />
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeAt("experiences", i)}><Trash2 /> Supprimer</Button>
          </div>
        ))}
      </Section>

      <Section title="Formation" action={
        <Button size="sm" variant="secondary" onClick={() => onChange({ ...data, education: [...data.education, { degree: "", school: "", period: "" }] })}><Plus /> Ajouter</Button>
      }>
        {data.education.length === 0 && <p className="text-sm text-muted-foreground">Aucune formation pour le moment.</p>}
        {data.education.map((e, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Diplôme" value={e.degree} onChange={(v) => updateList("education", i, { degree: v })} />
              <Field label="Établissement" value={e.school} onChange={(v) => updateList("education", i, { school: v })} />
              <Field label="Période" value={e.period} placeholder="2017 — 2019" onChange={(v) => updateList("education", i, { period: v })} />
            </div>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeAt("education", i)}><Trash2 /> Supprimer</Button>
          </div>
        ))}
      </Section>

      <Section title="Compétences">
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addSkill(); }}>
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
      </Section>
    </div>
  );
}

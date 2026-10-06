import { useState, type ReactNode } from "react";
import { Copy, Loader2, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Experience } from "@/types/resume";
import { SortableList } from "./Sortable";
import { useAssist } from "./useAssist";

interface Props {
  exp: Experience;
  handle: ReactNode;
  hl: (v: string) => string;
  onChange: (patch: Partial<Experience>) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function ExperienceItem({ exp, handle, hl, onChange, onDuplicate, onRemove }: Props) {
  const { run, loading } = useAssist();
  const [descSuggestion, setDescSuggestion] = useState<string | null>(null);
  const [bulletSuggestions, setBulletSuggestions] = useState<string[] | null>(null);
  const bullets = exp.bullets ?? [];
  const bulletIds = bullets.map((_, i) => `${exp.id}-b${i}`);
  const ctx = { role: exp.role, company: exp.company, description: exp.description, bullets };

  const setBullet = (i: number, v: string) => onChange({ bullets: bullets.map((b, j) => (j === i ? v : b)) });

  async function describe(action: "improve" | "generate") {
    const r = await run(action, { action, ...ctx });
    if (r?.text) setDescSuggestion(r.text);
  }
  async function suggestBullets() {
    const r = await run("bullets", { action: "bullets", ...ctx });
    if (r?.items.length) setBulletSuggestions(r.items);
  }

  return (
    <div className="mb-3 space-y-3 rounded-xl border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-sm font-medium">{handle}{exp.role || "Nouvelle expérience"}</div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" aria-label="Dupliquer l'expérience" onClick={onDuplicate}><Copy /></Button>
          <Button size="icon" variant="ghost" className="text-destructive" aria-label="Supprimer l'expérience" onClick={onRemove}><Trash2 /></Button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <F label="Poste" v={exp.role} hl={hl} onChange={(v) => onChange({ role: v })} />
        <F label="Entreprise" v={exp.company} hl={hl} onChange={(v) => onChange({ company: v })} />
        <F label="Lieu" v={exp.location ?? ""} hl={hl} placeholder="Paris, France" onChange={(v) => onChange({ location: v })} />
        <div />
        <F label="Début" type="month" v={exp.startDate ?? ""} hl={hl} onChange={(v) => onChange({ startDate: v })} />
        <F label="Fin" type="month" v={exp.current ? "" : (exp.endDate ?? "")} hl={hl} disabled={exp.current} onChange={(v) => onChange({ endDate: v })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={!!exp.current} onCheckedChange={(c) => onChange({ current: c === true })} /> Poste actuel
      </label>
      {!exp.startDate && !exp.endDate && !exp.current && exp.period && (
        <p className="text-xs text-muted-foreground">Période importée : « {exp.period} » — renseignez les dates pour la remplacer.</p>
      )}

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">Description du poste</Label>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={!!loading || !exp.description.trim()} onClick={() => describe("improve")}>
              {loading === "improve" ? <Loader2 className="animate-spin" /> : <Wand2 />} Améliorer
            </Button>
            <Button size="sm" variant="ghost" disabled={!!loading || !exp.role.trim()} onClick={() => describe("generate")}>
              {loading === "generate" ? <Loader2 className="animate-spin" /> : <Sparkles />} Générer
            </Button>
          </div>
        </div>
        <Textarea className={hl(exp.description)} rows={2} maxLength={1000} placeholder="Contexte et missions principales" value={exp.description} onChange={(e) => onChange({ description: e.target.value })} />
        {descSuggestion && (
          <Suggestion onDismiss={() => setDescSuggestion(null)}>
            <p className="text-sm">{descSuggestion}</p>
            <Button size="sm" variant="secondary" onClick={() => { onChange({ description: descSuggestion }); setDescSuggestion(null); }}>Utiliser</Button>
          </Suggestion>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">Responsabilités</Label>
          <Button size="sm" variant="ghost" disabled={!!loading || !exp.role.trim()} onClick={suggestBullets}>
            {loading === "bullets" ? <Loader2 className="animate-spin" /> : <Sparkles />} Suggestions de formulation
          </Button>
        </div>
        <SortableList items={bullets} ids={bulletIds} onReorder={(b) => onChange({ bullets: b })} render={(b, i, h) => (
          <div className="mb-1.5 flex items-center gap-1">
            {h}
            <Input className={hl(b)} value={b} maxLength={300} placeholder="Ex. : Piloté la refonte du site…" onChange={(e) => setBullet(i, e.target.value)} />
            <Button size="icon" variant="ghost" aria-label="Supprimer la responsabilité" onClick={() => onChange({ bullets: bullets.filter((_, j) => j !== i) })}><X /></Button>
          </div>
        )} />
        <Button size="sm" variant="outline" onClick={() => onChange({ bullets: [...bullets, ""] })}><Plus /> Ajouter une responsabilité</Button>
        {bulletSuggestions && (
          <Suggestion onDismiss={() => setBulletSuggestions(null)}>
            <ul className="space-y-1">
              {bulletSuggestions.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm">
                  <button className="mt-0.5 shrink-0 rounded-full bg-primary/10 p-0.5 text-primary" aria-label="Ajouter" onClick={() => { onChange({ bullets: [...bullets.filter((b) => b.trim()), s] }); setBulletSuggestions(bulletSuggestions.filter((x) => x !== s)); }}><Plus className="h-3.5 w-3.5" /></button>
                  {s}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" onClick={() => { onChange({ bullets: bulletSuggestions }); setBulletSuggestions(null); }}>Remplacer toutes les responsabilités</Button>
          </Suggestion>
        )}
      </div>
    </div>
  );
}

function F({ label, v, onChange, hl, placeholder, type = "text", disabled }: { label: string; v: string; onChange: (v: string) => void; hl: (v: string) => string; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input className={hl(v)} type={type} value={v} placeholder={placeholder} disabled={disabled} maxLength={200} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Suggestion({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-accent/40 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-accent-foreground">
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Suggestion</span>
        <button aria-label="Ignorer" onClick={onDismiss}><X className="h-3.5 w-3.5" /></button>
      </div>
      {children}
    </div>
  );
}

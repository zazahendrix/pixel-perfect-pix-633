import type { ResumeData } from "@/types/resume";

export interface ProgressItem { label: string; done: boolean }

/** Completion checklist; each item weighs the same. */
export function resumeProgress(d: ResumeData): { percent: number; items: ProgressItem[] } {
  const p = d.personal;
  const items: ProgressItem[] = [
    { label: "Nom et prénom", done: !!(p.firstName.trim() && p.lastName.trim()) },
    { label: "Intitulé du poste", done: !!p.title.trim() },
    { label: "E-mail", done: !!p.email.trim() },
    { label: "Téléphone", done: !!p.phone.trim() },
    { label: "Ville", done: !!p.location.trim() },
    { label: "Profil (50 caractères min.)", done: d.summary.trim().length >= 50 },
    { label: "Au moins une expérience", done: d.experiences.length > 0 },
    { label: "Expérience détaillée", done: d.experiences.some((e) => e.description.trim() || (e.bullets ?? []).some((b) => b.trim())) },
    { label: "Au moins une formation", done: d.education.length > 0 },
    { label: "3 compétences ou plus", done: d.skills.length >= 3 },
  ];
  const percent = Math.round((items.filter((i) => i.done).length / items.length) * 100);
  return { percent, items };
}

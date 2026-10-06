export type TemplateId = "modern" | "classic" | "minimal";

export interface Experience {
  id?: string;
  role: string;
  company: string;
  location?: string;
  /** "YYYY-MM" */
  startDate?: string;
  endDate?: string;
  current?: boolean;
  /** Free-text period (legacy / imported). Used when no dates are set. */
  period: string;
  description: string;
  bullets?: string[];
}

export interface Education {
  id?: string;
  degree: string;
  school: string;
  period: string;
}

export type SectionType = "summary" | "experience" | "education" | "skills" | "languages" | "custom";

export interface SectionConfig {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  /** Only for custom sections: one item per line. */
  content?: string;
}

/** Shared data structure used by every template. */
export interface ResumeData {
  personal: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: { name: string; level: string }[];
  /** Order + visibility of sections. Defaults applied when missing. */
  sections?: SectionConfig[];
}

export interface ResumeTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  template: TemplateId;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  content: unknown;
  created_at: string;
  updated_at: string;
}

export interface TemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
}

export const BUILTIN_SECTIONS: { type: Exclude<SectionType, "custom">; title: string }[] = [
  { type: "summary", title: "Profil" },
  { type: "experience", title: "Expérience" },
  { type: "education", title: "Formation" },
  { type: "skills", title: "Compétences" },
  { type: "languages", title: "Langues" },
];

export const defaultSections = (): SectionConfig[] =>
  BUILTIN_SECTIONS.map((s) => ({ id: s.type, type: s.type, title: s.title, visible: true }));

export const emptyResumeData: ResumeData = {
  personal: { firstName: "", lastName: "", title: "", email: "", phone: "", location: "" },
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  sections: defaultSections(),
};

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

/** Merge stored (possibly partial) JSON content with empty defaults. */
export function normalizeResumeData(raw: unknown): ResumeData {
  const c = (raw && typeof raw === "object" ? raw : {}) as Partial<ResumeData>;
  return {
    personal: { ...emptyResumeData.personal, ...(c.personal ?? {}) },
    summary: c.summary ?? "",
    experiences: (Array.isArray(c.experiences) ? c.experiences : []).map((e, i) => ({
      ...e,
      id: e.id ?? `exp-${i}`,
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      current: !!e.current,
      period: e.period ?? "",
      description: e.description ?? "",
      bullets: Array.isArray(e.bullets) ? e.bullets : [],
    })),
    education: (Array.isArray(c.education) ? c.education : []).map((e, i) => ({ ...e, id: e.id ?? `edu-${i}` })),
    skills: Array.isArray(c.skills) ? c.skills : [],
    languages: Array.isArray(c.languages) ? c.languages : [],
    sections: Array.isArray(c.sections) && c.sections.length ? c.sections : defaultSections(),
  };
}

/** Visible sections in display order. */
export function visibleSections(data: ResumeData): SectionConfig[] {
  return (data.sections?.length ? data.sections : defaultSections()).filter((s) => s.visible);
}

const fmtMonth = (v?: string) => {
  if (!v) return "";
  const [y, m] = v.split("-");
  return m ? `${m}/${y}` : (y ?? "");
};

/** Human-readable period for an experience: dates when set, otherwise free text. */
export function experiencePeriod(e: Experience): string {
  if (e.startDate || e.endDate || e.current) {
    const end = e.current ? "Aujourd'hui" : fmtMonth(e.endDate);
    return [fmtMonth(e.startDate), end].filter(Boolean).join(" — ");
  }
  return e.period;
}

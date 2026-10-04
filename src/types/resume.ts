export type TemplateId = "modern" | "classic" | "minimal";

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
  experiences: { role: string; company: string; period: string; description: string }[];
  education: { degree: string; school: string; period: string }[];
  skills: string[];
  languages: { name: string; level: string }[];
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

export const emptyResumeData: ResumeData = {
  personal: { firstName: "", lastName: "", title: "", email: "", phone: "", location: "" },
  summary: "",
  experiences: [],
  education: [],
  skills: [],
  languages: [],
};

/** Merge stored (possibly partial) JSON content with empty defaults. */
export function normalizeResumeData(raw: unknown): ResumeData {
  const c = (raw && typeof raw === "object" ? raw : {}) as Partial<ResumeData>;
  return {
    personal: { ...emptyResumeData.personal, ...(c.personal ?? {}) },
    summary: c.summary ?? "",
    experiences: Array.isArray(c.experiences) ? c.experiences : [],
    education: Array.isArray(c.education) ? c.education : [],
    skills: Array.isArray(c.skills) ? c.skills : [],
    languages: Array.isArray(c.languages) ? c.languages : [],
  };
}

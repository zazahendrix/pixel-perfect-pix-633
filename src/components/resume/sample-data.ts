import type { ResumeData } from "@/types/resume";

export const sampleResume: ResumeData = {
  personal: {
    firstName: "Camille",
    lastName: "Durand",
    title: "Développeuse Web Front-end",
    email: "camille.durand@email.fr",
    phone: "06 12 34 56 78",
    location: "Lyon, France",
  },
  summary:
    "Développeuse passionnée avec 5 ans d'expérience dans la création d'interfaces modernes, accessibles et performantes.",
  experiences: [
    {
      role: "Développeuse Front-end",
      company: "Studio Lumen",
      period: "2021 — Aujourd'hui",
      description: "Conception d'interfaces React pour des clients du secteur bancaire.",
    },
    {
      role: "Intégratrice Web",
      company: "Agence Nova",
      period: "2019 — 2021",
      description: "Intégration de maquettes et optimisation des performances.",
    },
  ],
  education: [{ degree: "Master Informatique", school: "Université Lyon 1", period: "2017 — 2019" }],
  skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Accessibilité"],
  languages: [
    { name: "Français", level: "Natif" },
    { name: "Anglais", level: "Courant" },
  ],
};

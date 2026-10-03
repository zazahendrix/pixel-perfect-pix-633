import type { ComponentType } from "react";
import type { TemplateId, TemplateProps } from "@/types/resume";
import { ModernTemplate } from "./ModernTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { MinimalTemplate } from "./MinimalTemplate";

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  description: string;
  component: ComponentType<TemplateProps>;
}

/** Add a new template: create its component, then register it here. */
export const templates: TemplateDefinition[] = [
  { id: "modern", label: "Moderne", description: "Colonne colorée, idéal pour les profils dynamiques.", component: ModernTemplate },
  { id: "classic", label: "Classique", description: "Sobre et intemporel, apprécié des recruteurs.", component: ClassicTemplate },
  { id: "minimal", label: "Minimaliste", description: "Épuré, beaucoup d'espace, l'essentiel en avant.", component: MinimalTemplate },
];

export const getTemplate = (id: string) => templates.find((t) => t.id === id) ?? templates[0];

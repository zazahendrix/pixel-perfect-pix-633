import type { ResumeData, ResumeTheme } from "@/types/resume";
import { getTemplate } from "./templates/registry";
import { sampleResume } from "./sample-data";
import { cn } from "@/lib/utils";

interface Props {
  template: string;
  data?: ResumeData;
  theme?: Partial<ResumeTheme>;
  /** Base font size in px; templates scale everything from it. */
  scale?: number;
  className?: string;
}

const defaultTheme: ResumeTheme = { primaryColor: "#3b4fd8", secondaryColor: "#7c5cff", fontFamily: "Manrope" };

export function ResumeRenderer({ template, data = sampleResume, theme, scale = 16, className }: Props) {
  const Template = getTemplate(template).component;
  return (
    <div
      className={cn("aspect-[1/1.414] w-full overflow-hidden rounded-md bg-paper shadow-soft", className)}
      style={{ fontSize: scale }}
    >
      <Template data={data} theme={{ ...defaultTheme, ...theme }} />
    </div>
  );
}

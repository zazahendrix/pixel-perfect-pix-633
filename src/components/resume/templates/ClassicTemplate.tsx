import type { ReactNode } from "react";
import { experiencePeriod, visibleSections, type SectionConfig, type TemplateProps } from "@/types/resume";

export function ClassicTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="mt-[6%]">
      <h2 className="text-[0.62em] font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="mt-[1.5%] h-px w-full" style={{ background: theme.primaryColor, opacity: 0.4 }} />
      <div className="mt-[3%]">{children}</div>
    </section>
  );
  const body = (s: SectionConfig): ReactNode => {
    switch (s.type) {
      case "summary":
        return <p className="text-[0.5em] leading-relaxed opacity-80">{data.summary}</p>;
      case "experience":
        return data.experiences.map((e, i) => (
          <div key={e.id ?? i} className="mb-[3%]">
            <div className="flex justify-between text-[0.54em]"><b>{e.role}{e.company && `, ${e.company}`}{e.location && ` (${e.location})`}</b><span className="opacity-60">{experiencePeriod(e)}</span></div>
            {e.description && <p className="whitespace-pre-line text-[0.48em] opacity-75">{e.description}</p>}
            {!!e.bullets?.filter(Boolean).length && (
              <ul className="ml-[4%] list-disc text-[0.48em] opacity-75">{e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
            )}
          </div>
        ));
      case "education":
        return data.education.map((e, i) => (
          <div key={e.id ?? i} className="flex justify-between text-[0.54em]"><b>{e.degree} — {e.school}</b><span className="opacity-60">{e.period}</span></div>
        ));
      case "skills":
        return <p className="text-[0.5em] opacity-80">{data.skills.join(" · ")}</p>;
      case "languages":
        return <p className="text-[0.5em] opacity-80">{data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(" · ")}</p>;
      case "custom":
        return <ul className="ml-[4%] list-disc text-[0.48em] opacity-80">{(s.content ?? "").split("\n").filter((l) => l.trim()).map((l, j) => <li key={j}>{l}</li>)}</ul>;
    }
  };
  return (
    <div className="h-full w-full bg-paper p-[8%] text-ink" style={{ fontFamily: "Georgia, serif" }}>
      <header className="text-center">
        <h1 className="text-[1.4em] tracking-wide">{personal.firstName} {personal.lastName}</h1>
        <p className="mt-[1%] text-[0.6em] italic opacity-75">{personal.title}</p>
        <p className="mt-[2%] text-[0.48em] opacity-60">{[personal.email, personal.phone, personal.location].filter(Boolean).join(" · ")}</p>
      </header>
      {visibleSections(data).map((s) => <Section key={s.id} title={s.title}>{body(s)}</Section>)}
    </div>
  );
}

import type { ReactNode } from "react";
import { experiencePeriod, visibleSections, type SectionConfig, type TemplateProps } from "@/types/resume";

// Templates render resume paper; inline theme colors come from user data, not the app design system.
export function ModernTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const sections = visibleSections(data);
  const side = sections.filter((s) => s.type === "skills" || s.type === "languages");
  const main = sections.filter((s) => !side.includes(s));

  const sideBody = (s: SectionConfig): ReactNode =>
    s.type === "skills"
      ? data.skills.map((x) => <li key={x}>{x}</li>)
      : data.languages.map((l) => <li key={l.name}>{l.name}{l.level && ` — ${l.level}`}</li>);

  const H = ({ children }: { children: ReactNode }) => (
    <h2 className="mt-[7%] border-b pb-[1%] text-[0.6em] font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>{children}</h2>
  );

  const mainBody = (s: SectionConfig): ReactNode => {
    switch (s.type) {
      case "summary":
        return <p className="mt-[3%] text-[0.5em] leading-relaxed opacity-75">{data.summary}</p>;
      case "experience":
        return data.experiences.map((e, i) => (
          <div key={e.id ?? i} className="mt-[4%]">
            <p className="text-[0.55em] font-bold">{e.role}{e.company && ` · ${e.company}`}</p>
            <p className="text-[0.45em] opacity-60">{[experiencePeriod(e), e.location].filter(Boolean).join(" · ")}</p>
            {e.description && <p className="whitespace-pre-line text-[0.48em] opacity-75">{e.description}</p>}
            {!!e.bullets?.filter(Boolean).length && (
              <ul className="ml-[4%] list-disc text-[0.48em] opacity-75">{e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
            )}
          </div>
        ));
      case "education":
        return data.education.map((e, i) => (
          <div key={e.id ?? i} className="mt-[4%]">
            <p className="text-[0.55em] font-bold">{e.degree}</p>
            <p className="text-[0.45em] opacity-60">{e.school} · {e.period}</p>
          </div>
        ));
      case "custom":
        return <ul className="mt-[3%] ml-[4%] list-disc text-[0.48em] opacity-75">{(s.content ?? "").split("\n").filter((l) => l.trim()).map((l, j) => <li key={j}>{l}</li>)}</ul>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full bg-paper text-ink" style={{ fontFamily: theme.fontFamily }}>
      <aside className="w-[34%] p-[6%] text-paper" style={{ background: theme.primaryColor }}>
        <div className="mb-[12%] aspect-square w-[55%] rounded-full bg-paper/20" />
        <h2 className="text-[0.55em] font-bold uppercase tracking-widest opacity-80">Contact</h2>
        <p className="mt-[4%] text-[0.5em] leading-relaxed opacity-90">
          {personal.email}<br />{personal.phone}<br />{personal.location}
        </p>
        {side.map((s) => (
          <div key={s.id}>
            <h2 className="mt-[12%] text-[0.55em] font-bold uppercase tracking-widest opacity-80">{s.title}</h2>
            <ul className="mt-[4%] space-y-[3%] text-[0.5em]">{sideBody(s)}</ul>
          </div>
        ))}
      </aside>
      <main className="flex-1 p-[6%]">
        <h1 className="text-[1.3em] font-extrabold leading-tight">{personal.firstName} {personal.lastName}</h1>
        <p className="text-[0.65em] font-semibold" style={{ color: theme.secondaryColor }}>{personal.title}</p>
        {main.map((s) => (
          <div key={s.id}>
            {s.type !== "summary" && <H>{s.title}</H>}
            {mainBody(s)}
          </div>
        ))}
      </main>
    </div>
  );
}

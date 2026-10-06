import { Fragment, type ReactNode } from "react";
import { experiencePeriod, visibleSections, type SectionConfig, type TemplateProps } from "@/types/resume";

export function MinimalTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const sections = visibleSections(data);
  const summary = sections.find((s) => s.type === "summary");
  const body = (s: SectionConfig): ReactNode => {
    switch (s.type) {
      case "experience":
        return (
          <div className="space-y-[6%]">
            {data.experiences.map((e, i) => (
              <div key={e.id ?? i}>
                <p className="font-semibold">{e.role}</p>
                <p className="opacity-60">{[e.company, e.location, experiencePeriod(e)].filter(Boolean).join(" · ")}</p>
                {!!e.bullets?.filter(Boolean).length && (
                  <ul className="ml-[4%] list-disc opacity-75">{e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}</ul>
                )}
              </div>
            ))}
          </div>
        );
      case "education":
        return <div>{data.education.map((e, i) => <div key={e.id ?? i}><p className="font-semibold">{e.degree}</p><p className="opacity-60">{e.school}</p></div>)}</div>;
      case "skills":
        return <p className="opacity-75">{data.skills.join(", ")}</p>;
      case "languages":
        return <p className="opacity-75">{data.languages.map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ")}</p>;
      case "custom":
        return <div className="whitespace-pre-line opacity-75">{s.content}</div>;
      default:
        return null;
    }
  };
  return (
    <div className="h-full w-full bg-paper p-[9%] text-ink" style={{ fontFamily: theme.fontFamily }}>
      <h1 className="text-[1.5em] font-light tracking-tight">
        {personal.firstName} <span className="font-semibold">{personal.lastName}</span>
      </h1>
      <p className="text-[0.58em] opacity-60">{personal.title}</p>
      <div className="mt-[4%] h-[2px] w-[12%]" style={{ background: theme.primaryColor }} />
      {summary && <p className="mt-[5%] text-[0.5em] leading-relaxed opacity-75">{data.summary}</p>}
      <div className="mt-[7%] grid grid-cols-[28%_1fr] gap-y-[4%] text-[0.5em]">
        {sections.filter((s) => s.type !== "summary").map((s) => (
          <Fragment key={s.id}>
            <span className="uppercase tracking-widest opacity-50">{s.title}</span>
            {body(s)}
          </Fragment>
        ))}
        <span className="uppercase tracking-widest opacity-50">Contact</span>
        <p className="opacity-75">{personal.email}<br />{personal.phone}</p>
      </div>
    </div>
  );
}

import type { TemplateProps } from "@/types/resume";

export function MinimalTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  return (
    <div className="h-full w-full bg-paper p-[9%] text-ink" style={{ fontFamily: theme.fontFamily }}>
      <h1 className="text-[1.5em] font-light tracking-tight">
        {personal.firstName} <span className="font-semibold">{personal.lastName}</span>
      </h1>
      <p className="text-[0.58em] opacity-60">{personal.title}</p>
      <div className="mt-[4%] h-[2px] w-[12%]" style={{ background: theme.primaryColor }} />
      <p className="mt-[5%] text-[0.5em] leading-relaxed opacity-75">{data.summary}</p>
      <div className="mt-[7%] grid grid-cols-[28%_1fr] gap-y-[4%] text-[0.5em]">
        <span className="uppercase tracking-widest opacity-50">Expérience</span>
        <div className="space-y-[6%]">
          {data.experiences.map((e) => (
            <div key={e.role}>
              <p className="font-semibold">{e.role}</p>
              <p className="opacity-60">{e.company} · {e.period}</p>
            </div>
          ))}
        </div>
        <span className="uppercase tracking-widest opacity-50">Formation</span>
        <div>
          {data.education.map((e) => (
            <div key={e.degree}><p className="font-semibold">{e.degree}</p><p className="opacity-60">{e.school}</p></div>
          ))}
        </div>
        <span className="uppercase tracking-widest opacity-50">Compétences</span>
        <p className="opacity-75">{data.skills.join(", ")}</p>
        <span className="uppercase tracking-widest opacity-50">Contact</span>
        <p className="opacity-75">{personal.email}<br />{personal.phone}</p>
      </div>
    </div>
  );
}

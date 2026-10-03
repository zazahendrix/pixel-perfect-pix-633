import type { TemplateProps } from "@/types/resume";

// Templates render resume paper; inline theme colors come from user data, not the app design system.
export function ModernTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  return (
    <div className="flex h-full w-full bg-paper text-ink" style={{ fontFamily: theme.fontFamily }}>
      <aside className="w-[34%] p-[6%] text-paper" style={{ background: theme.primaryColor }}>
        <div className="mb-[12%] aspect-square w-[55%] rounded-full bg-paper/20" />
        <h2 className="text-[0.55em] font-bold uppercase tracking-widest opacity-80">Contact</h2>
        <p className="mt-[4%] text-[0.5em] leading-relaxed opacity-90">
          {personal.email}<br />{personal.phone}<br />{personal.location}
        </p>
        <h2 className="mt-[12%] text-[0.55em] font-bold uppercase tracking-widest opacity-80">Compétences</h2>
        <ul className="mt-[4%] space-y-[3%] text-[0.5em]">
          {data.skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <h2 className="mt-[12%] text-[0.55em] font-bold uppercase tracking-widest opacity-80">Langues</h2>
        <ul className="mt-[4%] space-y-[3%] text-[0.5em]">
          {data.languages.map((l) => <li key={l.name}>{l.name} — {l.level}</li>)}
        </ul>
      </aside>
      <main className="flex-1 p-[6%]">
        <h1 className="text-[1.3em] font-extrabold leading-tight">{personal.firstName} {personal.lastName}</h1>
        <p className="text-[0.65em] font-semibold" style={{ color: theme.secondaryColor }}>{personal.title}</p>
        <p className="mt-[5%] text-[0.5em] leading-relaxed opacity-75">{data.summary}</p>
        <h2 className="mt-[7%] border-b pb-[1%] text-[0.6em] font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>Expérience</h2>
        {data.experiences.map((e) => (
          <div key={e.role} className="mt-[4%]">
            <p className="text-[0.55em] font-bold">{e.role} · {e.company}</p>
            <p className="text-[0.45em] opacity-60">{e.period}</p>
            <p className="text-[0.48em] opacity-75">{e.description}</p>
          </div>
        ))}
        <h2 className="mt-[7%] border-b pb-[1%] text-[0.6em] font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>Formation</h2>
        {data.education.map((e) => (
          <div key={e.degree} className="mt-[4%]">
            <p className="text-[0.55em] font-bold">{e.degree}</p>
            <p className="text-[0.45em] opacity-60">{e.school} · {e.period}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

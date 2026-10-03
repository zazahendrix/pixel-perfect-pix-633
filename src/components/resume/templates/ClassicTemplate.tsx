import type { TemplateProps } from "@/types/resume";

export function ClassicTemplate({ data, theme }: TemplateProps) {
  const { personal } = data;
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mt-[6%]">
      <h2 className="text-[0.62em] font-bold uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>{title}</h2>
      <div className="mt-[1.5%] h-px w-full" style={{ background: theme.primaryColor, opacity: 0.4 }} />
      <div className="mt-[3%]">{children}</div>
    </section>
  );
  return (
    <div className="h-full w-full bg-paper p-[8%] text-ink" style={{ fontFamily: "Georgia, serif" }}>
      <header className="text-center">
        <h1 className="text-[1.4em] tracking-wide">{personal.firstName} {personal.lastName}</h1>
        <p className="mt-[1%] text-[0.6em] italic opacity-75">{personal.title}</p>
        <p className="mt-[2%] text-[0.48em] opacity-60">{personal.email} · {personal.phone} · {personal.location}</p>
      </header>
      <Section title="Profil"><p className="text-[0.5em] leading-relaxed opacity-80">{data.summary}</p></Section>
      <Section title="Expérience professionnelle">
        {data.experiences.map((e) => (
          <div key={e.role} className="mb-[3%]">
            <div className="flex justify-between text-[0.54em]"><b>{e.role}, {e.company}</b><span className="opacity-60">{e.period}</span></div>
            <p className="text-[0.48em] opacity-75">{e.description}</p>
          </div>
        ))}
      </Section>
      <Section title="Formation">
        {data.education.map((e) => (
          <div key={e.degree} className="flex justify-between text-[0.54em]"><b>{e.degree} — {e.school}</b><span className="opacity-60">{e.period}</span></div>
        ))}
      </Section>
      <Section title="Compétences"><p className="text-[0.5em] opacity-80">{data.skills.join(" · ")}</p></Section>
    </div>
  );
}

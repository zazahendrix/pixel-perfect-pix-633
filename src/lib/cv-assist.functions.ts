import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const s = (n: number) => z.string().max(n).default("");
const inputSchema = z.object({
  action: z.enum(["bullets", "skills", "improve", "generate"]),
  role: s(200),
  company: s(200),
  description: s(3000),
  bullets: z.array(z.string().max(500)).max(30).default([]),
  existingSkills: z.array(z.string().max(60)).max(80).default([]),
  jobTitle: s(200),
});

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["text", "items"],
  properties: { text: { type: "string" }, items: { type: "array", items: { type: "string" } } },
};

function prompt(d: z.infer<typeof inputSchema>): string {
  const ctx = `Poste : ${d.role || d.jobTitle || "(non précisé)"}\nEntreprise : ${d.company || "(non précisée)"}\nDescription : ${d.description || "(vide)"}\nResponsabilités : ${d.bullets.filter(Boolean).join(" | ") || "(aucune)"}`;
  switch (d.action) {
    case "bullets":
      return `${ctx}\n\nPropose 4 à 6 responsabilités formulées de façon professionnelle pour un CV (verbe d'action, concis, résultats si pertinents). Si des responsabilités existent, reformule-les et complète. Mets-les dans "items", "text" vide.`;
    case "skills":
      return `${ctx}\nTitre visé : ${d.jobTitle}\nCompétences déjà présentes : ${d.existingSkills.join(", ") || "(aucune)"}\n\nPropose 8 compétences pertinentes (techniques et comportementales), courtes (1 à 3 mots), absentes de la liste existante. Dans "items", "text" vide.`;
    case "improve":
      return `${ctx}\n\nAméliore la description du poste : style professionnel, concis (2-3 phrases), sans inventer de faits nouveaux. Dans "text", "items" vide.`;
    case "generate":
      return `${ctx}\n\nRédige une description professionnelle générique et crédible (2-3 phrases) pour ce poste, sans chiffres inventés. Dans "text", "items" vide.`;
  }
}

export const assistCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Service de suggestions non configuré." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: "Tu es un expert en rédaction de CV en français. Réponds en français.",
        input: [{ role: "user", content: [{ type: "input_text", text: prompt(data) }] }],
        text: { format: { type: "json_schema", name: "suggestion", schema, strict: true } },
      }),
    });
    if (!res.ok) {
      console.error("CV assist failed", res.status, await res.text().catch(() => ""));
      if (res.status === 429) return { ok: false as const, error: "Trop de demandes, réessayez dans un instant." };
      if (res.status === 402) return { ok: false as const, error: "Crédits de suggestions épuisés." };
      return { ok: false as const, error: "La suggestion n'a pas pu être générée." };
    }
    let text = "";
    let buffer = "";
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") return { ok: false as const, error: "La suggestion n'a pas pu être générée." };
        } catch { /* partial */ }
      }
    }
    try {
      const out = JSON.parse(text) as { text: string; items: string[] };
      return { ok: true as const, text: out.text, items: out.items };
    } catch {
      return { ok: false as const, error: "La suggestion n'a pas pu être générée." };
    }
  });

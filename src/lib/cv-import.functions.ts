import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.union([
  z.object({ kind: z.literal("pdf"), filename: z.string().max(200), base64: z.string().min(1).max(14_000_000) }),
  z.object({ kind: z.literal("text"), text: z.string().min(20).max(100_000) }),
]);

const str = { type: "string" };
// Mirrors ResumeData exactly so imported CVs use the same model as manual ones.
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["personal", "summary", "experiences", "education", "skills", "languages"],
  properties: {
    personal: {
      type: "object",
      additionalProperties: false,
      required: ["firstName", "lastName", "title", "email", "phone", "location"],
      properties: { firstName: str, lastName: str, title: str, email: str, phone: str, location: str },
    },
    summary: str,
    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "company", "period", "description"],
        properties: { role: str, company: str, period: str, description: str },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["degree", "school", "period"],
        properties: { degree: str, school: str, period: str },
      },
    },
    skills: { type: "array", items: str },
    languages: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["name", "level"], properties: { name: str, level: str } },
    },
  },
};

const instructions = `Tu extrais les informations d'un CV vers un format structuré.
Règles strictes :
- N'invente JAMAIS d'information. Si une donnée est absente ou incertaine, renvoie une chaîne vide "" ou une liste vide.
- Conserve la langue d'origine du CV.
- period : dates d'emploi/formation telles qu'écrites (ex. "2019 — 2021").
- description d'expérience : missions ET réalisations du poste, fidèlement résumées depuis le texte, phrases courtes séparées par des retours à la ligne.
- skills : compétences listées dans le CV. Les certifications et projets, s'ils existent, ajoute-les en fin de summary sous forme "Certifications : ..." / "Projets : ..." uniquement s'ils figurent dans le CV.
- languages : langues et niveau si indiqué.`;

export const extractCv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Service d'analyse non configuré." };

    const content =
      data.kind === "pdf"
        ? [
            { type: "input_text", text: "Voici le CV à analyser." },
            { type: "input_file", filename: data.filename, file_data: `data:application/pdf;base64,${data.base64}` },
          ]
        : [{ type: "input_text", text: `Voici le texte du CV à analyser :\n\n${data.text}` }];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": apiKey, Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions,
        input: [{ role: "user", content }],
        text: { format: { type: "json_schema", name: "resume", schema, strict: true } },
      }),
    });

    if (!res.ok) {
      console.error("CV extraction failed", res.status, await res.text().catch(() => ""));
      if (res.status === 429) return { ok: false as const, error: "Trop de demandes, réessayez dans un instant." };
      if (res.status === 402) return { ok: false as const, error: "Crédits d'analyse épuisés. Réessayez plus tard." };
      return { ok: false as const, error: "Le document n'a pas pu être analysé." };
    }

    // Consume the SSE stream and keep the final text.
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
          const ev = JSON.parse(payload) as { type?: string; delta?: string; response?: { status?: string } };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") {
            console.error("CV extraction stream error", payload);
            return { ok: false as const, error: "Le document n'a pas pu être analysé." };
          }
        } catch { /* partial line */ }
      }
    }
    if (!text) return { ok: false as const, error: "Aucune information n'a pu être extraite de ce document." };
    try {
      JSON.parse(text);
      return { ok: true as const, json: text };
    } catch {
      return { ok: false as const, error: "Le document n'a pas pu être analysé." };
    }
  });

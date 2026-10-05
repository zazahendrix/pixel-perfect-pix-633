// Browser-side file preparation for CV import (PDF sent as base64, DOCX converted to text).
export const MAX_CV_SIZE = 10 * 1024 * 1024;

export type PreparedCv =
  | { kind: "pdf"; filename: string; base64: string }
  | { kind: "text"; text: string };

export function validateCvFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
  const isDocx = name.endsWith(".docx");
  if (name.endsWith(".doc")) return "Les anciens fichiers .doc ne sont pas pris en charge. Enregistrez-le en .docx ou en PDF.";
  if (!isPdf && !isDocx) return "Format non pris en charge. Choisissez un fichier PDF ou Word (.docx).";
  if (file.size === 0) return "Ce fichier est vide.";
  if (file.size > MAX_CV_SIZE) return "Fichier trop volumineux (10 Mo maximum).";
  return null;
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export async function prepareCvFile(file: File): Promise<PreparedCv> {
  const buf = await file.arrayBuffer();
  if (file.name.toLowerCase().endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
    const text = value.trim();
    if (text.length < 20) throw new Error("Ce document Word ne contient pas de texte lisible.");
    return { kind: "text", text: text.slice(0, 100_000) };
  }
  return { kind: "pdf", filename: file.name.slice(0, 200), base64: toBase64(buf) };
}

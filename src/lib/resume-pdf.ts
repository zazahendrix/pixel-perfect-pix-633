// Renders a resume DOM node to an A4 PDF, preserving the chosen template.
export async function downloadResumePdf(node: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
  const canvas = await html2canvas(node, { scale: 3, backgroundColor: "#ffffff", useCORS: true });
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 297);
  const safe = filename.replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "CV";
  pdf.save(`${safe}.pdf`);
}

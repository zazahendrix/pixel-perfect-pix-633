import { useState, type RefObject } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { downloadResumePdf } from "@/lib/resume-pdf";

export function DownloadPdfButton({ target, filename, variant = "outline" }: { target: RefObject<HTMLDivElement | null>; filename: string; variant?: ButtonProps["variant"] }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!target.current) return;
    setBusy(true);
    try {
      await downloadResumePdf(target.current, filename);
    } catch {
      toast.error("Le téléchargement du PDF a échoué");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant={variant} onClick={go} disabled={busy}>
      <Download /> {busy ? "Préparation…" : "Télécharger en PDF"}
    </Button>
  );
}

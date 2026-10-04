import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { passwordSchema } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Curriculo" },
      { name: "description", content: "Choisissez un nouveau mot de passe." },
      { property: "og:title", content: "Nouveau mot de passe — Curriculo" },
      { property: "og:description", content: "Choisissez un nouveau mot de passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const p = passwordSchema.safeParse(pw);
    if (!p.success) return setError(p.error.issues[0]?.message ?? "Erreur");
    const { error } = await supabase.auth.updateUser({ password: p.data });
    if (error) return setError("Le lien a expiré ou est invalide. Recommencez la procédure.");
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/dashboard" });
  }
  return (
    <AuthLayout title="Nouveau mot de passe">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="pw">Nouveau mot de passe</Label><Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" className="w-full">Enregistrer</Button>
      </form>
    </AuthLayout>
  );
}

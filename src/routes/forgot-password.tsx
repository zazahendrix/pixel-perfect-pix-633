import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { emailSchema, sendReset } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — Curriculo" },
      { name: "description", content: "Réinitialisez votre mot de passe." },
      { property: "og:title", content: "Mot de passe oublié — Curriculo" },
      { property: "og:description", content: "Réinitialisez votre mot de passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const p = emailSchema.safeParse(email);
    if (!p.success) return setError(p.error.issues[0].message);
    await sendReset(p.data);
    setSent(true);
  }
  return (
    <AuthLayout title="Mot de passe oublié" subtitle={sent ? "Si un compte existe, un lien de réinitialisation vient d'être envoyé." : "Indiquez votre e-mail, nous vous enverrons un lien."}
      footer={<Link to="/login" className="font-semibold text-primary">Retour à la connexion</Link>}>
      {!sent && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="em">E-mail</Label><Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="hero" className="w-full">Envoyer le lien</Button>
        </form>
      )}
    </AuthLayout>
  );
}

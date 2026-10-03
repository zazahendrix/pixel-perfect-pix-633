import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { emailSchema, signIn, translateAuthError } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Se connecter — Curriculo" },
      { name: "description", content: "Connectez-vous pour retrouver vos CV." },
      { property: "og:title", content: "Se connecter — Curriculo" },
      { property: "og:description", content: "Accédez à votre espace Curriculo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setLoading(true);
    const { error } = await signIn(parsed.data, password);
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthLayout title="Bon retour 👋" subtitle="Connectez-vous pour retrouver vos CV."
      footer={<>Pas encore de compte ? <Link to="/signup" className="font-semibold text-primary">Créer un compte</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
        <div className="space-y-2">
          <div className="flex justify-between"><Label htmlFor="pw">Mot de passe</Label><Link to="/forgot-password" className="text-xs text-primary">Mot de passe oublié ?</Link></div>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</Button>
      </form>
    </AuthLayout>
  );
}

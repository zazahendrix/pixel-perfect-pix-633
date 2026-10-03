import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { emailSchema, passwordSchema, signUp, translateAuthError } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Créer un compte — Curriculo" },
      { name: "description", content: "Créez votre compte et votre premier CV gratuitement." },
      { property: "og:title", content: "Créer un compte — Curriculo" },
      { property: "og:description", content: "Commencez votre CV professionnel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  email: emailSchema,
  password: passwordSchema,
});

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const p = schema.safeParse(form);
    if (!p.success) return setError(p.error.issues[0].message);
    setLoading(true);
    const { data, error } = await signUp(p.data.email, p.data.password, p.data.firstName, p.data.lastName);
    setLoading(false);
    if (error) return setError(translateAuthError(error.message));
    if (data.session) navigate({ to: "/dashboard" });
    else setSent(true);
  }

  if (sent)
    return (
      <AuthLayout title="Vérifiez vos e-mails" subtitle={`Nous avons envoyé un lien de confirmation à ${form.email}. Cliquez dessus pour activer votre compte.`}>
        <Button asChild variant="outline" className="w-full"><Link to="/login">Retour à la connexion</Link></Button>
      </AuthLayout>
    );

  return (
    <AuthLayout title="Créer mon compte" subtitle="Votre premier CV en quelques minutes."
      footer={<>Déjà un compte ? <Link to="/login" className="font-semibold text-primary">Se connecter</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label htmlFor="fn">Prénom</Label><Input id="fn" value={form.firstName} onChange={set("firstName")} /></div>
          <div className="space-y-2"><Label htmlFor="ln">Nom</Label><Input id="ln" value={form.lastName} onChange={set("lastName")} /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="em">E-mail</Label><Input id="em" type="email" value={form.email} onChange={set("email")} /></div>
        <div className="space-y-2"><Label htmlFor="pw">Mot de passe</Label><Input id="pw" type="password" value={form.password} onChange={set("password")} placeholder="8 caractères minimum" /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>{loading ? "Création…" : "Créer mon compte"}</Button>
      </form>
    </AuthLayout>
  );
}

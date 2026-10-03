import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useSession } from "@/hooks/use-session";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const links = (
    <>
      <Link to="/modeles" className="text-sm font-medium text-muted-foreground hover:text-foreground">Modèles</Link>
      <Link to="/tarifs" className="text-sm font-medium text-muted-foreground hover:text-foreground">Tarifs</Link>
      {session ? (
        <Button asChild variant="hero"><Link to="/dashboard">Mon espace</Link></Button>
      ) : (
        <>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Se connecter</Link>
          <Button asChild variant="hero"><Link to="/signup">Créer mon CV</Link></Button>
        </>
      )}
    </>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">{links}</div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && <div className="flex flex-col items-start gap-4 border-t px-5 py-5 md:hidden">{links}</div>}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} Curriculo. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

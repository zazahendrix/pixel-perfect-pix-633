import { Link } from "@tanstack/react-router";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary font-display text-lg text-primary-foreground">C</span>
      <span className="text-lg font-bold tracking-tight">Curriculo</span>
    </Link>
  );
}

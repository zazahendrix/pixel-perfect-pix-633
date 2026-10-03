import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getResume } from "@/lib/resumes";
import type { Resume } from "@/types/resume";

export function ResumeLoader({ id, children }: { id: string; children: (r: Resume) => ReactNode }) {
  const { data, isLoading } = useQuery({ queryKey: ["resume", id], queryFn: () => getResume(id) });
  if (isLoading) return <p className="p-10 text-center text-muted-foreground">Chargement…</p>;
  if (!data)
    return (
      <div className="p-16 text-center">
        <p className="text-muted-foreground">CV introuvable.</p>
        <Link to="/dashboard" className="mt-4 inline-block font-semibold text-primary">Retour à mes CV</Link>
      </div>
    );
  return <>{children(data)}</>;
}

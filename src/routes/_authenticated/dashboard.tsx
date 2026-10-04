import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Eye, Copy, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ResumeRenderer } from "@/components/resume/ResumeRenderer";
import { getTemplate } from "@/components/resume/templates/registry";
import { listResumes, deleteResume, duplicateResume, getMyProfile } from "@/lib/resumes";
import { normalizeResumeData, type Resume } from "@/types/resume";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Mes CV — Curriculo" }, { name: "description", content: "Gérez vos CV." }] }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const { data: resumes, isLoading } = useQuery({ queryKey: ["resumes"], queryFn: listResumes });
  const refresh = () => qc.invalidateQueries({ queryKey: ["resumes"] });
  const del = useMutation({ mutationFn: deleteResume, onSuccess: () => { toast.success("CV supprimé"); refresh(); }, onError: () => toast.error("Suppression impossible") });
  const dup = useMutation({ mutationFn: duplicateResume, onSuccess: () => { toast.success("CV dupliqué"); refresh(); }, onError: () => toast.error("Duplication impossible") });

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl">Bonjour, {profile?.first_name || "à vous"} 👋</h1>
      <h2 className="mt-8 text-lg font-semibold">Mes CV</h2>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Chargement…</p>
      ) : resumes && resumes.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed bg-card p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground"><FileText /></div>
          <p className="mt-4 text-muted-foreground">Vous n'avez pas encore créé de CV.</p>
          <Button asChild variant="hero" className="mt-6"><Link to="/resume/new">Créer mon premier CV</Link></Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link to="/resume/new" className="flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-card text-primary transition hover:border-primary hover:bg-accent">
            <Plus className="h-8 w-8" />
            <span className="mt-2 font-semibold">Créer un CV</span>
          </Link>
          {resumes?.map((r) => (
            <ResumeCard key={r.id} resume={r} onDuplicate={() => dup.mutate(r)} onDelete={() => del.mutate(r.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

function ResumeCard({ resume, onDuplicate, onDelete }: { resume: Resume; onDuplicate: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col rounded-2xl border bg-card p-3 shadow-soft">
      <div className="rounded-xl bg-surface p-4">
        <ResumeRenderer template={resume.template} data={normalizeResumeData(resume.content)} scale={8} theme={{ primaryColor: resume.primary_color, secondaryColor: resume.secondary_color, fontFamily: resume.font_family }} />
      </div>
      <div className="px-1 pt-3">
        <h3 className="truncate font-semibold">{resume.name}</h3>
        <p className="text-xs text-muted-foreground">
          {getTemplate(resume.template).label} · modifié le {new Date(resume.updated_at).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1">
        <Button asChild variant="ghost" size="icon" title="Modifier"><Link to="/resume/$id/edit" params={{ id: resume.id }}><Pencil /></Link></Button>
        <Button asChild variant="ghost" size="icon" title="Aperçu"><Link to="/resume/$id/preview" params={{ id: resume.id }}><Eye /></Link></Button>
        <Button variant="ghost" size="icon" title="Dupliquer" onClick={onDuplicate}><Copy /></Button>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Supprimer" className="text-destructive"><Trash2 /></Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce CV ?</AlertDialogTitle>
              <AlertDialogDescription>« {resume.name} » sera définitivement supprimé. Cette action est irréversible.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Resume templates live in src/components/resume/templates and are registered in registry.ts; all share the ResumeData type — keeps adding templates trivial.
- Private pages live under src/routes/_authenticated (client-only session gate redirecting to /login) — protects dashboard and resume pages.
- Resume data access goes through src/lib/resumes.ts using the browser client with RLS — single place for database logic.

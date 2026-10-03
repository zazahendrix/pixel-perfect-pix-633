import type { ReactNode } from "react";
import { Logo } from "@/components/site/Logo";

export function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center px-5 py-12">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="rounded-3xl border bg-card p-8 shadow-elegant">
          <h1 className="font-display text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

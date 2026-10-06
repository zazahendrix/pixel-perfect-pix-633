import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { assistCv } from "@/lib/cv-assist.functions";

type Input = Parameters<typeof assistCv>[0]["data"];

/** Calls the AI suggestion server fn; `loading` holds the running action key. */
export function useAssist() {
  const fn = useServerFn(assistCv);
  const [loading, setLoading] = useState<string | null>(null);
  async function run(key: string, data: Partial<Input> & { action: Input["action"] }) {
    setLoading(key);
    try {
      const r = await fn({ data: data as Input });
      if (!r.ok) { toast.error(r.error); return null; }
      return r;
    } catch {
      toast.error("La suggestion n'a pas pu être générée.");
      return null;
    } finally {
      setLoading(null);
    }
  }
  return { run, loading };
}

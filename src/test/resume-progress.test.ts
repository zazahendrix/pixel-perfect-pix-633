import { describe, expect, it } from "vitest";
import { resumeProgress } from "@/lib/resume-progress";
import { emptyResumeData, experiencePeriod } from "@/types/resume";

describe("resumeProgress", () => {
  it("is 0% for an empty CV", () => {
    expect(resumeProgress(emptyResumeData).percent).toBe(0);
  });
  it("counts each completed item equally (2 of 10 = 20%)", () => {
    const d = { ...emptyResumeData, personal: { ...emptyResumeData.personal, firstName: "A", lastName: "B", title: "Dev" } };
    expect(resumeProgress(d).percent).toBe(20);
  });
});

describe("experiencePeriod", () => {
  it("shows Aujourd'hui for a current position", () => {
    expect(experiencePeriod({ role: "", company: "", period: "", description: "", startDate: "2021-03", current: true })).toBe("03/2021 — Aujourd'hui");
  });
  it("falls back to free text without dates", () => {
    expect(experiencePeriod({ role: "", company: "", period: "2019 — 2021", description: "" })).toBe("2019 — 2021");
  });
});

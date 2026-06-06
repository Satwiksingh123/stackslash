// @ts-nocheck
// Engine smoke tests. Run with: bunx vitest run (install vitest first)
// Covers each rule's happy path plus a few edge cases.
import { describe, it, expect } from "vitest";
import { runAudit } from "./engine";

describe("Stackslash audit engine", () => {
  it("flags Cursor + Copilot overlap and drops the more expensive one", () => {
    const r = runAudit({
      teamSize: 10,
      items: [
        { toolId: "cursor", plan: "Business", seats: 10, monthlyCost: 400 },
        { toolId: "copilot", plan: "Business", seats: 10, monthlyCost: 190 },
      ],
    });
    const consolidate = r.recommendations.find((x) => x.type === "consolidate");
    expect(consolidate).toBeDefined();
    expect(consolidate!.monthlySavings).toBe(400);
  });

  it("right-sizes seats above team headcount", () => {
    const r = runAudit({
      teamSize: 5,
      items: [{ toolId: "chatgpt", plan: "Plus", seats: 12, monthlyCost: 240 }],
    });
    const rightsize = r.recommendations.find((x) => x.type === "rightsize");
    expect(rightsize).toBeDefined();
    expect(rightsize!.monthlySavings).toBe(7 * 20); // 7 surplus × $20
  });

  it("downgrades Team plan when team is just 1–2 users", () => {
    const r = runAudit({
      teamSize: 2,
      items: [{ toolId: "chatgpt", plan: "Team", seats: 2, monthlyCost: 60 }],
    });
    const downgrade = r.recommendations.find(
      (x) => x.type === "downgrade" && x.toolId === "chatgpt",
    );
    expect(downgrade).toBeDefined();
    expect(downgrade!.monthlySavings).toBe(20); // $10/seat × 2
  });

  it("optimizes high-volume API spend with model routing", () => {
    const r = runAudit({
      teamSize: 8,
      items: [{ toolId: "openai-api", plan: "Usage", seats: 1, monthlyCost: 2000 }],
    });
    const apiRec = r.recommendations.find((x) => x.toolId === "openai-api");
    expect(apiRec).toBeDefined();
    expect(apiRec!.monthlySavings).toBe(700); // 35% of $2000
    expect(apiRec!.impact).toBe("high");
  });

  it("returns zero savings + high efficiency for a clean stack", () => {
    const r = runAudit({
      teamSize: 5,
      items: [{ toolId: "chatgpt", plan: "Plus", seats: 5, monthlyCost: 100 }],
    });
    expect(r.totalMonthlySavings).toBe(0);
    expect(r.efficiencyScore).toBe(100);
    expect(r.optimizationScore).toBe(0);
  });

  it("computes scores correctly when savings exist", () => {
    const r = runAudit({
      teamSize: 3,
      items: [
        { toolId: "cursor", plan: "Business", seats: 10, monthlyCost: 400 },
        { toolId: "copilot", plan: "Business", seats: 10, monthlyCost: 190 },
      ],
    });
    expect(r.totalMonthlySpend).toBe(590);
    expect(r.optimizationScore).toBeGreaterThan(0);
    expect(r.optimizationScore + r.efficiencyScore).toBe(100);
  });
});

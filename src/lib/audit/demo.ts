export type Tool = {
  id: string;
  name: string;
  category: string;
  vendor: string;
  color: string;
  logo: string;
  plans: { name: string; price: number; per: "seat" | "month" }[];
};

export const TOOLS: Tool[] = [
  {
    id: "chatgpt", name: "ChatGPT", category: "Assistant", vendor: "OpenAI", color: "#10A37F", logo: "G",
    plans: [{ name: "Plus", price: 20, per: "seat" }, { name: "Team", price: 30, per: "seat" }, { name: "Enterprise", price: 60, per: "seat" }],
  },
  {
    id: "claude", name: "Claude", category: "Assistant", vendor: "Anthropic", color: "#D97757", logo: "C",
    plans: [{ name: "Pro", price: 20, per: "seat" }, { name: "Team", price: 30, per: "seat" }],
  },
  {
    id: "cursor", name: "Cursor", category: "IDE", vendor: "Anysphere", color: "#9CA3AF", logo: "❯",
    plans: [{ name: "Pro", price: 20, per: "seat" }, { name: "Business", price: 40, per: "seat" }],
  },
  {
    id: "copilot", name: "GitHub Copilot", category: "IDE", vendor: "GitHub", color: "#A78BFA", logo: "◆",
    plans: [{ name: "Individual", price: 10, per: "seat" }, { name: "Business", price: 19, per: "seat" }, { name: "Enterprise", price: 39, per: "seat" }],
  },
  {
    id: "gemini", name: "Gemini", category: "Assistant", vendor: "Google", color: "#4F8BFB", logo: "✦",
    plans: [{ name: "Advanced", price: 20, per: "seat" }, { name: "Business", price: 24, per: "seat" }],
  },
  {
    id: "openai-api", name: "OpenAI API", category: "API", vendor: "OpenAI", color: "#10A37F", logo: "O",
    plans: [{ name: "Usage", price: 0, per: "month" }],
  },
  {
    id: "anthropic-api", name: "Anthropic API", category: "API", vendor: "Anthropic", color: "#D97757", logo: "A",
    plans: [{ name: "Usage", price: 0, per: "month" }],
  },
  {
    id: "windsurf", name: "Windsurf", category: "IDE", vendor: "Codeium", color: "#06B6D4", logo: "≈",
    plans: [{ name: "Pro", price: 15, per: "seat" }, { name: "Teams", price: 35, per: "seat" }],
  },
  {
    id: "v0", name: "v0", category: "Design", vendor: "Vercel", color: "#FFFFFF", logo: "v0",
    plans: [{ name: "Premium", price: 20, per: "seat" }, { name: "Team", price: 50, per: "seat" }],
  },
];

export type AuditEntry = {
  toolId: string;
  plan: string;
  seats: number;
  monthlyCost: number;
  useCase: string;
};

export type Recommendation = {
  toolId: string;
  title: string;
  detail: string;
  monthlySavings: number;
  impact: "high" | "medium" | "low";
  type: "consolidate" | "downgrade" | "switch" | "rightsize";
};

export const DEMO_AUDIT: AuditEntry[] = [
  { toolId: "chatgpt", plan: "Team", seats: 18, monthlyCost: 540, useCase: "General assistant for ops & marketing" },
  { toolId: "claude", plan: "Pro", seats: 12, monthlyCost: 240, useCase: "Long-context drafting & analysis" },
  { toolId: "cursor", plan: "Business", seats: 14, monthlyCost: 560, useCase: "Primary IDE for engineering" },
  { toolId: "copilot", plan: "Business", seats: 14, monthlyCost: 266, useCase: "Inline code completions" },
  { toolId: "openai-api", plan: "Usage", seats: 1, monthlyCost: 1420, useCase: "Production inference for app features" },
  { toolId: "windsurf", plan: "Pro", seats: 6, monthlyCost: 90, useCase: "Experimental — 2 active users" },
];

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    toolId: "copilot", type: "consolidate", impact: "high", monthlySavings: 266,
    title: "Drop GitHub Copilot — Cursor already covers it",
    detail: "100% of Copilot seats overlap with Cursor Business. Engineers report Cursor as primary; Copilot usage <8 completions/day median.",
  },
  {
    toolId: "windsurf", type: "consolidate", impact: "medium", monthlySavings: 60,
    title: "Cancel 4 inactive Windsurf seats",
    detail: "Only 2 of 6 seats logged in last 30 days. Right-size to a 2-seat plan.",
  },
  {
    toolId: "chatgpt", type: "downgrade", impact: "medium", monthlySavings: 180,
    title: "Move 9 ChatGPT seats from Team → Plus",
    detail: "These users don't use shared workspaces or admin controls. Plus is sufficient.",
  },
  {
    toolId: "openai-api", type: "switch", impact: "high", monthlySavings: 480,
    title: "Route 60% of GPT-4o traffic to Claude Haiku + cached prompts",
    detail: "Embedding & classification calls don't need a frontier model. Estimated 34% latency improvement too.",
  },
  {
    toolId: "claude", type: "rightsize", impact: "low", monthlySavings: 80,
    title: "Consolidate Claude Pro seats into a single Team plan",
    detail: "Unified billing + admin, lower per-seat cost at your headcount.",
  },
];

export const SPEND_TREND = [
  { m: "Jun", spend: 2890, optimized: 2890 },
  { m: "Jul", spend: 3010, optimized: 2980 },
  { m: "Aug", spend: 3120, optimized: 2940 },
  { m: "Sep", spend: 3050, optimized: 2710 },
  { m: "Oct", spend: 3116, optimized: 2050 },
  { m: "Nov", spend: 3116, optimized: 2050 },
];

export const totalMonthly = DEMO_AUDIT.reduce((s, e) => s + e.monthlyCost, 0);
export const totalSavings = DEMO_RECOMMENDATIONS.reduce((s, r) => s + r.monthlySavings, 0);

// Tool pricing catalog — single source of truth for the audit engine.
// Prices reflect public vendor pricing (USD/seat/month unless noted).
// Keep this colocated with the engine so rules can reason about pricing tiers
// without round-tripping to the DB. Reviewed quarterly.

export type PlanTier = {
  name: string;
  price: number;          // per seat (or per month for usage-based)
  per: "seat" | "month";
  minSeats?: number;      // e.g. Team plans often require 2+
  features?: string[];
};

export type CatalogTool = {
  id: string;
  name: string;
  category: "Assistant" | "IDE" | "API" | "Design";
  vendor: string;
  plans: PlanTier[];
  // Cheaper alternative within the same category (used by `switch` rules)
  alternativeId?: string;
};

export const CATALOG: Record<string, CatalogTool> = {
  chatgpt: {
    id: "chatgpt", name: "ChatGPT", category: "Assistant", vendor: "OpenAI",
    plans: [
      { name: "Plus",       price: 20, per: "seat" },
      { name: "Team",       price: 30, per: "seat", minSeats: 2, features: ["admin", "shared-workspace"] },
      { name: "Enterprise", price: 60, per: "seat", minSeats: 150, features: ["sso", "audit-log"] },
    ],
  },
  claude: {
    id: "claude", name: "Claude", category: "Assistant", vendor: "Anthropic",
    plans: [
      { name: "Pro",  price: 20, per: "seat" },
      { name: "Team", price: 30, per: "seat", minSeats: 5, features: ["admin"] },
    ],
  },
  cursor: {
    id: "cursor", name: "Cursor", category: "IDE", vendor: "Anysphere",
    plans: [
      { name: "Pro",      price: 20, per: "seat" },
      { name: "Business", price: 40, per: "seat", minSeats: 2, features: ["admin", "privacy-mode"] },
    ],
    alternativeId: "copilot",
  },
  copilot: {
    id: "copilot", name: "GitHub Copilot", category: "IDE", vendor: "GitHub",
    plans: [
      { name: "Individual", price: 10, per: "seat" },
      { name: "Business",   price: 19, per: "seat" },
      { name: "Enterprise", price: 39, per: "seat", minSeats: 100 },
    ],
    alternativeId: "cursor",
  },
  gemini: {
    id: "gemini", name: "Gemini", category: "Assistant", vendor: "Google",
    plans: [
      { name: "Advanced", price: 20, per: "seat" },
      { name: "Business", price: 24, per: "seat", minSeats: 2 },
    ],
  },
  "openai-api": {
    id: "openai-api", name: "OpenAI API", category: "API", vendor: "OpenAI",
    plans: [{ name: "Usage", price: 0, per: "month" }],
  },
  "anthropic-api": {
    id: "anthropic-api", name: "Anthropic API", category: "API", vendor: "Anthropic",
    plans: [{ name: "Usage", price: 0, per: "month" }],
  },
  windsurf: {
    id: "windsurf", name: "Windsurf", category: "IDE", vendor: "Codeium",
    plans: [
      { name: "Pro",   price: 15, per: "seat" },
      { name: "Teams", price: 35, per: "seat", minSeats: 2 },
    ],
  },
  v0: {
    id: "v0", name: "v0", category: "Design", vendor: "Vercel",
    plans: [
      { name: "Premium", price: 20, per: "seat" },
      { name: "Team",    price: 50, per: "seat", minSeats: 2 },
    ],
  },
};

export function getTool(id: string): CatalogTool | undefined {
  return CATALOG[id];
}

export function getPlan(toolId: string, planName: string): PlanTier | undefined {
  return CATALOG[toolId]?.plans.find((p) => p.name === planName);
}

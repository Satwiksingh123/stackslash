import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/app/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stackslash — Stop overpaying for your AI stack" },
      { name: "description", content: "Stackslash audits your team's AI tool spend — ChatGPT, Claude, Cursor, Copilot, API usage — and finds exactly where you're wasting money. Free audit in 60 seconds." },
      { property: "og:title", content: "Stackslash — Stop overpaying for your AI stack" },
      { property: "og:description", content: "Find hidden savings in your AI stack. The spend intelligence layer for modern engineering teams." },
    ],
  }),
  component: Landing,
});

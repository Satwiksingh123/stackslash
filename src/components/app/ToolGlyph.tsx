import type { Tool } from "@/lib/audit/demo";

export function ToolGlyph({ tool, size = 36 }: { tool: Tool; size?: number }) {
  return (
    <div
      className="relative rounded-xl grid place-items-center font-display text-base shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${tool.color}22, ${tool.color}06)`,
        border: `1px solid ${tool.color}33`,
        color: tool.color,
        boxShadow: `inset 0 1px 0 ${tool.color}22`,
      }}
    >
      <span className="leading-none">{tool.logo}</span>
    </div>
  );
}

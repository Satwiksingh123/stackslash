# Stackslash

**AI spend audit platform for engineering teams.**

Stackslash audits your team's AI stack — ChatGPT, Claude, Cursor, Copilot, API spend — and surfaces the exact dollars you're wasting. In 60 seconds. Without a sales call.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (SSR, React 19) |
| Routing | TanStack Router (file-based) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Deployment | Cloudflare Workers |
| Styling | Tailwind CSS 4 + shadcn/ui |
| AI Summaries | Google Gemini API |
| Runtime | Bun |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- A [Supabase](https://supabase.com) project
- A [Cloudflare](https://cloudflare.com) account

### Local Development

```bash
# Install dependencies
bun install

# Copy and fill in environment variables
cp .env.example .env

# Start the development server
bun run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, never exposed to browser) |
| `GEMINI_API_KEY` | Google Gemini API key for AI-generated audit summaries |

## Project Structure

```
src/
├── components/
│   ├── app/           # Application components (Nav, Landing, etc.)
│   └── ui/            # shadcn/ui base components
├── hooks/             # Shared React hooks (useAuth, useMobile)
├── lib/
│   ├── audit/         # Audit engine, schemas, AI summary, server actions
│   ├── supabase/      # Supabase clients, auth middleware
│   └── user/          # User profile server actions
└── routes/
    ├── _authenticated/ # Auth-protected routes (dashboard, audit, results)
    └── ...             # Public routes (index, about, auth, report)
```

## License

MIT

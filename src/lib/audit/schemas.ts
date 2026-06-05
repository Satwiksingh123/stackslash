// Shared Zod schemas — safe to import from client and server.
import { z } from "zod";

export const auditItemSchema = z.object({
  toolId: z.string().min(1).max(64),
  plan: z.string().min(1).max(64),
  seats: z.number().int().min(1).max(10_000),
  monthlyCost: z.number().min(0).max(1_000_000),
  useCase: z.string().max(500).optional(),
});

export const createAuditSchema = z.object({
  teamSize: z.number().int().min(1).max(50_000),
  stage: z.string().max(32).optional(),
  useCase: z.string().max(1000).optional(),
  items: z.array(auditItemSchema).min(1).max(30),
});

export const captureLeadSchema = z.object({
  auditId: z.string().uuid().optional(),
  email: z.string().email().max(255),
  company: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  teamSize: z.number().int().min(1).max(50_000).optional(),
  // Honeypot — should always be empty. Bots fill every visible field.
  website: z.string().max(0).optional(),
});

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type CaptureLeadInput = z.infer<typeof captureLeadSchema>;

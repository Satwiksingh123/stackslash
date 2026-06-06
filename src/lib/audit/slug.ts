// Unguessable, URL-friendly slugs for public audit reports.
// 10 chars from a 32-symbol alphabet = ~50 bits of entropy. Plenty for an
// anonymous share token that's also fine to type.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/1/i/l/o ambiguity

export function generateSlug(prefix?: string): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  const clean = (prefix ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
  return clean ? `${clean}-${out}` : out;
}

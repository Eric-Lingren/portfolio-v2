// Shared guard that flags labels which look like a personal name.
export const ROLE_WORDS =
  /\b(engineer|developer|manager|director|lead|founder|cto|ceo|vp|head|architect|designer|analyst|recruiter|colleague|peer|mentor|teammate|principal|staff|senior|junior|intern|consultant|owner|product|engineering|executive|partner|client|customer|dispatcher)\b/i;

export function looksLikePersonalName(label, blocklist = []) {
  const text = String(label ?? "").trim();
  if (!text) return true;
  const lower = text.toLowerCase();
  if (blocklist.some((n) => n && lower.includes(n.toLowerCase()))) return true;
  if (/[@\d]/.test(text)) return true;
  const namePattern = /^[A-Z][a-z'’-]+(\s+[A-Z]\.?)?(\s+[A-Z][a-z'’-]+){1,2}$/;
  return namePattern.test(text) && !ROLE_WORDS.test(text);
}

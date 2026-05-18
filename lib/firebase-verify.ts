// Decodes a Firebase ID token locally (verifies expiry, not signature).
// Sufficient for a learning app — use firebase-admin for strict security.
export function decodeFirebaseToken(idToken: string): { uid: string; email: string } | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    // Base64url → base64 → parse JSON
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    const payload = JSON.parse(json);

    if (!payload.sub || !payload.email) return null;

    // Reject expired tokens
    if (typeof payload.exp === "number" && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { uid: payload.sub as string, email: payload.email as string };
  } catch {
    return null;
  }
}

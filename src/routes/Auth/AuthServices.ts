import crypto from "crypto";

export function generateClientId(companyName: string): string {
  const sanitized = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `client-${sanitized}-${randomSuffix}`;
}

export function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
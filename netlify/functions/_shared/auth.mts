import { createHash, timingSafeEqual } from "node:crypto";
export function hashSecret(secret: string): string { return createHash("sha256").update(secret).digest("hex"); }
export function verifySecret(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashSecret(secret), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function assertString(value: unknown, name: string, maxLength = 4096): asserts value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) throw new Error(`Invalid ${name}`);
}

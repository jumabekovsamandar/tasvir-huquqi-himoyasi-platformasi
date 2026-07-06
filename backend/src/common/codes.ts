import { randomBytes } from 'crypto';

/** Reyestr kodi, masalan: IMG-2026-4F8A2C */
export function generateRegistryCode(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `IMG-${year}-${suffix}`;
}

/** Ish raqami, masalan: IR-2026-8C41F0 */
export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `IR-${year}-${suffix}`;
}

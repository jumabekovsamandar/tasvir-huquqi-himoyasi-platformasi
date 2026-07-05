/** Mirrors `HealthReport` in src-tauri/src/commands.rs. */
export interface HealthReport {
  appVersion: string;
  dbHealthy: boolean;
  schemaVersion: number;
  launchCount: number;
  dataDir: string;
  logDir: string;
}

/** Mirrors `CommandError` in src-tauri/src/commands.rs. */
export interface CommandError {
  code: string;
  message: string;
}

export type Language = "uz" | "en";

export function isCommandError(value: unknown): value is CommandError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value
  );
}

import { invoke } from "@tauri-apps/api/core";
import type { HealthReport } from "../types";

/**
 * True when running inside the Tauri shell. In a plain browser (e.g. `vite
 * dev` opened directly) commands are unavailable and the UI must say so
 * honestly instead of pretending.
 */
export function isTauriRuntime(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

export function healthCheck(): Promise<HealthReport> {
  return invoke<HealthReport>("health_check");
}

export function getSetting(key: string): Promise<unknown> {
  return invoke<unknown>("get_setting", { key });
}

export function setSetting(key: string, value: unknown): Promise<void> {
  return invoke<void>("set_setting", { key, value });
}

export function listSettings(): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("list_settings");
}

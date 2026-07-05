import { useCallback, useEffect, useState } from "react";
import { getSetting, healthCheck, isTauriRuntime, setSetting } from "./lib/ipc";
import type { HealthReport, Language } from "./types";
import { isCommandError } from "./types";

const STRINGS = {
  uz: {
    subtitle: "Shaxsiy AI yordamchi",
    phase: "0-bosqich: poydevor",
    systemStatus: "Tizim holati",
    appVersion: "Dastur versiyasi",
    database: "Ma'lumotlar bazasi",
    dbOk: "ishlamoqda",
    dbFail: "xatolik",
    schemaVersion: "Sxema versiyasi",
    launchCount: "Ishga tushirishlar soni",
    dataDir: "Ma'lumotlar joyi",
    settings: "Sozlamalar",
    language: "Til",
    displayName: "Murojaat ismi",
    saved: "Saqlandi",
    noRuntime:
      "Tauri muhiti topilmadi. Bu sahifa oddiy brauzerda ochilgan — dasturni «pnpm tauri dev» orqali ishga tushiring.",
    healthError: "Tizim holatini o'qib bo'lmadi",
  },
  en: {
    subtitle: "Personal AI assistant",
    phase: "Phase 0: foundation",
    systemStatus: "System status",
    appVersion: "App version",
    database: "Database",
    dbOk: "operational",
    dbFail: "error",
    schemaVersion: "Schema version",
    launchCount: "Launch count",
    dataDir: "Data location",
    settings: "Settings",
    language: "Language",
    displayName: "Preferred name",
    saved: "Saved",
    noRuntime:
      "Tauri runtime not found. This page is running in a plain browser — start the app with `pnpm tauri dev`.",
    healthError: "Could not read system status",
  },
} as const;

function errorText(err: unknown): string {
  if (isCommandError(err)) return `${err.message} (${err.code})`;
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function App() {
  const inTauri = isTauriRuntime();
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("uz");
  const [displayName, setDisplayName] = useState("");
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const t = STRINGS[language];

  useEffect(() => {
    if (!inTauri) return;
    healthCheck()
      .then(setHealth)
      .catch((err) => setHealthError(errorText(err)));
    getSetting("language")
      .then((v) => {
        if (v === "uz" || v === "en") setLanguage(v);
      })
      .catch(() => undefined);
    getSetting("user_display_name")
      .then((v) => {
        if (typeof v === "string") setDisplayName(v);
      })
      .catch(() => undefined);
  }, [inTauri]);

  const persist = useCallback(async (key: string, value: unknown) => {
    setSaveError(null);
    try {
      await setSetting(key, value);
      setSavedNote(key);
      window.setTimeout(() => setSavedNote(null), 1500);
    } catch (err) {
      setSaveError(errorText(err));
    }
  }, []);

  return (
    <main className="shell">
      <header className="header">
        <div className="orb" aria-hidden="true" />
        <div>
          <h1>SAM JUNIOR</h1>
          <p className="muted">
            {t.subtitle} · {t.phase}
          </p>
        </div>
      </header>

      {!inTauri && <div className="banner warning">{t.noRuntime}</div>}

      {inTauri && (
        <>
          <section className="card">
            <h2>{t.systemStatus}</h2>
            {healthError && (
              <div className="banner error">
                {t.healthError}: {healthError}
              </div>
            )}
            {health && (
              <dl className="grid">
                <dt>{t.appVersion}</dt>
                <dd>{health.appVersion}</dd>
                <dt>{t.database}</dt>
                <dd className={health.dbHealthy ? "ok" : "bad"}>
                  {health.dbHealthy ? t.dbOk : t.dbFail}
                </dd>
                <dt>{t.schemaVersion}</dt>
                <dd>{health.schemaVersion}</dd>
                <dt>{t.launchCount}</dt>
                <dd>{health.launchCount}</dd>
                <dt>{t.dataDir}</dt>
                <dd className="path">{health.dataDir}</dd>
              </dl>
            )}
          </section>

          <section className="card">
            <h2>{t.settings}</h2>
            {saveError && <div className="banner error">{saveError}</div>}
            <label className="field">
              <span>{t.language}</span>
              <select
                value={language}
                onChange={(e) => {
                  const next = e.target.value as Language;
                  setLanguage(next);
                  void persist("language", next);
                }}
              >
                <option value="uz">O&apos;zbekcha</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="field">
              <span>{t.displayName}</span>
              <input
                type="text"
                value={displayName}
                maxLength={64}
                onChange={(e) => setDisplayName(e.target.value)}
                onBlur={() => void persist("user_display_name", displayName)}
              />
            </label>
            {savedNote && <p className="muted saved">{t.saved}</p>}
          </section>
        </>
      )}
    </main>
  );
}

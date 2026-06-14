import { FolderLock, Download, FileText, Camera, Clock, Hash } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const EVIDENCE = [
  {
    id: "EV-2026-0481",
    type: "Screenshot + Metadata",
    source: "instagram.com/fakeaccount",
    captured: "13-iyun, 2026 · 14:22",
    hash: "9f2a…c71e",
  },
  {
    id: "EV-2026-0479",
    type: "Deepfake hisoboti",
    source: "video_tarqaldi.mp4",
    captured: "12-iyun, 2026 · 09:10",
    hash: "1b8d…44a0",
  },
  {
    id: "EV-2026-0475",
    type: "Monitoring hisoboti",
    source: "reklama-sayt.uz",
    captured: "11-iyun, 2026 · 18:47",
    hash: "7c3f…9e22",
  },
];

export default function EvidencePage() {
  return (
    <>
      <PageHeader
        title="Elektron Dalillar Ombori"
        description="Screenshot, metadata, vaqt tamg‘asi va hisobotlar huquqiy kuchga ega elektron dalil sifatida buzilmas saqlanadi."
        action={
          <button className="btn-secondary">
            <Download className="h-4 w-4" /> Hammasini eksport
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4">
        <StatCard label="Saqlangan dalillar" value="129" icon={FolderLock} tone="brand" />
        <StatCard label="Screenshotlar" value="64" icon={Camera} tone="amber" />
        <StatCard label="Hisobotlar" value="41" icon={FileText} tone="green" />
        <StatCard label="Vaqt tamg‘alari" value="129" icon={Clock} tone="brand" />
      </div>

      <Panel title="Dalillar ro‘yxati">
        <div className="space-y-3">
          {EVIDENCE.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink-100 p-4 transition hover:border-brand-200 hover:bg-ink-50/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FolderLock className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink-900">{e.id}</span>
                    <StatusBadge tone="green">Tasdiqlangan</StatusBadge>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-600">{e.type} · {e.source}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {e.captured}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Hash className="h-3.5 w-3.5" /> SHA-256: {e.hash}
                    </span>
                  </p>
                </div>
              </div>
              <button className="btn-secondary self-start sm:self-auto">
                <Download className="h-4 w-4" /> Yuklab olish
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

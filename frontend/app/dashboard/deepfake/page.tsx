import { ScanFace, Upload, Video, Sparkles, ShieldAlert } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/dashboard/ui";

const SIGNALS = [
  { label: "Yuz almashtirish (face swap)", value: 92, tone: "red", icon: ScanFace },
  { label: "Video montaj izlari", value: 68, tone: "amber", icon: Video },
  { label: "AI-generativ kontent", value: 88, tone: "red", icon: Sparkles },
  { label: "Metadata nomuvofiqligi", value: 41, tone: "amber", icon: ShieldAlert },
];

export default function DeepfakePage() {
  return (
    <>
      <PageHeader
        title="Deepfake Aniqlash"
        description="Sun'iy intellekt yuz almashtirish, video montaj va AI-kontentni tahlil qilib, ishonchlilik foizini ko‘rsatadi."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Bajarilgan tahlillar" value="312" icon={ScanFace} tone="brand" />
        <StatCard label="Aniqlangan deepfake" value="18" icon={ShieldAlert} tone="red" />
        <StatCard label="O‘rtacha aniqlik" value="99.2%" icon={Sparkles} tone="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Yangi tahlil">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <Upload className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-900">
              Rasm yoki video yuklang
            </p>
            <p className="mt-1 text-xs text-ink-500">JPG, PNG, MP4 — maksimal 200 MB</p>
            <input type="file" className="hidden" accept="image/*,video/*" />
          </label>
          <button className="btn-primary mt-5 w-full">
            <ScanFace className="h-4 w-4" /> Tahlilni boshlash
          </button>
        </Panel>

        <Panel title="So‘nggi natija">
          <div className="rounded-2xl bg-ink-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/70">
                video_tarqaldi.mp4
              </span>
              <span className="rounded-full bg-red-500/15 px-3 py-1 text-sm font-bold text-red-300">
                94% soxta
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {SIGNALS.map((s) => (
                <div key={s.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-white/70">
                      <s.icon className="h-3.5 w-3.5" /> {s.label}
                    </span>
                    <span className="font-semibold">{s.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${s.tone === "red" ? "bg-red-400" : "bg-amber-400"}`}
                      style={{ width: `${s.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-xs text-ink-500">
            Natija avtomatik ravishda elektron dalillar omboriga vaqt tamg‘asi
            bilan saqlandi.
          </p>
        </Panel>
      </div>
    </>
  );
}

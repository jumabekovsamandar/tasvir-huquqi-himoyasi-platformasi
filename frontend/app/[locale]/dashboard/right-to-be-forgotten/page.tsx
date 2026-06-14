import { Eraser, Link2, CheckCircle2, Clock, Send } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const REQUESTS = [
  {
    url: "search.engine/result?q=...",
    submitted: "12-iyun, 2026",
    stage: "O‘chirildi",
    tone: "green",
    progress: 100,
  },
  {
    url: "old-blog.uz/2021/post",
    submitted: "10-iyun, 2026",
    stage: "Provayder javobi kutilmoqda",
    tone: "amber",
    progress: 60,
  },
  {
    url: "archive.site/snapshot",
    submitted: "09-iyun, 2026",
    stage: "Talabnoma tayyorlandi",
    tone: "blue",
    progress: 30,
  },
];

export default function RightToBeForgottenPage() {
  return (
    <>
      <PageHeader
        title="Unutilish Huquqi"
        description="Havolani yuboring — tizim o‘chirish talabnomasini avtomatik tayyorlaydi va jarayonni boshidan oxirigacha kuzatadi."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Jami so‘rovlar" value="21" icon={Eraser} tone="brand" />
        <StatCard label="Muvaffaqiyatli o‘chirildi" value="16" icon={CheckCircle2} tone="green" />
        <StatCard label="Jarayonda" value="5" icon={Clock} tone="amber" />
      </div>

      <Panel title="Yangi o‘chirish so‘rovi">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              placeholder="https://o‘chirilishi kerak bo‘lgan havola..."
              className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <button className="btn-primary">
            <Send className="h-4 w-4" /> So‘rov yuborish
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-500">
          Tizim havolani tahlil qiladi, mas'ul provayderni aniqlaydi va qonuniy
          asoslarga muvofiq o‘chirish talabnomasini shakllantiradi.
        </p>
      </Panel>

      <Panel title="So‘rovlar holati">
        <div className="space-y-4">
          {REQUESTS.map((r, i) => (
            <div key={i} className="rounded-2xl border border-ink-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="truncate font-medium text-ink-900">{r.url}</p>
                <StatusBadge tone={r.tone}>{r.stage}</StatusBadge>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full bg-brand-600"
                  style={{ width: `${r.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-400">Yuborilgan: {r.submitted}</p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

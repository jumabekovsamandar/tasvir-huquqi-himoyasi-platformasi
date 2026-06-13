import { Gavel, FileText, Send, Sparkles, ArrowRight } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const TEMPLATES = [
  { title: "Ogohlantirish xati", desc: "Huquqbuzarni xabardor qilish va ixtiyoriy olib tashlashni talab qilish.", time: "~1 daqiqa" },
  { title: "Tasvirni olib tashlash talabi", desc: "Platforma yoki hosting provayderga rasmiy DMCA-uslubidagi talab.", time: "~2 daqiqa" },
  { title: "Sudgacha talabnoma", desc: "Zarar qoplash va huquqbuzarlikni to‘xtatish bo‘yicha rasmiy talabnoma.", time: "~3 daqiqa" },
  { title: "Da'vo arizasi", desc: "Sudga taqdim etish uchun to‘liq da'vo arizasi loyihasi.", time: "~3 daqiqa" },
];

const DRAFTS = [
  { name: "Ogohlantirish xati — fakeaccount", date: "13-iyun, 2026", status: "Yuborildi", tone: "green" },
  { name: "Olib tashlash talabi — reklama-sayt.uz", date: "11-iyun, 2026", status: "Javob kutilmoqda", tone: "amber" },
  { name: "Sudgacha talabnoma — Local Brand", date: "08-iyun, 2026", status: "Qoralama", tone: "gray" },
];

export default function LegalAssistantPage() {
  return (
    <>
      <PageHeader
        title="AI Yuridik Yordamchi"
        description="Elektron dalillaringiz asosida professional huquqiy hujjatlarni bir necha daqiqada avtomatik shakllantiring."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Yaratilgan hujjatlar" value="27" icon={FileText} tone="brand" />
        <StatCard label="Yuborilgan talablar" value="19" icon={Send} tone="green" />
        <StatCard label="Muvaffaqiyatli hal" value="14" icon={Gavel} tone="amber" />
      </div>

      <Panel title="Hujjat yaratish">
        <div className="grid gap-4 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.title}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-ink-100 p-5 text-left transition hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="flex gap-3.5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ink-800 text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-ink-600">{t.desc}</p>
                  <span className="mt-2 inline-block text-xs font-medium text-ink-400">
                    {t.time}
                  </span>
                </div>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Mening hujjatlarim">
        <div className="space-y-3">
          {DRAFTS.map((d) => (
            <div
              key={d.name}
              className="flex items-center justify-between rounded-2xl border border-ink-100 p-4 hover:bg-ink-50/40"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-500">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-ink-900">{d.name}</p>
                  <p className="text-xs text-ink-400">{d.date}</p>
                </div>
              </div>
              <StatusBadge tone={d.tone}>{d.status}</StatusBadge>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}

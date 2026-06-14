import { Upload, ShieldCheck, Clock, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const IMAGES = [
  { name: "Portret_2026.jpg", date: "13-iyun, 2026", id: "IR-48F2A1", status: "Tasdiqlangan", tone: "green" },
  { name: "Studiya_seti_04.png", date: "11-iyun, 2026", id: "IR-39C7B0", status: "Tasdiqlangan", tone: "green" },
  { name: "Reklama_kampaniya.jpg", date: "09-iyun, 2026", id: "IR-22A9E5", status: "Tekshirilmoqda", tone: "amber" },
  { name: "Konsert_2025.jpg", date: "02-iyun, 2026", id: "IR-11D4C8", status: "Tasdiqlangan", tone: "green" },
];

export default function RegistryPage() {
  return (
    <>
      <PageHeader
        title="Tasvir Huquqi Reyestri"
        description="Suratlaringizni yuklang, egalikni tasdiqlang va tasvir huquqini vaqt tamg‘asi bilan ro‘yxatdan o‘tkazing."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Ro‘yxatdagi tasvir" value="48" icon={ImageIcon} tone="brand" />
        <StatCard label="Tasdiqlangan egalik" value="45" icon={ShieldCheck} tone="green" />
        <StatCard label="Tekshiruvda" value="3" icon={Clock} tone="amber" />
      </div>

      <Panel title="Yangi tasvir ro‘yxatdan o‘tkazish">
        <div className="grid gap-6 lg:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <Upload className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink-900">
              Suratni shu yerga tashlang yoki tanlang
            </p>
            <p className="mt-1 text-xs text-ink-500">JPG, PNG, HEIC — maksimal 25 MB</p>
            <input type="file" className="hidden" accept="image/*" />
          </label>

          <div className="space-y-4">
            <Step n={1} title="Faylni yuklang" desc="Tasvir xavfsiz S3 omborida shifrlanadi." />
            <Step n={2} title="Egalikni tasdiqlang" desc="Metadata va EXIF avtomatik tahlil qilinadi." />
            <Step n={3} title="Huquqni ro‘yxatdan o‘tkazing" desc="Blokcheyn-uslubidagi vaqt tamg‘asi yaratiladi." />
            <button className="btn-primary w-full">Ro‘yxatdan o‘tkazish</button>
          </div>
        </div>
      </Panel>

      <Panel title="Mening tasvirlarim">
        <div className="-mx-6 -my-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="px-6 py-3 font-semibold">Tasvir</th>
                <th className="px-6 py-3 font-semibold">Reyestr ID</th>
                <th className="px-6 py-3 font-semibold">Ro‘yxat sanasi</th>
                <th className="px-6 py-3 font-semibold">Holat</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {IMAGES.map((img) => (
                <tr key={img.id} className="hover:bg-ink-50/50">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                        <ImageIcon className="h-5 w-5" />
                      </span>
                      <span className="font-medium text-ink-900">{img.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-ink-500">{img.id}</td>
                  <td className="px-6 py-3.5 text-ink-600">{img.date}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge tone={img.tone}>{img.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="rounded-lg p-2 text-ink-400 hover:bg-ink-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-3.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
        {n}
      </span>
      <div>
        <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  ShieldCheck,
  Globe2,
  ScanFace,
  FolderLock,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { PageHeader, StatCard, Panel, StatusBadge } from "@/components/dashboard/ui";

const ALERTS = [
  {
    site: "instagram.com/fakeaccount",
    type: "Ruxsatsiz foydalanish",
    date: "13-iyun, 2026",
    tone: "red",
    status: "Yangi",
  },
  {
    site: "telegram-kanal · @news",
    type: "Deepfake gumoni (94%)",
    date: "12-iyun, 2026",
    tone: "red",
    status: "Tekshirilmoqda",
  },
  {
    site: "reklama-sayt.uz",
    type: "Tijorat foydalanish",
    date: "11-iyun, 2026",
    tone: "amber",
    status: "Da'vo yuborildi",
  },
  {
    site: "blog.example.com",
    type: "Nusxa topildi",
    date: "10-iyun, 2026",
    tone: "blue",
    status: "Hal qilindi",
  },
];

const ACTIVITY = [
  { icon: ShieldCheck, text: "“Portret_2026.jpg” reyestrga qo‘shildi", time: "2 soat oldin", tone: "green" },
  { icon: ScanFace, text: "Deepfake tahlili yakunlandi — 94% xavf", time: "5 soat oldin", tone: "red" },
  { icon: FolderLock, text: "Yangi elektron dalil saqlandi", time: "1 kun oldin", tone: "blue" },
  { icon: CheckCircle2, text: "Ogohlantirish xati yuborildi", time: "2 kun oldin", tone: "green" },
];

export default function DashboardOverview() {
  return (
    <>
      <PageHeader
        title="Xush kelibsiz, Dilnoza 👋"
        description="Tasvir huquqlaringizning umumiy holati va so‘nggi faoliyat."
        action={
          <Link href="/dashboard/registry" className="btn-primary">
            <Upload className="h-4 w-4" /> Tasvir yuklash
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Himoyalangan tasvir" value="48" icon={ShieldCheck} trend="+6" tone="brand" />
        <StatCard label="Faol monitoring" value="24/7" icon={Globe2} tone="green" />
        <StatCard label="Aniqlangan xavf" value="3" icon={AlertTriangle} trend="Yangi" tone="red" />
        <StatCard label="Elektron dalil" value="129" icon={FolderLock} trend="+12" tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Monitoring ogohlantirishlari"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/monitoring" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
              Barchasi <ArrowUpRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="-mx-6 -my-6 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-6 py-3 font-semibold">Manba</th>
                  <th className="px-6 py-3 font-semibold">Turi</th>
                  <th className="px-6 py-3 font-semibold">Sana</th>
                  <th className="px-6 py-3 font-semibold">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {ALERTS.map((a) => (
                  <tr key={a.site} className="hover:bg-ink-50/50">
                    <td className="px-6 py-3.5 font-medium text-ink-900">{a.site}</td>
                    <td className="px-6 py-3.5 text-ink-600">{a.type}</td>
                    <td className="px-6 py-3.5 text-ink-500">{a.date}</td>
                    <td className="px-6 py-3.5">
                      <StatusBadge tone={a.tone}>{a.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="So‘nggi faoliyat">
          <ul className="space-y-5">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    a.tone === "red"
                      ? "bg-red-50 text-red-600"
                      : a.tone === "green"
                        ? "bg-green-50 text-green-600"
                        : "bg-brand-50 text-brand-600"
                  }`}
                >
                  <a.icon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm text-ink-800">{a.text}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

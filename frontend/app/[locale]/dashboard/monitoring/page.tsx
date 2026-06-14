import { Globe2, ExternalLink, Camera, Search, ShieldAlert } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const MATCHES = [
  {
    url: "instagram.com/fakeaccount/p/Cx9",
    match: "98%",
    found: "13-iyun, 2026",
    status: "Ruxsatsiz",
    tone: "red",
  },
  {
    url: "t.me/news_channel/2841",
    match: "95%",
    found: "12-iyun, 2026",
    status: "Tekshirilmoqda",
    tone: "amber",
  },
  {
    url: "reklama-sayt.uz/banner",
    match: "91%",
    found: "11-iyun, 2026",
    status: "Da'vo yuborildi",
    tone: "blue",
  },
  {
    url: "blog.example.com/article-12",
    match: "100%",
    found: "10-iyun, 2026",
    status: "Hal qilindi",
    tone: "green",
  },
  {
    url: "pinterest.com/pin/55321",
    match: "87%",
    found: "08-iyun, 2026",
    status: "Ruxsat berilgan",
    tone: "gray",
  },
];

export default function MonitoringPage() {
  return (
    <>
      <PageHeader
        title="Internet Monitoring"
        description="Reverse image search yordamida tasviringiz nusxalari internetdan topiladi — havola, sana va screenshot bilan."
        action={
          <button className="btn-primary">
            <Search className="h-4 w-4" /> Skanerlashni boshlash
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4">
        <StatCard label="Topilgan nusxalar" value="64" icon={Globe2} tone="brand" />
        <StatCard label="Ruxsatsiz" value="9" icon={ShieldAlert} tone="red" />
        <StatCard label="Saqlangan screenshot" value="64" icon={Camera} tone="amber" />
        <StatCard label="Hal qilingan" value="38" icon={ExternalLink} tone="green" />
      </div>

      <Panel title="Topilgan nusxalar">
        <div className="-mx-6 -my-6 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="px-6 py-3 font-semibold">Havola</th>
                <th className="px-6 py-3 font-semibold">Moslik</th>
                <th className="px-6 py-3 font-semibold">Topilgan sana</th>
                <th className="px-6 py-3 font-semibold">Holat</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {MATCHES.map((m, i) => (
                <tr key={i} className="hover:bg-ink-50/50">
                  <td className="px-6 py-3.5">
                    <a href="#" className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline">
                      {m.url} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-ink-900">{m.match}</td>
                  <td className="px-6 py-3.5 text-ink-600">{m.found}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge tone={m.tone}>{m.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="text-xs font-semibold text-ink-600 hover:text-brand-600">
                      Screenshot
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

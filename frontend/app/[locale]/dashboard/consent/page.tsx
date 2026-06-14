import { FileCheck2, Ban, Briefcase, Plus } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const CONSENTS = [
  {
    party: "Vogue Uzbekistan",
    image: "Studiya_seti_04.png",
    type: "Tijorat litsenziyasi",
    expires: "31-dek, 2026",
    status: "Faol",
    tone: "green",
  },
  {
    party: "Milliy axborot agentligi",
    image: "Konsert_2025.jpg",
    type: "Tahririy foydalanish",
    expires: "Muddatsiz",
    status: "Faol",
    tone: "green",
  },
  {
    party: "Noma'lum reklama agentligi",
    image: "Portret_2026.jpg",
    type: "Tijorat foydalanish",
    expires: "—",
    status: "Taqiqlangan",
    tone: "red",
  },
  {
    party: "Local Brand LLC",
    image: "Reklama_kampaniya.jpg",
    type: "Ijtimoiy tarmoq",
    expires: "01-avg, 2026",
    status: "Bekor qilingan",
    tone: "gray",
  },
];

export default function ConsentPage() {
  return (
    <>
      <PageHeader
        title="Rozilik Boshqaruvi"
        description="Tasviringizdan kim, qaysi maqsadda va qancha muddat foydalanishini to‘liq nazorat qiling."
        action={
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> Yangi rozilik
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Faol roziliklar" value="12" icon={FileCheck2} tone="green" />
        <StatCard label="Tijorat litsenziyalari" value="4" icon={Briefcase} tone="brand" />
        <StatCard label="Taqiqlar" value="7" icon={Ban} tone="red" />
      </div>

      <Panel title="Rozilik yozuvlari">
        <div className="-mx-6 -my-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="px-6 py-3 font-semibold">Taraf</th>
                <th className="px-6 py-3 font-semibold">Tasvir</th>
                <th className="px-6 py-3 font-semibold">Foydalanish turi</th>
                <th className="px-6 py-3 font-semibold">Muddat</th>
                <th className="px-6 py-3 font-semibold">Holat</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {CONSENTS.map((c, i) => (
                <tr key={i} className="hover:bg-ink-50/50">
                  <td className="px-6 py-3.5 font-medium text-ink-900">{c.party}</td>
                  <td className="px-6 py-3.5 text-ink-500">{c.image}</td>
                  <td className="px-6 py-3.5 text-ink-600">{c.type}</td>
                  <td className="px-6 py-3.5 text-ink-600">{c.expires}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge tone={c.tone}>{c.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {c.status === "Faol" ? (
                      <button className="text-xs font-semibold text-red-600 hover:underline">
                        Bekor qilish
                      </button>
                    ) : (
                      <button className="text-xs font-semibold text-brand-600 hover:underline">
                        Ko‘rish
                      </button>
                    )}
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

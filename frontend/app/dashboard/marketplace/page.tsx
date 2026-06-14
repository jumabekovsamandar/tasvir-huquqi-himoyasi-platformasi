import { Store, Plus, TrendingUp, FileSignature, Image as ImageIcon } from "lucide-react";
import { PageHeader, Panel, StatusBadge, StatCard } from "@/components/dashboard/ui";

const LISTINGS = [
  { name: "Studiya portreti #04", license: "Tijorat", price: "2 500 000", status: "Sotuvda", tone: "green" },
  { name: "Konsert seriyasi", license: "Tahririy", price: "900 000", status: "Sotuvda", tone: "green" },
  { name: "Reklama kampaniyasi", license: "Eksklyuziv", price: "8 000 000", status: "Sotildi", tone: "blue" },
];

const DEALS = [
  { buyer: "Vogue Uzbekistan", item: "Studiya portreti #04", amount: "2 500 000", status: "Shartnoma imzolandi", tone: "green" },
  { buyer: "MediaPro Agency", item: "Konsert seriyasi", amount: "900 000", status: "To‘lov kutilmoqda", tone: "amber" },
];

export default function MarketplacePage() {
  return (
    <>
      <PageHeader
        title="Tasvir Litsenziyalash Bozori"
        description="Tasvirlaringizdan foydalanish huquqini soting. Kompaniyalar litsenziya sotib olib, elektron shartnoma tuzadi."
        action={
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> E'lon joylash
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4">
        <StatCard label="Faol e'lonlar" value="7" icon={Store} tone="brand" />
        <StatCard label="Sotilgan litsenziya" value="14" icon={FileSignature} tone="green" />
        <StatCard label="Umumiy daromad" value="34.4M" icon={TrendingUp} trend="+18%" tone="amber" />
        <StatCard label="Faol shartnomalar" value="9" icon={FileSignature} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Mening e'lonlarim">
          <div className="space-y-3">
            {LISTINGS.map((l, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-ink-100 p-4 hover:bg-ink-50/40">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                    <ImageIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-ink-900">{l.name}</p>
                    <p className="text-xs text-ink-500">{l.license} litsenziya · {l.price} so‘m</p>
                  </div>
                </div>
                <StatusBadge tone={l.tone}>{l.status}</StatusBadge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Bitimlar va shartnomalar">
          <div className="space-y-3">
            {DEALS.map((d, i) => (
              <div key={i} className="rounded-2xl border border-ink-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-900">{d.buyer}</p>
                  <StatusBadge tone={d.tone}>{d.status}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-ink-600">{d.item}</p>
                <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-sm text-ink-500">Summa</span>
                  <span className="font-semibold text-ink-900">{d.amount} so‘m</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

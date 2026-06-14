import { User, Lock, Bell, CreditCard, ShieldCheck } from "lucide-react";
import { PageHeader, Panel } from "@/components/dashboard/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Sozlamalar"
        description="Hisob, xavfsizlik, bildirishnomalar va to‘lov sozlamalarini boshqaring."
      />

      <Panel title="Profil ma'lumotlari">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="To‘liq ism" value="Dilnoza Karimova" icon={User} />
          <Field label="Email" value="dilnoza@email.com" icon={User} />
          <Field label="Telefon" value="+998 90 123 45 67" icon={User} />
          <Field label="OneID holati" value="Tasdiqlangan" icon={ShieldCheck} />
        </div>
        <button className="btn-primary mt-6">Saqlash</button>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Toggle icon={Lock} title="Ikki bosqichli autentifikatsiya" desc="Hisobingizni qo‘shimcha himoyalang." on />
        <Toggle icon={Bell} title="Email bildirishnomalar" desc="Yangi xavf aniqlanганda xabardor bo‘ling." on />
        <Toggle icon={CreditCard} title="Avtomatik to‘lov" desc="Professional reja har oy yangilanadi." />
      </div>
    </>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value: string; icon: typeof User }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          defaultValue={value}
          className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </div>
  );
}

function Toggle({ icon: Icon, title, desc, on }: { icon: typeof Lock; title: string; desc: string; on?: boolean }) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </span>
        <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${on ? "bg-brand-600" : "bg-ink-200"}`}>
          <span className={`h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-5" : ""}`} />
        </span>
      </div>
      <h3 className="mt-4 font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{desc}</p>
    </div>
  );
}

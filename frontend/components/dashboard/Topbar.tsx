import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-100 bg-white/80 px-5 backdrop-blur-xl sm:px-8">
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          placeholder="Tasvir, dalil yoki hisobot qidirish..."
          className="w-full rounded-xl border border-ink-200 bg-ink-50/60 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative rounded-xl p-2.5 text-ink-500 hover:bg-ink-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white py-1.5 pl-1.5 pr-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-ink-800 text-sm font-bold text-white">
            DK
          </span>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold leading-tight text-ink-900">
              Dilnoza K.
            </div>
            <div className="text-[11px] leading-tight text-ink-500">
              Professional
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

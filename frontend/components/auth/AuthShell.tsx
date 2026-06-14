import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const t = useTranslations("auth");
  const points = t.raw("points") as string[];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* form side */}
      <div className="flex flex-col px-6 py-10 sm:px-12 lg:px-16">
        <Logo />
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-center text-sm text-ink-500">{footer}</p>
          </div>
        </div>
        <Link href="/" className="text-sm text-ink-500 hover:text-ink-800">
          {t("backHome")}
        </Link>
      </div>

      {/* brand side */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div className="aurora absolute inset-0 opacity-80" />
        <div className="relative flex h-full flex-col justify-between p-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-brand-300" />
            {t("brandBadge")}
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              {t("brandTitlePre")} <br />
              <span className="text-brand-300">{t("brandTitleHighlight")}</span>{" "}
              {t("brandTitlePost")}
            </h2>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-white/80">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/40">{t("copyright")}</p>
        </div>
      </div>
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function SocialAuthButtons() {
  const t = useTranslations("auth");
  return (
    <div className="space-y-3">
      <a
        href={`${API_URL}/api/auth/oneid`}
        className="btn-secondary w-full justify-center py-3"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-600 text-[10px] font-bold text-white">
          ID
        </span>
        {t("oneid")}
      </a>
      <a
        href={`${API_URL}/api/auth/google`}
        className="btn-secondary w-full justify-center py-3"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
          />
        </svg>
        {t("google")}
      </a>
    </div>
  );
}

export function AuthDivider() {
  const t = useTranslations("auth");
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-ink-100" />
      <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
        {t("orEmail")}
      </span>
      <span className="h-px flex-1 bg-ink-100" />
    </div>
  );
}

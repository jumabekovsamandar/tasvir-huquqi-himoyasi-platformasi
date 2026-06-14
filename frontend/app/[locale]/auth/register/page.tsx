import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  AuthShell,
  AuthDivider,
  SocialAuthButtons,
} from "@/components/auth/AuthShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return { title: t("metaTitle") };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");

  return (
    <AuthShell
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("footerText")}{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600">
            {t("footerLink")}
          </Link>
        </>
      }
    >
      <SocialAuthButtons />
      <AuthDivider />

      <form className="space-y-4" action="/dashboard">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            {t("fullName")}
          </label>
          <input
            required
            placeholder={t("fullNamePlaceholder")}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            {t("email")}
          </label>
          <input
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            {t("password")}
          </label>
          <input
            type="password"
            required
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <label className="flex items-start gap-2.5 text-xs text-ink-600">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600" />
          <span>
            {t.rich("agree", {
              terms: (chunks) => (
                <a href="#" className="font-medium text-brand-600">
                  {chunks}
                </a>
              ),
              privacy: (chunks) => (
                <a href="#" className="font-medium text-brand-600">
                  {chunks}
                </a>
              ),
            })}
          </span>
        </label>
        <button type="submit" className="btn-primary w-full py-3">
          {t("submit")}
        </button>
      </form>
    </AuthShell>
  );
}

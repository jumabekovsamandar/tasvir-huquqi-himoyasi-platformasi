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
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("metaTitle") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.login");

  return (
    <AuthShell
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("footerText")}{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600">
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-700">
              {t("password")}
            </label>
            <a href="#" className="text-xs font-medium text-brand-600">
              {t("forgot")}
            </a>
          </div>
          <input
            type="password"
            required
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          {t("submit")}
        </button>
      </form>
    </AuthShell>
  );
}

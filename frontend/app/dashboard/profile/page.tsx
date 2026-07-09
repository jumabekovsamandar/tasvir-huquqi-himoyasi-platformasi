"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  Field,
  Input,
  PageSkeleton,
  Textarea,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const profileSchema = z.object({
  fullName: z.string().min(3, "To‘liq ismingizni kiriting"),
  phone: z.string().optional(),
  organization: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const lawyerSchema = z.object({
  specialization: z.string().optional(),
  experienceYears: z
    .string()
    .optional()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) <= 70), {
      message: "0 dan 70 gacha butun son kiriting",
    }),
  bio: z.string().optional(),
});
type LawyerForm = z.infer<typeof lawyerSchema>;

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.profile?.fullName ?? "",
      phone: user?.profile?.phone ?? "",
      organization: user?.profile?.organization ?? "",
    },
  });

  const lawyerForm = useForm<LawyerForm>({
    resolver: zodResolver(lawyerSchema),
    values: {
      specialization: user?.lawyerProfile?.specialization ?? "",
      experienceYears:
        user?.lawyerProfile?.experienceYears != null
          ? String(user.lawyerProfile.experienceYears)
          : "",
      bio: user?.lawyerProfile?.bio ?? "",
    },
  });

  if (!user) return <PageSkeleton />;

  const saveProfile = profileForm.handleSubmit(async (data) => {
    setError(null);
    setNotice(null);
    try {
      await api("/users/me/profile", {
        method: "PATCH",
        body: {
          fullName: data.fullName,
          phone: data.phone || undefined,
          organization: data.organization || undefined,
        },
      });
      await refresh();
      setNotice("Profil saqlandi.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Saqlashda xatolik");
    }
  });

  const saveLawyer = lawyerForm.handleSubmit(async (data) => {
    setError(null);
    setNotice(null);
    try {
      await api("/users/me/lawyer-profile", {
        method: "PATCH",
        body: {
          specialization: data.specialization || undefined,
          experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined,
          bio: data.bio || undefined,
        },
      });
      await refresh();
      setNotice("Advokat profili saqlandi.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Saqlashda xatolik");
    }
  });

  return (
    <>
      <PageHeader title="Profil" description="Shaxsiy ma’lumotlaringizni boshqaring." />
      {notice && <Alert tone="success">{notice}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid max-w-4xl items-start gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-4" noValidate>
          <h2 className="font-semibold text-ink-900">Asosiy ma’lumotlar</h2>
          <Field label="Email" htmlFor="email" hint="Email o‘zgartirilmaydi">
            <Input id="email" value={user.email} disabled />
          </Field>
          <Field
            label="To‘liq ism"
            htmlFor="fullName"
            error={profileForm.formState.errors.fullName?.message}
            required
          >
            <Input id="fullName" {...profileForm.register("fullName")} />
          </Field>
          <Field label="Telefon" htmlFor="phone">
            <Input id="phone" type="tel" placeholder="+998 90 123 45 67" {...profileForm.register("phone")} />
          </Field>
          <Field label="Tashkilot (ixtiyoriy)" htmlFor="organization">
            <Input id="organization" {...profileForm.register("organization")} />
          </Field>
          <Button type="submit" loading={profileForm.formState.isSubmitting}>
            Saqlash
          </Button>
        </form>

        {user.role === "LAWYER" && user.lawyerProfile && (
          <form onSubmit={saveLawyer} className="card space-y-4" noValidate>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-ink-900">Advokat profili</h2>
              <Badge
                className={
                  user.lawyerProfile.verified
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }
              >
                {user.lawyerProfile.verified ? "Tasdiqlangan" : "Tasdiqlanmagan"}
              </Badge>
            </div>
            {!user.lawyerProfile.verified && (
              <Alert tone="info">
                Profilingiz administrator tomonidan tekshirilmoqda. Tasdiqlangunga
                qadar sizga ishlar biriktirilmaydi.
              </Alert>
            )}
            <Field label="Litsenziya raqami" htmlFor="license" hint="O‘zgartirish uchun administratsiyaga murojaat qiling">
              <Input id="license" value={user.lawyerProfile.licenseNumber} disabled />
            </Field>
            <Field label="Mutaxassislik" htmlFor="specialization">
              <Input
                id="specialization"
                placeholder="Masalan: Intellektual mulk huquqi"
                {...lawyerForm.register("specialization")}
              />
            </Field>
            <Field label="Tajriba (yil)" htmlFor="experienceYears">
              <Input id="experienceYears" type="number" min={0} max={70} {...lawyerForm.register("experienceYears")} />
            </Field>
            <Field label="Qisqacha ma’lumot" htmlFor="bio">
              <Textarea id="bio" rows={4} {...lawyerForm.register("bio")} />
            </Field>
            <Button type="submit" loading={lawyerForm.formState.isSubmitting}>
              Saqlash
            </Button>
          </form>
        )}
      </div>
    </>
  );
}

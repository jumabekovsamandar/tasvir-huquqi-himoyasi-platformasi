"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Button,
  Field,
  Input,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function exportData() {
    setBusy("export");
    setError(null);
    try {
      const data = await api<unknown>("/users/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "imagerights-malumotlarim.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Eksportda xatolik");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    setBusy("delete");
    setError(null);
    try {
      await api("/users/me", {
        method: "DELETE",
        body: user?.provider === "EMAIL" ? { password: deletePassword } : {},
      });
      logout();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Akkaunt o‘chirilmadi");
      setBusy(null);
    }
  }

  const deleteEnabled =
    deleteConfirmText === "OCHIRISH" &&
    (user?.provider !== "EMAIL" || deletePassword.length > 0);

  return (
    <>
      <PageHeader
        title="Sozlamalar"
        description="Ma’lumotlaringiz ustidan nazorat: eksport va akkauntni o‘chirish."
      />
      {error && <Alert tone="error">{error}</Alert>}

      <div className="max-w-2xl space-y-6">
        <section className="card" aria-labelledby="export-title">
          <h2 id="export-title" className="font-semibold text-ink-900">
            Ma’lumotlarni eksport qilish
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Profil, tasvirlar reyestri, hisobotlar, hujjatlar va
            bildirishnomalaringizning to‘liq nusxasini JSON formatida yuklab
            oling.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => void exportData()}
            loading={busy === "export"}
          >
            <Download className="h-4 w-4" aria-hidden /> Ma’lumotlarimni yuklab olish
          </Button>
        </section>

        <section className="card border-red-200" aria-labelledby="delete-title">
          <h2 id="delete-title" className="font-semibold text-red-700">
            Akkauntni o‘chirish
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Akkaunt o‘chirilganda shaxsiy ma’lumotlaringiz anonimlashtiriladi va
            tizimga kirish imkoni yopiladi. Ochilgan ishlar bo‘yicha yozuvlar
            huquqiy arxiv sifatida saqlanib qolishi mumkin. Bu amalni bekor
            qilib bo‘lmaydi.
          </p>
          <div className="mt-4 space-y-4">
            {user?.provider === "EMAIL" && (
              <Field label="Parolingiz" htmlFor="deletePassword" required>
                <Input
                  id="deletePassword"
                  type="password"
                  autoComplete="current-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </Field>
            )}
            <Field
              label='Tasdiqlash uchun "OCHIRISH" deb yozing'
              htmlFor="deleteConfirm"
              required
            >
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </Field>
            <Button
              variant="danger"
              disabled={!deleteEnabled}
              loading={busy === "delete"}
              onClick={() => void deleteAccount()}
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Akkauntni butunlay o‘chirish
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

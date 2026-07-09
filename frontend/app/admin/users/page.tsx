"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/AppShell";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  Input,
  PageSkeleton,
  Select,
} from "@/components/ui/primitives";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/labels";
import type { Role } from "@/lib/types";

type AdminUser = {
  id: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt: string;
  profile?: { fullName: string; phone?: string | null } | null;
  lawyerProfile?: { licenseNumber: string; verified: boolean } | null;
};

const ROLE_LABELS: Record<Role, string> = {
  USER: "Foydalanuvchi",
  LAWYER: "Advokat",
  ADMIN: "Administrator",
};

export default function AdminUsersPage() {
  const [data, setData] = useState<{ items: AdminUser[]; total: number; page: number; pageSize: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (role) params.set("role", role);
    if (query) params.set("search", query);
    api<typeof data>(`/admin/users?${params}`)
      .then((d) => setData(d))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Yuklashda xatolik"));
  }, [page, role, query]);

  useEffect(load, [load]);

  async function toggleActive() {
    if (!target) return;
    setBusy(true);
    try {
      await api(`/admin/users/${target.id}/active`, {
        method: "PATCH",
        body: { isActive: !target.isActive },
      });
      setTarget(null);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Amal bajarilmadi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Foydalanuvchilar" description="Akkauntlarni ko‘rish va boshqarish." />

      <div className="flex flex-wrap items-end gap-3">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search);
          }}
        >
          <div>
            <label htmlFor="search" className="label">
              Qidiruv
            </label>
            <Input
              id="search"
              placeholder="Email yoki ism"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
          <Button type="submit" variant="secondary" aria-label="Qidirish">
            <Search className="h-4 w-4" aria-hidden />
          </Button>
        </form>
        <div>
          <label htmlFor="role" className="label">
            Rol
          </label>
          <Select
            id="role"
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
            className="w-44"
          >
            <option value="">Barchasi</option>
            <option value="USER">Foydalanuvchi</option>
            <option value="LAWYER">Advokat</option>
            <option value="ADMIN">Administrator</option>
          </Select>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {!error && !data && <PageSkeleton />}
      {data && (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3.5 font-semibold">Foydalanuvchi</th>
                  <th className="px-5 py-3.5 font-semibold">Rol</th>
                  <th className="px-5 py-3.5 font-semibold">Ro‘yxatdan o‘tgan</th>
                  <th className="px-5 py-3.5 font-semibold">Holat</th>
                  <th className="px-5 py-3.5 font-semibold">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {data.items.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-900">{u.profile?.fullName ?? "—"}</p>
                      <p className="text-xs text-ink-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        className={
                          u.role === "ADMIN"
                            ? "bg-red-50 text-red-700"
                            : u.role === "LAWYER"
                              ? "bg-gold-50 text-gold-700"
                              : "bg-ink-100 text-ink-600"
                        }
                      >
                        {ROLE_LABELS[u.role]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {u.deletedAt ? (
                        <Badge className="bg-ink-100 text-ink-500">O‘chirilgan</Badge>
                      ) : u.isActive ? (
                        <Badge className="bg-green-50 text-green-700">Faol</Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-700">Bloklangan</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {!u.deletedAt && u.role !== "ADMIN" && (
                        <Button
                          variant={u.isActive ? "danger" : "secondary"}
                          className="px-3 py-1.5 text-xs"
                          onClick={() => setTarget(u)}
                        >
                          {u.isActive ? "Bloklash" : "Faollashtirish"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between text-sm text-ink-500">
            <span>Jami: {data.total}</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Oldingi
              </Button>
              <Button
                variant="secondary"
                disabled={page * data.pageSize >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Keyingi
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!target}
        title={target?.isActive ? "Foydalanuvchini bloklash" : "Foydalanuvchini faollashtirish"}
        description={
          target?.isActive
            ? `${target.email} akkaunti bloklanadi — u tizimga kira olmaydi va barcha sessiyalari bekor qilinadi.`
            : `${target?.email} akkaunti qayta faollashtiriladi.`
        }
        confirmLabel={target?.isActive ? "Bloklash" : "Faollashtirish"}
        danger={target?.isActive}
        loading={busy}
        onConfirm={() => void toggleActive()}
        onClose={() => setTarget(null)}
      />
    </>
  );
}

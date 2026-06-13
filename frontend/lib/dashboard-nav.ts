import {
  LayoutDashboard,
  ShieldCheck,
  FileCheck2,
  ScanFace,
  Globe2,
  FolderLock,
  Gavel,
  Eraser,
  Store,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavGroup = { title: string; items: NavItem[] };

export const DASHBOARD_NAV: NavGroup[] = [
  {
    title: "Umumiy",
    items: [
      { label: "Boshqaruv paneli", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Himoya",
    items: [
      { label: "Tasvir reyestri", href: "/dashboard/registry", icon: ShieldCheck },
      { label: "Rozilik boshqaruvi", href: "/dashboard/consent", icon: FileCheck2 },
      { label: "Deepfake aniqlash", href: "/dashboard/deepfake", icon: ScanFace },
      {
        label: "Internet monitoring",
        href: "/dashboard/monitoring",
        icon: Globe2,
        badge: "3",
      },
    ],
  },
  {
    title: "Huquqiy",
    items: [
      { label: "Dalillar ombori", href: "/dashboard/evidence", icon: FolderLock },
      { label: "AI yuridik yordamchi", href: "/dashboard/legal-assistant", icon: Gavel },
      {
        label: "Unutilish huquqi",
        href: "/dashboard/right-to-be-forgotten",
        icon: Eraser,
      },
    ],
  },
  {
    title: "Tijorat",
    items: [
      { label: "Litsenziya bozori", href: "/dashboard/marketplace", icon: Store },
    ],
  },
];

export const DASHBOARD_FOOTER_NAV: NavItem[] = [
  { label: "Sozlamalar", href: "/dashboard/settings", icon: Settings },
];

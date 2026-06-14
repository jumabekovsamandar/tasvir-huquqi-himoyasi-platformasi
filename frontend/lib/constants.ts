import {
  ShieldCheck,
  FileCheck2,
  ScanFace,
  Globe2,
  FolderLock,
  Gavel,
  Store,
  type LucideIcon,
} from "lucide-react";

/**
 * Structural metadata for the landing sections.
 *
 * All user-facing text lives in `messages/{locale}.json` and is read in the
 * components via next-intl. The arrays below only hold non-translatable data
 * (icons, links, flags) and must stay in the same order as their translated
 * counterparts so the two can be merged by index.
 */

export type FeatureMeta = {
  icon: LucideIcon;
  href: string;
};

export const FEATURE_META: FeatureMeta[] = [
  { icon: ShieldCheck, href: "/dashboard/registry" },
  { icon: FileCheck2, href: "/dashboard/consent" },
  { icon: ScanFace, href: "/dashboard/deepfake" },
  { icon: Globe2, href: "/dashboard/monitoring" },
  { icon: FolderLock, href: "/dashboard/evidence" },
  { icon: Gavel, href: "/dashboard/legal-assistant" },
  { icon: Store, href: "/dashboard/marketplace" },
];

export type PlanMeta = {
  name: string;
  highlighted?: boolean;
};

export const PLAN_META: PlanMeta[] = [
  { name: "Free" },
  { name: "Professional", highlighted: true },
  { name: "Business" },
  { name: "Enterprise" },
];

export type TestimonialMeta = {
  name: string;
  initials: string;
};

export const TESTIMONIAL_META: TestimonialMeta[] = [
  { name: "Dilnoza Karimova", initials: "DK" },
  { name: "Jasur Aliyev", initials: "JA" },
  { name: "Madina Yusupova", initials: "MY" },
  { name: "Sardor Rashidov", initials: "SR" },
];

import type {
  AIKind,
  DocumentType,
  Platform,
  ViolationStatus,
} from "./types";

export const STATUS_LABELS: Record<ViolationStatus, string> = {
  DRAFT: "Qoralama",
  SUBMITTED: "Yuborildi",
  UNDER_REVIEW: "Ko‘rib chiqilmoqda",
  ACTION_REQUIRED: "Ma’lumot talab qilinadi",
  NOTICE_PREPARED: "Talabnoma tayyorlandi",
  LAWYER_REVIEW: "Advokat ko‘rigida",
  RESOLVED: "Hal qilindi",
  CLOSED: "Yopildi",
};

export const STATUS_TONES: Record<ViolationStatus, string> = {
  DRAFT: "bg-ink-100 text-ink-600",
  SUBMITTED: "bg-brand-50 text-brand-700",
  UNDER_REVIEW: "bg-brand-50 text-brand-700",
  ACTION_REQUIRED: "bg-amber-50 text-amber-700",
  NOTICE_PREPARED: "bg-violet-50 text-violet-700",
  LAWYER_REVIEW: "bg-gold-50 text-gold-700",
  RESOLVED: "bg-green-50 text-green-700",
  CLOSED: "bg-ink-100 text-ink-500",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TELEGRAM: "Telegram",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  WEBSITE: "Veb-sayt",
  PRESS: "OAV / matbuot",
  ADVERTISING: "Reklama",
  OTHER: "Boshqa",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PLATFORM_COMPLAINT: "Platformaga shikoyat",
  TAKEDOWN_REQUEST: "Olib tashlash talabi",
  FORMAL_NOTICE: "Rasmiy ogohlantirish xati",
  EVIDENCE_SUMMARY: "Dalillar xulosasi",
  LAWYER_BRIEF: "Advokat uchun ish xulosasi",
};

export const AI_KIND_LABELS: Record<AIKind, string> = {
  CASE_SUMMARY: "Ish xulosasi",
  RISK_ASSESSMENT: "Dastlabki baholash",
  MISSING_INFO: "Yetishmayotgan ma’lumotlar",
  LAWYER_QUESTIONS: "Advokat uchun savollar",
  DOCUMENT_DRAFT: "Talabnoma qoralamasi",
};

export const ACTIVITY_LABELS: Record<string, string> = {
  IMAGE_REGISTERED: "Tasvir reyestrga qo‘shildi",
  VIOLATION_SUBMITTED: "Huquqbuzarlik hisoboti yuborildi",
  DOCUMENT_GENERATED: "Hujjat qoralamasi yaratildi",
  DOCUMENT_FINALIZED: "Hujjat tasdiqlandi",
  EVIDENCE_UPLOADED: "Dalil yuklandi",
  AI_ANALYSIS_CREATED: "AI tahlili tayyorlandi",
};

// Brauzer ICU bazasida o'zbekcha oy nomlari to'liq emas — o'zimiz beramiz
const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} · ${hh}:${mm}`;
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

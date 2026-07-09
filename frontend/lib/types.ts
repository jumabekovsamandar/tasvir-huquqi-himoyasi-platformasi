// API bilan umumiy tiplar

export type Role = "USER" | "LAWYER" | "ADMIN";

export type ViolationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACTION_REQUIRED"
  | "NOTICE_PREPARED"
  | "LAWYER_REVIEW"
  | "RESOLVED"
  | "CLOSED";

export type Platform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TELEGRAM"
  | "YOUTUBE"
  | "TIKTOK"
  | "WEBSITE"
  | "PRESS"
  | "ADVERTISING"
  | "OTHER";

export type DocumentType =
  | "PLATFORM_COMPLAINT"
  | "TAKEDOWN_REQUEST"
  | "FORMAL_NOTICE"
  | "EVIDENCE_SUMMARY"
  | "LAWYER_BRIEF";

export type AIKind =
  | "CASE_SUMMARY"
  | "RISK_ASSESSMENT"
  | "MISSING_INFO"
  | "LAWYER_QUESTIONS"
  | "DOCUMENT_DRAFT";

export interface Me {
  id: string;
  email: string;
  role: Role;
  provider: "EMAIL" | "GOOGLE" | "ONEID";
  emailVerified: boolean;
  createdAt: string;
  profile: {
    fullName: string;
    phone?: string | null;
    organization?: string | null;
    avatarUrl?: string | null;
    locale: string;
  } | null;
  lawyerProfile?: {
    licenseNumber: string;
    specialization?: string | null;
    experienceYears?: number | null;
    bio?: string | null;
    verified: boolean;
  } | null;
}

export interface ProtectedImage {
  id: string;
  registryCode: string;
  title: string;
  description?: string | null;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  tags: string[];
  privacyLevel: "PRIVATE" | "RESTRICTED";
  commercialUseAllowed: boolean;
  state: "ACTIVE" | "ARCHIVED";
  capturedAt?: string | null;
  firstPublishedAt?: string | null;
  publicationSource?: string | null;
  consentRestrictions?: string | null;
  ownershipNote?: string | null;
  createdAt: string;
  updatedAt: string;
  reports?: { id: string; status: ViolationStatus; createdAt: string }[];
}

export interface Evidence {
  id: string;
  reportId?: string;
  kind: "FILE" | "URL";
  type: string;
  description?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  sha256?: string | null;
  url?: string | null;
  createdAt: string;
  report?: {
    id: string;
    description: string;
    status: ViolationStatus;
    case?: { id: string; caseNumber: string } | null;
  };
}

export interface ViolationReport {
  id: string;
  status: ViolationStatus;
  platform: Platform;
  platformOther?: string | null;
  infringingUrl?: string | null;
  publishedAt?: string | null;
  discoveredAt: string;
  description: string;
  hadConsent: boolean;
  consentDetails?: string | null;
  commercialUse: boolean;
  damageDescription?: string | null;
  createdAt: string;
  updatedAt: string;
  protectedImage?: { id: string; title: string; registryCode: string } | null;
  case?: { id: string; caseNumber: string; assignedLawyerId?: string | null } | null;
  evidence?: Evidence[];
  _count?: { evidence: number };
}

export interface StatusHistoryItem {
  id: string;
  fromStatus?: ViolationStatus | null;
  toStatus: ViolationStatus;
  note?: string | null;
  createdAt: string;
  changedBy?: { profile?: { fullName: string } | null; role: Role } | null;
}

export interface CaseListItem {
  id: string;
  caseNumber: string;
  createdAt: string;
  updatedAt: string;
  report: {
    id: string;
    status: ViolationStatus;
    platform: Platform;
    infringingUrl?: string | null;
    description: string;
    reporterId: string;
    reporter?: { profile?: { fullName: string } | null };
    protectedImage?: { title: string; registryCode: string } | null;
    _count: { evidence: number };
  };
  assignedLawyer?: { id: string; profile?: { fullName: string } | null } | null;
  _count: { documents: number; messages: number };
}

export interface CaseDetail {
  id: string;
  caseNumber: string;
  createdAt: string;
  statusLabel: string;
  assignedLawyerId?: string | null;
  report: ViolationReport & {
    reporterId: string;
    reporter: {
      id: string;
      email: string;
      profile?: { fullName: string; phone?: string | null } | null;
    };
  };
  assignedLawyer?: {
    id: string;
    profile?: { fullName: string } | null;
    lawyerProfile?: { specialization?: string | null; verified: boolean } | null;
  } | null;
  statusHistory: StatusHistoryItem[];
  documents: {
    id: string;
    type: DocumentType;
    title: string;
    status: "DRAFT" | "FINALIZED";
    createdAt: string;
  }[];
  aiAnalyses: {
    id: string;
    kind: AIKind;
    output: string;
    model: string;
    createdAt: string;
  }[];
}

export interface CaseMessage {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; role: Role; profile?: { fullName: string } | null };
}

export interface CaseNote {
  id: string;
  body: string;
  createdAt: string;
  author: { role: Role; profile?: { fullName: string } | null };
}

export interface LegalDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  senderName: string;
  recipientName?: string | null;
  recipientContact?: string | null;
  status: "DRAFT" | "FINALIZED";
  finalizedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  case?: { id: string; caseNumber: string };
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface UserOverview {
  role: "USER";
  images: number;
  drafts: number;
  openReports: number;
  activeCases: number;
  resolvedCases: number;
  recentActivity: {
    action: string;
    entityType: string;
    entityId?: string | null;
    createdAt: string;
  }[];
}

export interface LawyerOverview {
  role: "LAWYER";
  assigned: number;
  needReview: number;
  resolved: number;
  unreadMessages: number;
}

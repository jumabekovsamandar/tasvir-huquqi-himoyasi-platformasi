import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, UserRole } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../core/audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';
import { GenerateDocumentDto, UpdateDocumentDto } from './dto';
import {
  DOCUMENT_TITLES,
  LEGAL_DISCLAIMER,
  renderTemplate,
  type TemplateContext,
} from './templates';

const PLATFORM_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TELEGRAM: 'Telegram',
  YOUTUBE: 'YouTube',
  TIKTOK: 'TikTok',
  WEBSITE: 'Veb-sayt',
  PRESS: 'OAV / matbuot',
  ADVERTISING: 'Reklama',
  OTHER: 'Boshqa',
};

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  /** Ish ma'lumotlari asosida hujjat qoralamasini yaratadi. */
  async generate(user: AuthUser, dto: GenerateDocumentDto, meta: RequestMeta) {
    const found = await this.requireCaseAccess(user, dto.caseId);
    const report = found.report;

    const sender =
      report.reporter.profile?.fullName ?? report.reporter.email;
    const ctx: TemplateContext = {
      caseNumber: found.caseNumber,
      senderName: sender,
      senderEmail: report.reporter.email,
      recipientName: dto.recipientName,
      platform:
        report.platform === 'OTHER' && report.platformOther
          ? report.platformOther
          : (PLATFORM_LABELS[report.platform] ?? report.platform),
      infringingUrl: report.infringingUrl ?? undefined,
      registryCode: report.protectedImage?.registryCode,
      imageTitle: report.protectedImage?.title,
      discoveredAt: report.discoveredAt.toLocaleDateString('uz-UZ'),
      publishedAt: report.publishedAt?.toLocaleDateString('uz-UZ'),
      description: report.description,
      hadConsent: report.hadConsent,
      consentDetails: report.consentDetails ?? undefined,
      commercialUse: report.commercialUse,
      damageDescription: report.damageDescription ?? undefined,
      evidenceLines: report.evidence.map((e) =>
        e.kind === 'URL'
          ? `URL dalil: ${e.url} (qo‘shilgan: ${e.createdAt.toLocaleDateString('uz-UZ')})`
          : `Fayl: ${e.originalFilename ?? e.id} — SHA-256: ${e.sha256?.slice(0, 16)}… (yuklangan: ${e.createdAt.toLocaleDateString('uz-UZ')})`,
      ),
      today: new Date().toLocaleDateString('uz-UZ'),
    };

    const type = dto.type as DocumentType;
    const document = await this.prisma.document.create({
      data: {
        caseId: found.id,
        createdById: user.id,
        type,
        title: `${DOCUMENT_TITLES[type]} — ${found.caseNumber}`,
        content: renderTemplate(type, ctx),
        senderName: sender,
        recipientName: dto.recipientName,
        recipientContact: dto.recipientContact,
      },
    });

    await this.audit.log({
      userId: user.id,
      action: 'DOCUMENT_GENERATED',
      entityType: 'Document',
      entityId: document.id,
      metadata: { type, caseId: found.id },
      ...meta,
    });
    return document;
  }

  async list(user: AuthUser) {
    const where =
      user.role === UserRole.ADMIN
        ? {}
        : user.role === UserRole.LAWYER
          ? {
              case: {
                OR: [
                  { assignedLawyerId: user.id },
                  { report: { reporterId: user.id } },
                ],
              },
            }
          : { case: { report: { reporterId: user.id } } };
    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        recipientName: true,
        createdAt: true,
        updatedAt: true,
        case: { select: { id: true, caseNumber: true } },
      },
    });
  }

  async getOne(user: AuthUser, id: string) {
    const document = await this.requireDocumentAccess(user, id);
    return document;
  }

  async update(user: AuthUser, id: string, dto: UpdateDocumentDto) {
    const document = await this.requireDocumentAccess(user, id);
    if (document.status === 'FINALIZED') {
      throw new BadRequestException(
        'Tasdiqlangan hujjatni tahrirlash mumkin emas',
      );
    }
    return this.prisma.document.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        recipientName: dto.recipientName,
        recipientContact: dto.recipientContact,
      },
    });
  }

  /** Foydalanuvchi hujjatni ko‘rib chiqib, yakuniy deb tasdiqlaydi. */
  async finalize(user: AuthUser, id: string, meta: RequestMeta) {
    const document = await this.requireDocumentAccess(user, id);
    if (document.status === 'FINALIZED') {
      throw new BadRequestException('Hujjat allaqachon tasdiqlangan');
    }
    const updated = await this.prisma.document.update({
      where: { id },
      data: { status: 'FINALIZED', finalizedAt: new Date() },
    });
    await this.audit.log({
      userId: user.id,
      action: 'DOCUMENT_FINALIZED',
      entityType: 'Document',
      entityId: id,
      ...meta,
    });
    await this.notifications.notify(
      user.id,
      'DOCUMENT_READY',
      'Hujjat tasdiqlandi',
      `"${updated.title}" hujjati yuklab olishga tayyor.`,
      `/dashboard/documents/${id}`,
    );
    return updated;
  }

  async remove(user: AuthUser, id: string, meta: RequestMeta) {
    const document = await this.requireDocumentAccess(user, id);
    if (document.status === 'FINALIZED' && user.role !== UserRole.ADMIN) {
      throw new BadRequestException(
        'Tasdiqlangan hujjatni faqat administrator o‘chira oladi',
      );
    }
    await this.prisma.document.delete({ where: { id } });
    await this.audit.log({
      userId: user.id,
      action: 'DOCUMENT_DELETED',
      entityType: 'Document',
      entityId: id,
      ...meta,
    });
    return { message: 'Hujjat o‘chirildi' };
  }

  /** PDF eksport (pdfkit, server tomonida). */
  async exportPdf(user: AuthUser, id: string): Promise<{ title: string; buffer: Buffer }> {
    const document = await this.requireDocumentAccess(user, id);
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const pdf = new PDFDocument({ size: 'A4', margin: 56 });
      const chunks: Buffer[] = [];
      pdf.on('data', (c: Buffer) => chunks.push(c));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', reject);

      pdf.font('Helvetica-Bold').fontSize(14).text(document.title, { align: 'center' });
      pdf.moveDown();
      pdf.font('Helvetica').fontSize(10.5).text(document.content, {
        align: 'left',
        lineGap: 3,
      });
      pdf.moveDown(2);
      pdf
        .fontSize(8)
        .fillColor('#555555')
        .text(
          `ImageRights.uz | Yaratilgan: ${document.createdAt.toLocaleString('uz-UZ')} | Holat: ${document.status === 'FINALIZED' ? 'Tasdiqlangan' : 'Qoralama'}`,
        );
      pdf.end();
    });
    await this.audit.log({
      userId: user.id,
      action: 'DOCUMENT_EXPORTED',
      entityType: 'Document',
      entityId: id,
    });
    return { title: document.title, buffer };
  }

  private async requireCaseAccess(user: AuthUser, caseId: string) {
    const found = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        report: {
          include: {
            reporter: {
              select: { id: true, email: true, profile: { select: { fullName: true } } },
            },
            protectedImage: { select: { title: true, registryCode: true } },
            evidence: {
              select: {
                id: true,
                kind: true,
                url: true,
                originalFilename: true,
                sha256: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
    if (!found) throw new NotFoundException('Ish topilmadi');
    const ok =
      found.report.reporterId === user.id ||
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER && found.assignedLawyerId === user.id);
    if (!ok) throw new NotFoundException('Ish topilmadi');
    return found;
  }

  private async requireDocumentAccess(user: AuthUser, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            assignedLawyerId: true,
            report: { select: { reporterId: true } },
          },
        },
      },
    });
    if (!document) throw new NotFoundException('Hujjat topilmadi');
    const ok =
      document.case.report.reporterId === user.id ||
      user.role === UserRole.ADMIN ||
      (user.role === UserRole.LAWYER &&
        document.case.assignedLawyerId === user.id);
    if (!ok) throw new NotFoundException('Hujjat topilmadi');
    return document;
  }
}

export { LEGAL_DISCLAIMER };

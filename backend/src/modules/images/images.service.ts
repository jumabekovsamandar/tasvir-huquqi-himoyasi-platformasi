import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ImageState, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import { AuditService } from '../../core/audit/audit.service';
import { generateRegistryCode } from '../../common/codes';
import type { AuthUser } from '../../common/current-user.decorator';
import type { RequestMeta } from '../../common/request-meta';
import { RegisterImageDto, UpdateImageDto } from './dto';

const LIST_SELECT = {
  id: true,
  registryCode: true,
  title: true,
  description: true,
  mimeType: true,
  sizeBytes: true,
  sha256: true,
  tags: true,
  privacyLevel: true,
  commercialUseAllowed: true,
  state: true,
  capturedAt: true,
  firstPublishedAt: true,
  publicationSource: true,
  consentRestrictions: true,
  ownershipNote: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProtectedImageSelect;

@Injectable()
export class ImagesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private audit: AuditService,
  ) {}

  async register(
    user: AuthUser,
    file: Express.Multer.File,
    dto: RegisterImageDto,
    meta: RequestMeta,
  ) {
    const stored = await this.storage.store(file, 'image', `images/${user.id}`);
    const image = await this.prisma.protectedImage.create({
      data: {
        ownerId: user.id,
        registryCode: generateRegistryCode(),
        title: dto.title.trim(),
        description: dto.description,
        storageKey: stored.storageKey,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
        sha256: stored.sha256,
        ownershipNote: dto.ownershipNote,
        capturedAt: dto.capturedAt ? new Date(dto.capturedAt) : undefined,
        firstPublishedAt: dto.firstPublishedAt
          ? new Date(dto.firstPublishedAt)
          : undefined,
        publicationSource: dto.publicationSource,
        consentRestrictions: dto.consentRestrictions,
        commercialUseAllowed: dto.commercialUseAllowed ?? false,
        tags: dto.tags ?? [],
        privacyLevel: dto.privacyLevel ?? 'PRIVATE',
      },
      select: LIST_SELECT,
    });

    await this.audit.log({
      userId: user.id,
      action: 'IMAGE_REGISTERED',
      entityType: 'ProtectedImage',
      entityId: image.id,
      metadata: { registryCode: image.registryCode },
      ...meta,
    });
    return image;
  }

  async list(user: AuthUser, state?: string) {
    const stateFilter =
      state === 'ARCHIVED' ? ImageState.ARCHIVED : ImageState.ACTIVE;
    return this.prisma.protectedImage.findMany({
      where: { ownerId: user.id, state: state === 'ALL' ? undefined : stateFilter },
      orderBy: { createdAt: 'desc' },
      select: LIST_SELECT,
    });
  }

  async getOne(user: AuthUser, id: string) {
    const image = await this.findAccessible(user, id);
    return this.prisma.protectedImage.findUnique({
      where: { id: image.id },
      select: { ...LIST_SELECT, reports: { select: { id: true, status: true, createdAt: true } } },
    });
  }

  async update(user: AuthUser, id: string, dto: UpdateImageDto) {
    await this.requireOwnership(user, id);
    return this.prisma.protectedImage.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        description: dto.description,
        ownershipNote: dto.ownershipNote,
        ...(dto.capturedAt !== undefined
          ? { capturedAt: new Date(dto.capturedAt) }
          : {}),
        ...(dto.firstPublishedAt !== undefined
          ? { firstPublishedAt: new Date(dto.firstPublishedAt) }
          : {}),
        publicationSource: dto.publicationSource,
        consentRestrictions: dto.consentRestrictions,
        ...(dto.commercialUseAllowed !== undefined
          ? { commercialUseAllowed: dto.commercialUseAllowed }
          : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.privacyLevel !== undefined
          ? { privacyLevel: dto.privacyLevel }
          : {}),
      },
      select: LIST_SELECT,
    });
  }

  async setState(user: AuthUser, id: string, state: ImageState, meta: RequestMeta) {
    await this.requireOwnership(user, id);
    const image = await this.prisma.protectedImage.update({
      where: { id },
      data: { state },
      select: LIST_SELECT,
    });
    await this.audit.log({
      userId: user.id,
      action: state === 'ARCHIVED' ? 'IMAGE_ARCHIVED' : 'IMAGE_RESTORED',
      entityType: 'ProtectedImage',
      entityId: id,
      ...meta,
    });
    return image;
  }

  async getFile(user: AuthUser, id: string) {
    const image = await this.findAccessible(user, id);
    const download = await this.storage.getDownload(
      image.storageKey,
      image.mimeType,
    );
    return { image, download };
  }

  /** Ro‘yxatga olish guvohnomasi (matnli xulosalar). */
  async registrationSummary(user: AuthUser, id: string) {
    const image = await this.findAccessible(user, id);
    const full = await this.prisma.protectedImage.findUniqueOrThrow({
      where: { id: image.id },
      include: { owner: { include: { profile: true } } },
    });
    return {
      documentType: 'ImageRights.uz ichki reyestr xulosasi',
      disclaimer:
        'Ushbu hujjat ImageRights.uz platformasining ichki reyestr yozuvi bo‘lib, ' +
        'davlat intellektual mulk ro‘yxatidan o‘tkazish hujjati hisoblanmaydi. ' +
        'U tasvir egaligini dalillashda yordamchi material sifatida xizmat qiladi.',
      registryCode: full.registryCode,
      title: full.title,
      owner: full.owner.profile?.fullName ?? full.owner.email,
      registeredAt: full.createdAt.toISOString(),
      sha256: full.sha256,
      mimeType: full.mimeType,
      sizeBytes: full.sizeBytes,
      capturedAt: full.capturedAt?.toISOString() ?? null,
      firstPublishedAt: full.firstPublishedAt?.toISOString() ?? null,
      publicationSource: full.publicationSource,
      consentRestrictions: full.consentRestrictions,
      commercialUseAllowed: full.commercialUseAllowed,
    };
  }

  private async requireOwnership(user: AuthUser, id: string) {
    const image = await this.prisma.protectedImage.findUnique({
      where: { id },
      select: { id: true, ownerId: true, storageKey: true, mimeType: true },
    });
    if (!image) throw new NotFoundException('Tasvir topilmadi');
    if (image.ownerId !== user.id) {
      // IDOR himoyasi: begona resurs uchun 404 qaytariladi
      throw new NotFoundException('Tasvir topilmadi');
    }
    return image;
  }

  /**
   * Kirish huquqi: egasi, admin, yoki RESTRICTED darajada — ushbu tasvir
   * bo‘yicha ishga biriktirilgan advokat.
   */
  private async findAccessible(user: AuthUser, id: string) {
    const image = await this.prisma.protectedImage.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        storageKey: true,
        mimeType: true,
        privacyLevel: true,
      },
    });
    if (!image) throw new NotFoundException('Tasvir topilmadi');
    if (image.ownerId === user.id || user.role === UserRole.ADMIN) return image;

    if (user.role === UserRole.LAWYER && image.privacyLevel === 'RESTRICTED') {
      const assigned = await this.prisma.case.findFirst({
        where: {
          assignedLawyerId: user.id,
          report: { protectedImageId: id },
        },
        select: { id: true },
      });
      if (assigned) return image;
    }
    throw new NotFoundException('Tasvir topilmadi');
  }
}

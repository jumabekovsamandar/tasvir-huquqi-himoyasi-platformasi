import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash, randomBytes } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join, normalize } from 'path';
import type { Readable } from 'stream';

export type StoredFile = {
  storageKey: string;
  sha256: string;
  sizeBytes: number;
  mimeType: string;
};

export type FileCategory = 'image' | 'evidence';

/** Ruxsat etilgan MIME turlari va magic-byte imzolari. */
const SIGNATURES: Record<string, (buf: Buffer) => boolean> = {
  'image/jpeg': (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) =>
    b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  'application/pdf': (b) => b.length > 4 && b.subarray(0, 4).toString('ascii') === '%PDF',
};

const ALLOWED: Record<FileCategory, { mimes: string[]; maxBytes: number }> = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
  },
  evidence: {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxBytes: 20 * 1024 * 1024,
  },
};

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Fayl saqlash xizmati: LOCAL disk (development) yoki S3-mos obyekt
 * ombori (production). Driver STORAGE_DRIVER env o‘zgaruvchisi bilan
 * tanlanadi: "local" | "s3".
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver = process.env.STORAGE_DRIVER === 's3' ? 's3' : 'local';
  private readonly localDir = normalize(process.env.LOCAL_STORAGE_DIR ?? './storage');
  private s3: S3Client | null = null;
  private bucket = '';

  constructor() {
    if (this.driver === 's3') {
      this.bucket = process.env.S3_BUCKET ?? '';
      if (!this.bucket) {
        throw new Error('STORAGE_DRIVER=s3 uchun S3_BUCKET majburiy');
      }
      this.s3 = new S3Client({
        region: process.env.S3_REGION ?? 'auto',
        endpoint: process.env.S3_ENDPOINT || undefined,
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: process.env.S3_ACCESS_KEY_ID
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
            }
          : undefined,
      });
    }
  }

  /**
   * Yuklangan faylni tekshiradi: MIME roʻyxati, hajm chegarasi va
   * magic-byte imzosi. Fayl nomiga ishonilmaydi — yangi xavfsiz nom
   * serverda yaratiladi (path traversal oldini oladi).
   */
  validate(file: Express.Multer.File, category: FileCategory): string {
    const rules = ALLOWED[category];
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fayl yuborilmadi');
    }
    if (file.size > rules.maxBytes) {
      throw new BadRequestException(
        `Fayl hajmi ${Math.round(rules.maxBytes / 1024 / 1024)} MB dan oshmasligi kerak`,
      );
    }
    const declared = file.mimetype?.toLowerCase();
    if (!rules.mimes.includes(declared)) {
      throw new BadRequestException(
        `Ruxsat etilgan fayl turlari: ${rules.mimes.join(', ')}`,
      );
    }
    const checker = SIGNATURES[declared];
    if (!checker || !checker(file.buffer)) {
      throw new BadRequestException(
        'Fayl mazmuni e’lon qilingan turga mos kelmadi',
      );
    }
    return declared;
  }

  /** Faylni tekshirib saqlaydi va xavfsiz kalit + SHA-256 qaytaradi. */
  async store(
    file: Express.Multer.File,
    category: FileCategory,
    prefix: string,
  ): Promise<StoredFile> {
    const mimeType = this.validate(file, category);
    const sha256 = createHash('sha256').update(file.buffer).digest('hex');
    const safeName = `${Date.now()}-${randomBytes(8).toString('hex')}.${EXT[mimeType]}`;
    // prefix faqat ichki qiymatlardan keladi (masalan "images/<userId>")
    const storageKey = `${prefix}/${safeName}`;

    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
          Body: file.buffer,
          ContentType: mimeType,
        }),
      );
    } else {
      const target = this.localPath(storageKey);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, file.buffer);
    }

    return { storageKey, sha256, sizeBytes: file.size, mimeType };
  }

  /**
   * Faylni o‘qish: S3 da vaqtinchalik imzolangan URL, lokal diskda
   * stream qaytariladi. Avtorizatsiya tekshiruvi chaqiruvchi modulda
   * bajarilgan bo‘lishi shart.
   */
  async getDownload(
    storageKey: string,
    mimeType: string,
  ): Promise<{ redirectUrl?: string; stream?: Readable }> {
    if (this.s3) {
      const url = await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
          ResponseContentType: mimeType,
        }),
        { expiresIn: 300 },
      );
      return { redirectUrl: url };
    }
    try {
      return { stream: createReadStream(this.localPath(storageKey)) };
    } catch (err) {
      this.logger.error(`Faylni o‘qib bo‘lmadi: ${storageKey}`, err as Error);
      throw new InternalServerErrorException('Faylni o‘qishda xatolik');
    }
  }

  async delete(storageKey: string): Promise<void> {
    try {
      if (this.s3) {
        await this.s3.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
        );
      } else {
        await unlink(this.localPath(storageKey));
      }
    } catch (err) {
      // O‘chirishdagi xato asosiy amalni to‘xtatmaydi, lekin yashirilmaydi
      this.logger.error(`Fayl o‘chirilmadi: ${storageKey}`, err as Error);
    }
  }

  private localPath(storageKey: string): string {
    const resolved = normalize(join(this.localDir, storageKey));
    if (!resolved.startsWith(this.localDir)) {
      throw new BadRequestException('Noto‘g‘ri fayl kaliti');
    }
    return resolved;
  }
}

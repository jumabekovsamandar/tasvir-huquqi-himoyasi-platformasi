import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IsInt, IsOptional, IsString, Max } from 'class-validator';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../../common/current-user.decorator';

class UploadUrlDto {
  @IsString() fileName: string;
  @IsString() contentType: string;
  @IsOptional() @IsInt() @Max(209_715_200) sizeBytes?: number; // ≤200 MB
}

/**
 * Xavfsiz fayl saqlash servisi (AWS S3).
 * Fayllar to'g'ridan-to'g'ri brauzerdan presigned URL orqali yuklanadi —
 * maxfiy kalitlar hech qachon mijozga oshkor qilinmaydi.
 */
@Injectable()
export class StorageService {
  private readonly bucket = process.env.AWS_S3_BUCKET ?? '';
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION ?? 'eu-central-1',
  });

  private ensureConfigured() {
    if (!this.bucket || !process.env.AWS_ACCESS_KEY_ID) {
      throw new BadRequestException(
        'S3 sozlanmagan: AWS_S3_BUCKET va AWS_ACCESS_KEY_ID ni .env da to‘ldiring',
      );
    }
  }

  /** Yuklash uchun vaqtinchalik presigned PUT URL yaratish. */
  async createUploadUrl(userId: string, dto: UploadUrlDto) {
    this.ensureConfigured();
    const safeName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `uploads/${userId}/${randomUUID()}-${safeName}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
      ServerSideEncryption: 'AES256', // at-rest shifrlash
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
    return { uploadUrl, key, expiresIn: 900 };
  }

  /** Saqlangan faylni ko‘rish uchun vaqtinchalik presigned GET URL. */
  async createDownloadUrl(key: string) {
    this.ensureConfigured();
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    return { url, expiresIn: 300 };
  }
}

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload-url')
  uploadUrl(@CurrentUser() user: AuthUser, @Body() dto: UploadUrlDto) {
    return this.storage.createUploadUrl(user.id, dto);
  }

  @Get('download-url')
  downloadUrl(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key parametri talab qilinadi');
    return this.storage.createDownloadUrl(key);
  }
}

@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';

/**
 * Email yuborish xizmati.
 *
 * SMTP sozlanmagan bo‘lsa (SMTP_HOST yo‘q), xatlar yuborilmaydi —
 * ular faqat server logiga yoziladi. Bu holat frontendga hech qachon
 * token yoki havolani oshkor qilmaydi.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    if (host) {
      this.transporter = createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
    }
  }

  get configured(): boolean {
    return this.transporter !== null;
  }

  private async send(to: string, subject: string, text: string) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP sozlanmagan — xat yuborilmadi (to=${to}, subject="${subject}"). ` +
          `Development rejimida xat matni server logida ko‘rsatiladi.`,
      );
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`[DEV EMAIL] ${to}\n${subject}\n${text}`);
      }
      return;
    }
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'ImageRights.uz <no-reply@imagerights.uz>',
      to,
      subject,
      text,
    });
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    await this.send(
      to,
      'ImageRights.uz — parolni tiklash',
      `Parolingizni tiklash uchun quyidagi havolaga o‘ting (1 soat amal qiladi):\n\n${resetUrl}\n\nAgar bu so‘rovni siz yubormagan bo‘lsangiz, xatni e'tiborsiz qoldiring.`,
    );
  }

  async sendEmailVerification(to: string, verifyUrl: string) {
    await this.send(
      to,
      'ImageRights.uz — email manzilini tasdiqlash',
      `Email manzilingizni tasdiqlash uchun quyidagi havolaga o‘ting (24 soat amal qiladi):\n\n${verifyUrl}`,
    );
  }
}

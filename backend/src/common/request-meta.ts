import type { Request } from 'express';

export type RequestMeta = { ipAddress?: string; userAgent?: string };

/** Audit log uchun so‘rov metama'lumotlarini ajratib olish. */
export function requestMeta(req: Request): RequestMeta {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwarded)
    ? forwarded[0]
    : (forwarded?.split(',')[0]?.trim() ?? req.ip);
  return { ipAddress, userAgent: req.headers['user-agent']?.slice(0, 255) };
}

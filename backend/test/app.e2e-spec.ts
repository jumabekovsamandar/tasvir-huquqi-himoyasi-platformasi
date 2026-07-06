/**
 * Muhim oqimlar uchun e2e testlar: ro‘yxatdan o‘tish, kirish, himoyalangan
 * yo‘llar, avtorizatsiya (IDOR), tasvir reyestri, hisobot yaratish,
 * dalil egaligi, admin cheklovlari.
 *
 * Talab: lokal PostgreSQL (DATABASE_URL) ishlab turishi kerak.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30_000);

describe('ImageRights API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let http: ReturnType<INestApplication['getHttpServer']>;

  const stamp = Date.now();
  const userA = {
    fullName: 'Test Foydalanuvchi A',
    email: `e2e-a-${stamp}@test.uz`,
    password: 'juda-maxfiy-123',
  };
  const userB = {
    fullName: 'Test Foydalanuvchi B',
    email: `e2e-b-${stamp}@test.uz`,
    password: 'juda-maxfiy-456',
  };

  let tokenA = '';
  let tokenB = '';
  let adminToken = '';
  let reportId = '';
  let caseId = '';
  let evidenceId = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    http = app.getHttpServer();
  });

  afterAll(async () => {
    // Test foydalanuvchilarini tozalash (cascade orqali bog‘liq yozuvlar ham o‘chadi)
    await prisma.user.deleteMany({
      where: { email: { contains: `-${stamp}@test.uz` } },
    });
    await app.close();
  });

  // ─── Autentifikatsiya ──────────────────────────────────────

  it('ro‘yxatdan o‘tish ishlaydi va token qaytaradi', async () => {
    const res = await request(http)
      .post('/api/auth/register')
      .send(userA)
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('USER');
    tokenA = res.body.accessToken;
  });

  it('bir xil email bilan qayta ro‘yxatdan o‘tib bo‘lmaydi', async () => {
    await request(http).post('/api/auth/register').send(userA).expect(409);
  });

  it('zaif parol rad etiladi', async () => {
    await request(http)
      .post('/api/auth/register')
      .send({ ...userB, email: `weak-${stamp}@test.uz`, password: 'qisqa' })
      .expect(400);
  });

  it('kirish to‘g‘ri parol bilan ishlaydi', async () => {
    const res = await request(http)
      .post('/api/auth/login')
      .send({ email: userA.email, password: userA.password })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
  });

  it('kirish noto‘g‘ri parol bilan 401 qaytaradi', async () => {
    await request(http)
      .post('/api/auth/login')
      .send({ email: userA.email, password: 'notogri-parol' })
      .expect(401);
  });

  it('himoyalangan yo‘l tokensiz 401 qaytaradi', async () => {
    await request(http).get('/api/auth/me').expect(401);
    await request(http).get('/api/violations').expect(401);
    await request(http).get('/api/images').expect(401);
  });

  it('me endpoint profil bilan qaytadi', async () => {
    const res = await request(http)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(res.body.profile.fullName).toBe(userA.fullName);
  });

  // ─── Tasvir reyestri ───────────────────────────────────────

  it('tasvirni ro‘yxatdan o‘tkazish (PNG magic bytes bilan)', async () => {
    // Minimal haqiqiy PNG fayl
    const png = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c626001000000ffff03000006000557bfabd40000000049454e44ae426082',
      'hex',
    );
    const res = await request(http)
      .post('/api/images')
      .set('Authorization', `Bearer ${tokenA}`)
      .field('title', 'Test portret')
      .field('description', 'E2E test tasviri')
      .attach('file', png, { filename: 'portret.png', contentType: 'image/png' })
      .expect(201);
    expect(res.body.registryCode).toMatch(/^IMG-\d{4}-/);
    expect(res.body.sha256).toHaveLength(64);
  });

  it('exe-fayl niqoblangan yuklash rad etiladi', async () => {
    const fakeExe = Buffer.from('4d5a90000300', 'hex'); // MZ header
    await request(http)
      .post('/api/images')
      .set('Authorization', `Bearer ${tokenA}`)
      .field('title', 'Zararli fayl')
      .attach('file', fakeExe, { filename: 'virus.png', contentType: 'image/png' })
      .expect(400);
  });

  // ─── Hisobot va ish oqimi ──────────────────────────────────

  it('huquqbuzarlik hisoboti yaratish (DRAFT)', async () => {
    const res = await request(http)
      .post('/api/violations')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        platform: 'INSTAGRAM',
        infringingUrl: 'https://instagram.com/p/e2e-test',
        discoveredAt: new Date().toISOString(),
        description:
          'Mening suratim ruxsatsiz tijorat reklamasida ishlatilmoqda.',
        commercialUse: true,
      })
      .expect(201);
    expect(res.body.status).toBe('DRAFT');
    reportId = res.body.id;
  });

  it('URL dalil qo‘shish', async () => {
    const res = await request(http)
      .post('/api/evidence/url')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        reportId,
        url: 'https://instagram.com/p/e2e-test',
        description: 'Huquqbuzar post',
      })
      .expect(201);
    evidenceId = res.body.id;
  });

  it('hisobotni yuborish ish (Case) ochadi', async () => {
    const res = await request(http)
      .post(`/api/violations/${reportId}/submit`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(201);
    expect(res.body.status).toBe('SUBMITTED');
    expect(res.body.case.caseNumber).toMatch(/^IR-\d{4}-/);
    caseId = res.body.case.id;
  });

  it('yuborilgan hisobotni tahrirlash mumkin emas', async () => {
    await request(http)
      .patch(`/api/violations/${reportId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ description: 'O‘zgartirilgan tavsif — bu rad etilishi kerak!' })
      .expect(400);
  });

  // ─── Avtorizatsiya (IDOR himoyasi) ─────────────────────────

  it('boshqa foydalanuvchi resurslarga kira olmaydi', async () => {
    const reg = await request(http)
      .post('/api/auth/register')
      .send(userB)
      .expect(201);
    tokenB = reg.body.accessToken;

    await request(http)
      .get(`/api/violations/${reportId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
    await request(http)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
    await request(http)
      .get(`/api/evidence/${evidenceId}/download`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('dalil faqat egasi tomonidan ko‘rinadi', async () => {
    const mine = await request(http)
      .get('/api/evidence/mine')
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200);
    expect(mine.body).toHaveLength(0);
  });

  // ─── Rollar ────────────────────────────────────────────────

  it('oddiy foydalanuvchi admin endpointlariga kira olmaydi', async () => {
    await request(http)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
    await request(http)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });

  it('oddiy foydalanuvchi ish holatini o‘zgartira olmaydi', async () => {
    await request(http)
      .patch(`/api/cases/${caseId}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'RESOLVED' })
      .expect(403);
  });

  it('admin foydalanuvchilar ro‘yxatini ko‘radi va advokat tasdiqlaydi', async () => {
    // Testda adminni to‘g‘ridan-to‘g‘ri bazada yaratamiz
    const adminEmail = `e2e-admin-${stamp}@test.uz`;
    await request(http)
      .post('/api/auth/register')
      .send({ fullName: 'Admin Test', email: adminEmail, password: 'admin-parol-99' })
      .expect(201);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN' },
    });
    const login = await request(http)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: 'admin-parol-99' })
      .expect(201);
    adminToken = login.body.accessToken;

    const res = await request(http)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(typeof res.body.users).toBe('number');
  });

  it('advokat ro‘yxatdan o‘tadi, tasdiqlanmaguncha ish biriktirilmaydi', async () => {
    const lawyerEmail = `e2e-lawyer-${stamp}@test.uz`;
    const reg = await request(http)
      .post('/api/auth/register')
      .send({
        fullName: 'Advokat Test',
        email: lawyerEmail,
        password: 'advokat-parol-1',
        role: 'LAWYER',
        licenseNumber: 'AD-12345',
      })
      .expect(201);
    expect(reg.body.user.role).toBe('LAWYER');
    expect(reg.body.user.lawyerProfile.verified).toBe(false);
    const lawyerId = reg.body.user.id;

    // Tasdiqlashsiz biriktirish rad etiladi
    await request(http)
      .patch(`/api/admin/cases/${caseId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lawyerId })
      .expect(400);

    // Admin tasdiqlaydi → biriktirish ishlaydi
    await request(http)
      .patch(`/api/admin/lawyers/${lawyerId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ verified: true })
      .expect(200);
    await request(http)
      .patch(`/api/admin/cases/${caseId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lawyerId })
      .expect(200);

    // Biriktirilgan advokat ishni ko‘radi va holatni o‘zgartiradi
    const lawyerLogin = await request(http)
      .post('/api/auth/login')
      .send({ email: lawyerEmail, password: 'advokat-parol-1' })
      .expect(201);
    const lawyerToken = lawyerLogin.body.accessToken;

    const caseRes = await request(http)
      .get(`/api/cases/${caseId}`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .expect(200);
    expect(caseRes.body.caseNumber).toMatch(/^IR-/);

    await request(http)
      .patch(`/api/cases/${caseId}/status`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ status: 'UNDER_REVIEW', note: 'Ko‘rib chiqish boshlandi' })
      .expect(200);

    // Ichki eslatma mijozga ko‘rinmasligi kerak
    await request(http)
      .post(`/api/cases/${caseId}/notes`)
      .set('Authorization', `Bearer ${lawyerToken}`)
      .send({ body: 'Maxfiy ichki eslatma' })
      .expect(201);
    await request(http)
      .get(`/api/cases/${caseId}/notes`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });

  it('hujjat yaratish va PDF eksport ishlaydi', async () => {
    const doc = await request(http)
      .post('/api/documents/generate')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ caseId, type: 'TAKEDOWN_REQUEST', recipientName: 'Platforma' })
      .expect(201);
    expect(doc.body.content).toContain('OLIB TASHLASH TALABI');

    const pdf = await request(http)
      .get(`/api/documents/${doc.body.id}/pdf`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');

    // Begona foydalanuvchi hujjatni ko‘ra olmaydi
    await request(http)
      .get(`/api/documents/${doc.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });
});

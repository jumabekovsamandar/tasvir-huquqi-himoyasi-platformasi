import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123', 10);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@imagerights.uz' },
    update: {},
    create: {
      email: 'demo@imagerights.uz',
      fullName: 'Dilnoza Karimova',
      role: 'CREATOR',
      passwordHash,
      emailVerified: true,
      subscription: {
        create: { plan: 'PROFESSIONAL', scanLimit: 100000, status: 'ACTIVE' },
      },
    },
  });

  const image = await prisma.image.create({
    data: {
      ownerId: demo.id,
      title: 'Portret_2026.jpg',
      storageKey: 'demo/portret_2026.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 2_400_000,
      sha256: 'demo-sha256-portret',
      registryCode: 'IR-48F2A1',
      status: 'VERIFIED',
    },
  });

  await prisma.monitoringJob.create({
    data: {
      userId: demo.id,
      imageId: image.id,
      active: true,
      matches: {
        create: [
          {
            url: 'https://instagram.com/fakeaccount',
            domain: 'instagram.com',
            similarity: 98,
            status: 'UNAUTHORIZED',
          },
          {
            url: 'https://reklama-sayt.uz/banner',
            domain: 'reklama-sayt.uz',
            similarity: 91,
            status: 'CLAIM_SENT',
          },
        ],
      },
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed tayyor:', demo.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ImagesModule } from './modules/images/images.module';
import { ConsentModule } from './modules/consent/consent.module';
import { DeepfakeModule } from './modules/deepfake/deepfake.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { LegalModule } from './modules/legal/legal.module';
import { RtbfModule } from './modules/rtbf/rtbf.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ImagesModule,
    ConsentModule,
    DeepfakeModule,
    MonitoringModule,
    EvidenceModule,
    LegalModule,
    RtbfModule,
    MarketplaceModule,
  ],
})
export class AppModule {}

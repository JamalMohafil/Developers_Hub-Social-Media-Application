import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import prismaConfig from './prisma.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(prismaConfig)],
  providers: [PrismaService],
  exports: [PrismaService], // تصدير الخدمة لاستخدامها في موديولات أخرى
})
export class PrismaModule {}

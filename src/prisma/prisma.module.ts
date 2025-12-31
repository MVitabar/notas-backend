import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaExtendedService } from './prisma-extended.service';

@Module({
  providers: [PrismaService, PrismaExtendedService],
  exports: [PrismaService, PrismaExtendedService],
})
export class PrismaModule {}

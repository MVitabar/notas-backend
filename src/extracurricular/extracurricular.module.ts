import { Module } from '@nestjs/common';
import { ExtracurricularService } from './extracurricular.service';
import { ExtracurricularController } from './extracurricular.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExtracurricularController],
  providers: [ExtracurricularService, PrismaService],
  exports: [ExtracurricularService]
})
export class ExtracurricularModule {}

import { Module } from '@nestjs/common';
import { SpecialtiesController } from '@/specialties/specialties.controller';
import { SpecialtiesService } from '@/specialties/specialties.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}


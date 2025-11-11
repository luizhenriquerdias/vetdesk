import { Module } from '@nestjs/common';
import { ReportsController } from '@/reports/reports.controller';
import { ReportsService } from '@/reports/reports.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { TransactionsModule } from '@/transactions/transactions.module';

@Module({
  imports: [PrismaModule, TransactionsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}


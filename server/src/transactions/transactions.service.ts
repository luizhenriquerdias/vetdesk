import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionResponse, TRANSACTION_TYPE_INCOME, TRANSACTION_TYPE_EXPENSE, TransactionType } from '@vetdesk/shared/types/transaction';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean, month?: string): Promise<TransactionResponse[]> {
    const whereClause: {
      deletedAt?: { not: null } | null;
      datetime?: {
        gte: Date;
        lte: Date;
      };
    } = {};

    if (includeDeleted) {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        throw new BadRequestException('Invalid month format. Expected YYYY-MM');
      }

      const startOfMonth = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

      whereClause.datetime = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        datetime: 'desc',
      },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      datetime: transaction.datetime.toISOString(),
      amount: transaction.amount.toNumber(),
      createdAt: transaction.createdAt.toISOString(),
      createdBy: transaction.createdBy,
      updatedAt: transaction.updatedAt.toISOString(),
      updatedBy: transaction.updatedBy,
      deletedAt: transaction.deletedAt?.toISOString() || null,
      deletedBy: transaction.deletedBy,
    }));
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} must be between ${min} and ${max} characters`,
      );
    }
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<TransactionResponse> {
    const description = createTransactionDto.description.trim();
    const type = createTransactionDto.type;
    const datetime = new Date(createTransactionDto.datetime);

    if (!description) {
      throw new BadRequestException('description is required');
    }

    if (!type) {
      throw new BadRequestException('type is required');
    }

    if (type !== TRANSACTION_TYPE_INCOME && type !== TRANSACTION_TYPE_EXPENSE) {
      throw new BadRequestException('type must be INCOME or EXPENSE');
    }

    if (!createTransactionDto.datetime) {
      throw new BadRequestException('datetime is required');
    }

    if (isNaN(datetime.getTime())) {
      throw new BadRequestException('Invalid datetime format');
    }

    if (createTransactionDto.amount === undefined || createTransactionDto.amount === null) {
      throw new BadRequestException('amount is required');
    }

    if (typeof createTransactionDto.amount !== 'number' || isNaN(createTransactionDto.amount)) {
      throw new BadRequestException('amount must be a valid number');
    }

    if (createTransactionDto.amount < 0) {
      throw new BadRequestException('amount must be greater than or equal to 0');
    }

    this.validateStringLength(description, 1, 500, 'description');

    const transaction = await this.prisma.transaction.create({
      data: {
        description,
        type,
        datetime,
        amount: createTransactionDto.amount,
        createdBy: userId,
      },
    });

    return {
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      datetime: transaction.datetime.toISOString(),
      amount: transaction.amount.toNumber(),
      createdAt: transaction.createdAt.toISOString(),
      createdBy: transaction.createdBy,
      updatedAt: transaction.updatedAt.toISOString(),
      updatedBy: transaction.updatedBy,
      deletedAt: transaction.deletedAt?.toISOString() || null,
      deletedBy: transaction.deletedBy,
    };
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string): Promise<TransactionResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Transaction id is required');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.deletedAt) {
      throw new BadRequestException('Cannot update a deleted transaction');
    }

    const updateData: {
      description?: string;
      type?: TransactionType;
      datetime?: Date;
      amount?: number;
      updatedBy?: string;
    } = {};

    if (Object.keys(updateTransactionDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    if (updateTransactionDto.description !== undefined) {
      const description = updateTransactionDto.description.trim();
      if (!description) {
        throw new BadRequestException('description cannot be empty');
      }
      this.validateStringLength(description, 1, 500, 'description');
      updateData.description = description;
    }

    if (updateTransactionDto.type !== undefined) {
      if (updateTransactionDto.type !== TRANSACTION_TYPE_INCOME && updateTransactionDto.type !== TRANSACTION_TYPE_EXPENSE) {
        throw new BadRequestException('type must be INCOME or EXPENSE');
      }
      updateData.type = updateTransactionDto.type;
    }

    if (updateTransactionDto.datetime !== undefined) {
      const datetime = new Date(updateTransactionDto.datetime);
      if (isNaN(datetime.getTime())) {
        throw new BadRequestException('Invalid datetime format');
      }
      updateData.datetime = datetime;
    }

    if (updateTransactionDto.amount !== undefined) {
      if (typeof updateTransactionDto.amount !== 'number' || isNaN(updateTransactionDto.amount)) {
        throw new BadRequestException('amount must be a valid number');
      }
      if (updateTransactionDto.amount < 0) {
        throw new BadRequestException('amount must be greater than or equal to 0');
      }
      updateData.amount = updateTransactionDto.amount;
    }

    updateData.updatedBy = userId;

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedTransaction.id,
      description: updatedTransaction.description,
      type: updatedTransaction.type,
      datetime: updatedTransaction.datetime.toISOString(),
      amount: updatedTransaction.amount.toNumber(),
      createdAt: updatedTransaction.createdAt.toISOString(),
      createdBy: updatedTransaction.createdBy,
      updatedAt: updatedTransaction.updatedAt.toISOString(),
      updatedBy: updatedTransaction.updatedBy,
      deletedAt: updatedTransaction.deletedAt?.toISOString() || null,
      deletedBy: updatedTransaction.deletedBy,
    };
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Transaction id is required');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.deletedAt) {
      throw new BadRequestException('Transaction is already deleted');
    }

    await this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Transaction deleted successfully' };
  }

  async restore(id: string): Promise<TransactionResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Transaction id is required');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!transaction.deletedAt) {
      throw new BadRequestException('Transaction is not deleted');
    }

    const restoredTransaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    return {
      id: restoredTransaction.id,
      description: restoredTransaction.description,
      type: restoredTransaction.type,
      datetime: restoredTransaction.datetime.toISOString(),
      amount: restoredTransaction.amount.toNumber(),
      createdAt: restoredTransaction.createdAt.toISOString(),
      createdBy: restoredTransaction.createdBy,
      updatedAt: restoredTransaction.updatedAt.toISOString(),
      updatedBy: restoredTransaction.updatedBy,
      deletedAt: restoredTransaction.deletedAt?.toISOString() || null,
      deletedBy: restoredTransaction.deletedBy,
    };
  }
}


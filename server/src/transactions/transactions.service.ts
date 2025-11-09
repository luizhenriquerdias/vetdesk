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

  async findAll(includeDeleted?: boolean): Promise<TransactionResponse[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      datetime: transaction.datetime.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: transaction.createdBy,
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

    this.validateStringLength(description, 1, 500, 'description');

    const transaction = await this.prisma.transaction.create({
      data: {
        description,
        type,
        datetime,
        createdBy: userId,
      },
    });

    return {
      id: transaction.id,
      description: transaction.description,
      type: transaction.type,
      datetime: transaction.datetime.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: transaction.createdBy,
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
      createdAt: updatedTransaction.createdAt.toISOString(),
      updatedAt: updatedTransaction.updatedAt.toISOString(),
      createdBy: updatedTransaction.createdBy,
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
      createdAt: restoredTransaction.createdAt.toISOString(),
      updatedAt: restoredTransaction.updatedAt.toISOString(),
      createdBy: restoredTransaction.createdBy,
      updatedBy: restoredTransaction.updatedBy,
      deletedAt: restoredTransaction.deletedAt?.toISOString() || null,
      deletedBy: restoredTransaction.deletedBy,
    };
  }
}


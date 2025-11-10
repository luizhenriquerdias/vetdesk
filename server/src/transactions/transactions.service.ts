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
        throw new BadRequestException('Formato de mês inválido. Esperado AAAA-MM');
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
        `${fieldName} deve ter entre ${min} e ${max} caracteres`,
      );
    }
  }

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<TransactionResponse> {
    const description = createTransactionDto.description.trim();
    const type = createTransactionDto.type;
    const datetime = new Date(createTransactionDto.datetime);

    if (!description) {
      throw new BadRequestException('Descrição é obrigatória');
    }

    if (!type) {
      throw new BadRequestException('Tipo é obrigatório');
    }

    if (type !== TRANSACTION_TYPE_INCOME && type !== TRANSACTION_TYPE_EXPENSE) {
      throw new BadRequestException('Tipo deve ser RECEITA ou DESPESA');
    }

    if (!createTransactionDto.datetime) {
      throw new BadRequestException('Data e hora são obrigatórias');
    }

    if (isNaN(datetime.getTime())) {
      throw new BadRequestException('Formato de data e hora inválido');
    }

    if (createTransactionDto.amount === undefined || createTransactionDto.amount === null) {
      throw new BadRequestException('Valor é obrigatório');
    }

    if (typeof createTransactionDto.amount !== 'number' || isNaN(createTransactionDto.amount)) {
      throw new BadRequestException('Valor deve ser um número válido');
    }

    if (createTransactionDto.amount < 0) {
      throw new BadRequestException('Valor deve ser maior ou igual a 0');
    }

    this.validateStringLength(description, 1, 500, 'Descrição');

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
      throw new BadRequestException('ID da transação é obrigatório');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (transaction.deletedAt) {
      throw new BadRequestException('Não é possível atualizar uma transação excluída');
    }

    const updateData: {
      description?: string;
      type?: TransactionType;
      datetime?: Date;
      amount?: number;
      updatedBy?: string;
    } = {};

    if (Object.keys(updateTransactionDto).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (updateTransactionDto.description !== undefined) {
      const description = updateTransactionDto.description.trim();
      if (!description) {
        throw new BadRequestException('Descrição não pode estar vazia');
      }
      this.validateStringLength(description, 1, 500, 'Descrição');
      updateData.description = description;
    }

    if (updateTransactionDto.type !== undefined) {
      if (updateTransactionDto.type !== TRANSACTION_TYPE_INCOME && updateTransactionDto.type !== TRANSACTION_TYPE_EXPENSE) {
        throw new BadRequestException('Tipo deve ser RECEITA ou DESPESA');
      }
      updateData.type = updateTransactionDto.type;
    }

    if (updateTransactionDto.datetime !== undefined) {
      const datetime = new Date(updateTransactionDto.datetime);
      if (isNaN(datetime.getTime())) {
        throw new BadRequestException('Formato de data e hora inválido');
      }
      updateData.datetime = datetime;
    }

    if (updateTransactionDto.amount !== undefined) {
      if (typeof updateTransactionDto.amount !== 'number' || isNaN(updateTransactionDto.amount)) {
        throw new BadRequestException('Valor deve ser um número válido');
      }
      if (updateTransactionDto.amount < 0) {
        throw new BadRequestException('Valor deve ser maior ou igual a 0');
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
      throw new BadRequestException('ID da transação é obrigatório');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (transaction.deletedAt) {
      throw new BadRequestException('Transação já está excluída');
    }

    await this.prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Transação excluída com sucesso' };
  }

  async restore(id: string): Promise<TransactionResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da transação é obrigatório');
    }

    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (!transaction.deletedAt) {
      throw new BadRequestException('Transação não está excluída');
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


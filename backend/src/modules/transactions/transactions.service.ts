import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { BaseRepository, PaginationResult } from '../../common/repositories/base.repository';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class TransactionsService extends BaseRepository<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private inventoryService: InventoryService,
  ) {
    super(transactionRepository);
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { productId, type, quantity, unitPrice, totalAmount } = createTransactionDto;

    // Calculate total amount if not provided
    const calculatedTotalAmount = totalAmount || (unitPrice ? unitPrice * quantity : 0);

    // Create transaction
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      totalAmount: calculatedTotalAmount,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Update inventory based on transaction type
    try {
      switch (type) {
        case TransactionType.PURCHASE:
        case TransactionType.ADJUSTMENT:
          await this.inventoryService.updateStock(productId, quantity, 'add');
          break;
        case TransactionType.SALE:
          await this.inventoryService.updateStock(productId, quantity, 'subtract');
          break;
        case TransactionType.RETURN:
          await this.inventoryService.updateStock(productId, quantity, 'add');
          break;
        default:
          throw new BadRequestException('Invalid transaction type');
      }
    } catch (error) {
      // Rollback transaction if inventory update fails
      await this.transactionRepository.remove(savedTransaction);
      throw error;
    }

    return this.findOne(savedTransaction.id);
  }

  async findAll(queryDto: QueryTransactionDto): Promise<PaginationResult<Transaction>> {
    const { 
      search, 
      type, 
      productId, 
      reference, 
      startDate, 
      endDate, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    } = queryDto;
    
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.product', 'product')
      .leftJoinAndSelect('product.category', 'category');

    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR transaction.notes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (productId) {
      queryBuilder.andWhere('transaction.productId = :productId', { productId });
    }

    if (reference) {
      queryBuilder.andWhere('transaction.reference ILIKE :reference', { 
        reference: `%${reference}%` 
      });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    if (sortBy) {
      queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder);
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['product', 'product.category'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    
    // Check if quantity or type is being changed
    const quantityChanged = updateTransactionDto.quantity !== undefined && 
                           updateTransactionDto.quantity !== transaction.quantity;
    const typeChanged = updateTransactionDto.type !== undefined && 
                       updateTransactionDto.type !== transaction.type;

    if (quantityChanged || typeChanged) {
      throw new BadRequestException('Cannot modify quantity or type of existing transactions');
    }

    await this.transactionRepository.update(id, updateTransactionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const transaction = await this.findOne(id);
    
    // Reverse the inventory change
    const { productId, type, quantity } = transaction;
    
    try {
      switch (type) {
        case TransactionType.PURCHASE:
        case TransactionType.ADJUSTMENT:
          await this.inventoryService.updateStock(productId, quantity, 'subtract');
          break;
        case TransactionType.SALE:
          await this.inventoryService.updateStock(productId, quantity, 'add');
          break;
        case TransactionType.RETURN:
          await this.inventoryService.updateStock(productId, quantity, 'subtract');
          break;
      }
    } catch (error) {
      throw new BadRequestException('Cannot delete transaction due to inventory constraints');
    }

    await this.delete(id);
  }

  async getTransactionSummary(productId?: string, startDate?: string, endDate?: string) {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .select([
        'transaction.type',
        'SUM(transaction.quantity) as totalQuantity',
        'SUM(transaction.totalAmount) as totalAmount',
        'COUNT(*) as transactionCount'
      ])
      .groupBy('transaction.type');

    if (productId) {
      queryBuilder.where('transaction.productId = :productId', { productId });
    }

    if (startDate) {
      queryBuilder.andWhere('transaction.transactionDate >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.transactionDate <= :endDate', { endDate });
    }

    return queryBuilder.getRawMany();
  }
}

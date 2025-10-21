import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { BaseRepository, PaginationResult } from '../../common/repositories/base.repository';

@Injectable()
export class InventoryService extends BaseRepository<Inventory> {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {
    super(inventoryRepository);
  }

  async findAll(queryDto: QueryInventoryDto): Promise<PaginationResult<Inventory>> {
    const { 
      search, 
      lowStock, 
      minStock, 
      maxStock, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    } = queryDto;
    
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.category', 'category');

    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (lowStock) {
      queryBuilder.andWhere('inventory.currentStock <= inventory.minimumStock');
    }

    if (minStock !== undefined) {
      queryBuilder.andWhere('inventory.currentStock >= :minStock', { minStock });
    }

    if (maxStock !== undefined) {
      queryBuilder.andWhere('inventory.currentStock <= :maxStock', { maxStock });
    }

    if (sortBy) {
      queryBuilder.orderBy(`inventory.${sortBy}`, sortOrder);
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

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product', 'product.category'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProductId(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product', 'product.category'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findOne(id);
    
    // Update inventory
    await this.inventoryRepository.update(id, updateInventoryDto);
    
    // Update last restocked date if stock was increased
    if (updateInventoryDto.currentStock !== undefined && 
        updateInventoryDto.currentStock > inventory.currentStock) {
      await this.inventoryRepository.update(id, {
        lastRestockedAt: new Date(),
      });
    }

    return this.findOne(id);
  }

  async updateStock(productId: string, quantityChange: number, type: 'add' | 'subtract'): Promise<Inventory> {
    const inventory = await this.findByProductId(productId);
    
    const newStock = type === 'add' 
      ? inventory.currentStock + quantityChange 
      : inventory.currentStock - quantityChange;

    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    await this.inventoryRepository.update(inventory.id, {
      currentStock: newStock,
      lastRestockedAt: type === 'add' ? new Date() : inventory.lastRestockedAt,
    });

    return this.findByProductId(productId);
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('inventory.currentStock <= inventory.minimumStock')
      .andWhere('inventory.minimumStock > 0')
      .getMany();
  }
}

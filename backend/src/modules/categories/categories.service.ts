import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { PaginationResult } from '../../common/repositories/base.repository';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(queryDto: QueryCategoryDto): Promise<PaginationResult<Category>> {
    const { search, isActive, page, limit, sortBy, sortOrder } = queryDto;
    
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (search) {
      queryBuilder.where(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', { isActive });
    }

    if (sortBy) {
      queryBuilder.orderBy(`category.${sortBy}`, sortOrder);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await queryBuilder
      .skip(skip)
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

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    
    // Check if category has products
    const productCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .where('category.id = :id', { id })
      .getCount();

    if (productCount > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }

    await this.categoryRepository.delete(id);
  }
}

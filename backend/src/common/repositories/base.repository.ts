import { Repository, FindManyOptions, FindOptionsWhere, FindOptionsOrder } from 'typeorm';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository<T> {
  constructor(protected repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    return this.repository.save(entity) as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async count(options?: FindManyOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  async paginate(
    options: PaginationOptions,
    findOptions?: FindManyOptions<T>
  ): Promise<PaginationResult<T>> {
    const { page, limit, sortBy, sortOrder = 'DESC' } = options;
    const skip = (page - 1) * limit;

    const order: FindOptionsOrder<T> = sortBy ? { [sortBy]: sortOrder } as any : undefined;

    const [data, total] = await this.repository.findAndCount({
      ...findOptions,
      skip,
      take: limit,
      order,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

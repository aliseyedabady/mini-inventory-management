// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  products?: Product[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// Product types
export interface Product extends BaseEntity {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  unit?: string;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  inventory?: Inventory[];
  transactions?: Transaction[];
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  unit?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

// Inventory types
export interface Inventory extends BaseEntity {
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  averageCost?: number;
  lastRestockedAt?: string;
  productId: string;
  product?: Product;
}

export interface UpdateInventoryDto {
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
}

// Transaction types
export enum TransactionType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

export interface Transaction extends BaseEntity {
  type: TransactionType;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
  reference?: string;
  transactionDate: string;
  productId: string;
  product?: Product;
}

export interface CreateTransactionDto {
  type: TransactionType;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  notes?: string;
  reference?: string;
  productId: string;
  transactionDate?: string;
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

// Query types
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface CategoryQueryParams extends QueryParams {
  isActive?: boolean;
}

export interface ProductQueryParams extends QueryParams {
  categoryId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface InventoryQueryParams extends QueryParams {
  lowStock?: boolean;
  minStock?: number;
  maxStock?: number;
}

export interface TransactionQueryParams extends QueryParams {
  type?: TransactionType;
  productId?: string;
  reference?: string;
  startDate?: string;
  endDate?: string;
}

// Pagination types
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

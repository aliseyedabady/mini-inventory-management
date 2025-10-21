import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryQueryParams,
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  Inventory,
  UpdateInventoryDto,
  InventoryQueryParams,
  Transaction,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryParams,
  PaginationResult
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Categories API
  async getCategories(params?: CategoryQueryParams): Promise<PaginationResult<Category>> {
    const response: AxiosResponse<PaginationResult<Category>> = await this.api.get('/categories', { params });
    return response.data;
  }

  async getCategory(id: string): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.get(`/categories/${id}`);
    return response.data;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.post('/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response: AxiosResponse<Category> = await this.api.patch(`/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // Products API
  async getProducts(params?: ProductQueryParams): Promise<PaginationResult<Product>> {
    const response: AxiosResponse<PaginationResult<Product>> = await this.api.get('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.post('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response: AxiosResponse<Product> = await this.api.patch(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  // Inventory API
  async getInventory(params?: InventoryQueryParams): Promise<PaginationResult<Inventory>> {
    const response: AxiosResponse<PaginationResult<Inventory>> = await this.api.get('/inventory', { params });
    return response.data;
  }

  async getInventoryItem(id: string): Promise<Inventory> {
    const response: AxiosResponse<Inventory> = await this.api.get(`/inventory/${id}`);
    return response.data;
  }

  async getInventoryByProductId(productId: string): Promise<Inventory> {
    const response: AxiosResponse<Inventory> = await this.api.get(`/inventory/product/${productId}`);
    return response.data;
  }

  async updateInventory(id: string, data: UpdateInventoryDto): Promise<Inventory> {
    const response: AxiosResponse<Inventory> = await this.api.patch(`/inventory/${id}`, data);
    return response.data;
  }

  async getLowStockItems(): Promise<Inventory[]> {
    const response: AxiosResponse<Inventory[]> = await this.api.get('/inventory/low-stock');
    return response.data;
  }

  // Transactions API
  async getTransactions(params?: TransactionQueryParams): Promise<PaginationResult<Transaction>> {
    const response: AxiosResponse<PaginationResult<Transaction>> = await this.api.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(data: CreateTransactionDto): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.api.post('/transactions', data);
    return response.data;
  }

  async updateTransaction(id: string, data: UpdateTransactionDto): Promise<Transaction> {
    const response: AxiosResponse<Transaction> = await this.api.patch(`/transactions/${id}`, data);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.api.delete(`/transactions/${id}`);
  }

  async getTransactionSummary(productId?: string, startDate?: string, endDate?: string): Promise<any[]> {
    const response: AxiosResponse<any[]> = await this.api.get('/transactions/summary', {
      params: { productId, startDate, endDate }
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

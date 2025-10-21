import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { Product, CreateProductDto, UpdateProductDto, ProductQueryParams } from '../types';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';

const Products: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => apiService.getProducts(queryParams),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories({ page: 1, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) => apiService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      apiService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreateProductDto | UpdateProductDto) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: data as UpdateProductDto });
    } else {
      createMutation.mutate(data as CreateProductDto);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string, item: Product) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
        </div>
      ),
    },
    {
      key: 'category.name',
      label: 'Category',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value || 'No Category'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'cost',
      label: 'Cost',
      render: (value: number) => value ? `$${value.toFixed(2)}` : '-',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, item: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(item)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search products..."
              className="input"
              value={queryParams.search || ''}
              onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value, page: 1 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="input"
              value={queryParams.categoryId || ''}
              onChange={(e) => setQueryParams({ ...queryParams, categoryId: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Categories</option>
              {categories?.data.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input"
              value={queryParams.isActive?.toString() || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1 
              })}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="input"
              value={`${queryParams.sortBy}-${queryParams.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setQueryParams({ ...queryParams, sortBy, sortOrder: sortOrder as 'ASC' | 'DESC' });
              }}
            >
              <option value="createdAt-DESC">Newest First</option>
              <option value="createdAt-ASC">Oldest First</option>
              <option value="name-ASC">Name A-Z</option>
              <option value="name-DESC">Name Z-A</option>
              <option value="price-ASC">Price Low-High</option>
              <option value="price-DESC">Price High-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={products?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No products found"
      />

      {/* Pagination */}
      {products && products.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((products.page - 1) * products.limit) + 1} to{' '}
            {Math.min(products.page * products.limit, products.total)} of{' '}
            {products.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={products.page === 1}
              onClick={() => setQueryParams({ ...queryParams, page: products.page - 1 })}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {products.page} of {products.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={products.page === products.totalPages}
              onClick={() => setQueryParams({ ...queryParams, page: products.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          categories={categories?.data || []}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Products;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryQueryParams } from '../types';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import CategoryForm from '../components/CategoryForm';

const Categories: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [queryParams, setQueryParams] = useState<CategoryQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => apiService.getCategories(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => apiService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) =>
      apiService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: data as UpdateCategoryDto });
    } else {
      createMutation.mutate(data as CreateCategoryDto);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {value || 'No description'}
        </div>
      ),
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
      key: 'products',
      label: 'Products',
      render: (value: any, item: Category) => (
        <span className="text-sm text-gray-500">
          {item.products?.length || 0} products
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, item: Category) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your products into categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search categories..."
              className="input"
              value={queryParams.search || ''}
              onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value, page: 1 })}
            />
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
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={categories?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No categories found"
      />

      {/* Pagination */}
      {categories && categories.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((categories.page - 1) * categories.limit) + 1} to{' '}
            {Math.min(categories.page * categories.limit, categories.total)} of{' '}
            {categories.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={categories.page === 1}
              onClick={() => setQueryParams({ ...queryParams, page: categories.page - 1 })}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {categories.page} of {categories.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={categories.page === categories.totalPages}
              onClick={() => setQueryParams({ ...queryParams, page: categories.page + 1 })}
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
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Categories;

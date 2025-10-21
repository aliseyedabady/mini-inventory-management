import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { InventoryQueryParams } from '../types';
import Table from '../components/Table';

const Inventory: React.FC = () => {
  const [queryParams, setQueryParams] = useState<InventoryQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'currentStock',
    sortOrder: 'ASC',
  });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory', queryParams],
    queryFn: () => apiService.getInventory(queryParams),
  });

  const { data: lowStockItems } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => apiService.getLowStockItems(),
  });

  const columns = [
    {
      key: 'product.name',
      label: 'Product',
      render: (value: string, item: any) => (
        <div>
          <div className="font-medium text-gray-900">{item.product?.name}</div>
          <div className="text-sm text-gray-500">SKU: {item.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'product.category.name',
      label: 'Category',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value || 'No Category'}
        </span>
      ),
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (value: number, item: any) => (
        <div className="flex items-center">
          <span className={`font-medium ${
            value <= item.minimumStock && item.minimumStock > 0
              ? 'text-red-600'
              : 'text-gray-900'
          }`}>
            {value}
          </span>
          {item.unit && (
            <span className="ml-1 text-sm text-gray-500">{item.product?.unit}</span>
          )}
        </div>
      ),
    },
    {
      key: 'minimumStock',
      label: 'Min Stock',
      render: (value: number) => (
        <span className="text-sm text-gray-500">{value}</span>
      ),
    },
    {
      key: 'maximumStock',
      label: 'Max Stock',
      render: (value: number) => (
        <span className="text-sm text-gray-500">{value}</span>
      ),
    },
    {
      key: 'averageCost',
      label: 'Avg Cost',
      render: (value: number) => (
        <span className="text-sm text-gray-500">
          {value ? `$${value.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'lastRestockedAt',
      label: 'Last Restocked',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, item: any) => {
        const isLowStock = item.currentStock <= item.minimumStock && item.minimumStock > 0;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isLowStock
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your stock levels and manage inventory
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {lowStockItems.length} item(s) are running low on stock.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Stock Level
            </label>
            <select
              className="input"
              value={queryParams.lowStock?.toString() || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                lowStock: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1 
              })}
            >
              <option value="">All Items</option>
              <option value="true">Low Stock Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Stock
            </label>
            <input
              type="number"
              placeholder="Minimum stock"
              className="input"
              value={queryParams.minStock || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                minStock: e.target.value ? parseInt(e.target.value) : undefined,
                page: 1 
              })}
            />
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
              <option value="currentStock-ASC">Stock Low-High</option>
              <option value="currentStock-DESC">Stock High-Low</option>
              <option value="product.name-ASC">Product A-Z</option>
              <option value="product.name-DESC">Product Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={inventory?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No inventory items found"
      />

      {/* Pagination */}
      {inventory && inventory.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((inventory.page - 1) * inventory.limit) + 1} to{' '}
            {Math.min(inventory.page * inventory.limit, inventory.total)} of{' '}
            {inventory.total} results
          </div>
          <div className="flex space-x-2">
            <button
              className="btn btn-outline btn-sm"
              disabled={inventory.page === 1}
              onClick={() => setQueryParams({ ...queryParams, page: inventory.page - 1 })}
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {inventory.page} of {inventory.totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={inventory.page === inventory.totalPages}
              onClick={() => setQueryParams({ ...queryParams, page: inventory.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

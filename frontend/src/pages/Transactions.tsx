import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { Transaction, CreateTransactionDto, UpdateTransactionDto, TransactionQueryParams, TransactionType } from '../types';
import Button from '../components/Button';
import Table from '../components/Table';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';

const Transactions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [queryParams, setQueryParams] = useState<TransactionQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'transactionDate',
    sortOrder: 'DESC',
  });

  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', queryParams],
    queryFn: () => apiService.getTransactions(queryParams),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiService.getProducts({ page: 1, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionDto) => apiService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) =>
      apiService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsModalOpen(false);
      setEditingTransaction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const handleCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: CreateTransactionDto | UpdateTransactionDto) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: data as UpdateTransactionDto });
    } else {
      createMutation.mutate(data as CreateTransactionDto);
    }
  };

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PURCHASE:
        return 'bg-green-100 text-green-800';
      case TransactionType.SALE:
        return 'bg-blue-100 text-blue-800';
      case TransactionType.ADJUSTMENT:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionType.RETURN:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'product.name',
      label: 'Product',
      render: (value: string, item: Transaction) => (
        <div>
          <div className="font-medium text-gray-900">{item.product?.name}</div>
          <div className="text-sm text-gray-500">SKU: {item.product?.sku}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: TransactionType) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTransactionTypeColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (value: number) => (
        <span className="text-sm text-gray-500">
          {value ? `$${value.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (value: number) => (
        <span className="font-medium text-gray-900">
          {value ? `$${value.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'reference',
      label: 'Reference',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'transactionDate',
      label: 'Date',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, item: Transaction) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all inventory movements and transactions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search transactions..."
              className="input"
              value={queryParams.search || ''}
              onChange={(e) => setQueryParams({ ...queryParams, search: e.target.value, page: 1 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="input"
              value={queryParams.type || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                type: e.target.value as TransactionType || undefined,
                page: 1 
              })}
            >
              <option value="">All Types</option>
              <option value={TransactionType.PURCHASE}>Purchase</option>
              <option value={TransactionType.SALE}>Sale</option>
              <option value={TransactionType.ADJUSTMENT}>Adjustment</option>
              <option value={TransactionType.RETURN}>Return</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              className="input"
              value={queryParams.productId || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                productId: e.target.value || undefined,
                page: 1 
              })}
            >
              <option value="">All Products</option>
              {products?.data.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="input"
              value={queryParams.startDate || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                startDate: e.target.value || undefined,
                page: 1 
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              className="input"
              value={queryParams.endDate || ''}
              onChange={(e) => setQueryParams({ 
                ...queryParams, 
                endDate: e.target.value || undefined,
                page: 1 
              })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={transactions?.data || []}
        columns={columns}
        loading={isLoading}
        emptyMessage="No transactions found"
      />

      {/* Pagination */}
      {transactions && transactions.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((transactions.page - 1) * transactions.limit) + 1} to{' '}
            {Math.min(transactions.page * transactions.limit, transactions.total)} of{' '}
            {transactions.total} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={transactions.page === 1}
              onClick={() => setQueryParams({ ...queryParams, page: transactions.page - 1 })}
            >
              Previous
            </Button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {transactions.page} of {transactions.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={transactions.page === transactions.totalPages}
              onClick={() => setQueryParams({ ...queryParams, page: transactions.page + 1 })}
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
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        size="lg"
      >
        <TransactionForm
          transaction={editingTransaction}
          products={products?.data || []}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};

export default Transactions;

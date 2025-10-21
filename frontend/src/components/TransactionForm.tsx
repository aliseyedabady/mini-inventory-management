import React from 'react';
import { useForm } from 'react-hook-form';
import { Transaction, CreateTransactionDto, UpdateTransactionDto, Product, TransactionType } from '../types';
import Button from './Button';
import Input from './Input';

interface TransactionFormProps {
  transaction?: Transaction | null;
  products: Product[];
  onSubmit: (data: CreateTransactionDto | UpdateTransactionDto) => void;
  loading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  products,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTransactionDto>({
    defaultValues: transaction ? {
      type: transaction.type,
      quantity: transaction.quantity,
      unitPrice: transaction.unitPrice || 0,
      totalAmount: transaction.totalAmount || 0,
      notes: transaction.notes || '',
      reference: transaction.reference || '',
      productId: transaction.productId,
      transactionDate: transaction.transactionDate ? 
        new Date(transaction.transactionDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
    } : {
      type: TransactionType.PURCHASE,
      quantity: 1,
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchedQuantity = watch('quantity');
  const watchedUnitPrice = watch('unitPrice');

  // Calculate total amount when quantity or unit price changes
  React.useEffect(() => {
    if (watchedQuantity && watchedUnitPrice) {
      setValue('totalAmount', watchedQuantity * watchedUnitPrice);
    }
  }, [watchedQuantity, watchedUnitPrice, setValue]);

  const handleFormSubmit = (data: CreateTransactionDto) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type *
          </label>
          <select
            {...register('type', { required: 'Transaction type is required' })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value={TransactionType.PURCHASE}>Purchase</option>
            <option value={TransactionType.SALE}>Sale</option>
            <option value={TransactionType.ADJUSTMENT}>Adjustment</option>
            <option value={TransactionType.RETURN}>Return</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product *
          </label>
          <select
            {...register('productId', { required: 'Product is required' })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} (SKU: {product.sku})
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Quantity *"
          type="number"
          min="1"
          {...register('quantity', { 
            required: 'Quantity is required',
            min: { value: 1, message: 'Quantity must be at least 1' }
          })}
          error={errors.quantity?.message}
        />
        
        <Input
          label="Unit Price"
          type="number"
          step="0.01"
          min="0"
          {...register('unitPrice', { 
            min: { value: 0, message: 'Unit price must be greater than 0' }
          })}
          error={errors.unitPrice?.message}
        />
        
        <Input
          label="Total Amount"
          type="number"
          step="0.01"
          min="0"
          {...register('totalAmount', { 
            min: { value: 0, message: 'Total amount must be greater than 0' }
          })}
          error={errors.totalAmount?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Reference"
          {...register('reference')}
          placeholder="Transaction reference number"
        />
        
        <Input
          label="Transaction Date *"
          type="date"
          {...register('transactionDate', { required: 'Transaction date is required' })}
          error={errors.transactionDate?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Additional notes about this transaction..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {transaction ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;

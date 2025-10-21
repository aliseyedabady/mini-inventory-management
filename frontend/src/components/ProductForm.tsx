import React from 'react';
import { useForm } from 'react-hook-form';
import { Product, CreateProductDto, UpdateProductDto, Category } from '../types';
import Button from './Button';
import Input from './Input';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSubmit: (data: CreateProductDto | UpdateProductDto) => void;
  loading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateProductDto>({
    defaultValues: product ? {
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      cost: product.cost || 0,
      unit: product.unit || '',
      categoryId: product.categoryId,
      isActive: product.isActive,
    } : {
      isActive: true,
    },
  });

  const handleFormSubmit = (data: CreateProductDto) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          {...register('name', { required: 'Product name is required' })}
          error={errors.name?.message}
        />
        
        <Input
          label="SKU *"
          {...register('sku', { required: 'SKU is required' })}
          error={errors.sku?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="Product description..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Price *"
          type="number"
          step="0.01"
          min="0"
          {...register('price', { 
            required: 'Price is required',
            min: { value: 0, message: 'Price must be greater than 0' }
          })}
          error={errors.price?.message}
        />
        
        <Input
          label="Cost"
          type="number"
          step="0.01"
          min="0"
          {...register('cost', { 
            min: { value: 0, message: 'Cost must be greater than 0' }
          })}
          error={errors.cost?.message}
        />
        
        <Input
          label="Unit"
          {...register('unit')}
          placeholder="e.g., pcs, kg, L"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category *
        </label>
        <select
          {...register('categoryId', { required: 'Category is required' })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-900">
          Active
        </label>
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
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

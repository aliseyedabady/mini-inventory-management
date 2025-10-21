import { 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsDateString, 
  Min, 
  MaxLength 
} from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}

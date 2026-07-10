import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class CreatePurchaseOrderRequest {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    example: '8b7b9f58-2a9c-4fd4-9d5f-67b6d4d7d3f9',
  })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({
    example: 20,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    example: 'MANUAL',
    enum: ['MANUAL', 'LOW_STOCK_ALERT'],
  })
  @IsString()
  @IsIn(['MANUAL', 'LOW_STOCK_ALERT'])
  source!: 'MANUAL' | 'LOW_STOCK_ALERT';

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ValidateIf(
    (obj: CreatePurchaseOrderRequest) => obj.source === 'LOW_STOCK_ALERT',
  )
  @IsUUID()
  alertId?: string;
}

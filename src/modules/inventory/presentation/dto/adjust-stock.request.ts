import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AdjustStockRequest {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  productId!: string;

  @ApiProperty({
    example: 'INCOMING',
    enum: ['INCOMING', 'OUTGOING'],
    description: 'INCOMING increases stock, OUTGOING decreases stock',
  })
  @IsString()
  @IsIn(['INCOMING', 'OUTGOING'])
  type!: 'INCOMING' | 'OUTGOING';

  @ApiProperty({
    example: 10,
  })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    example: 'Restocking from supplier',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  reason!: string;
}

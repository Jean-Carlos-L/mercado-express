import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateProductRequest {
  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: 'LAP-001',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  sku!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({
    example: '8b7b9f58-2a9c-4fd4-9d5f-67b6d4d7d3f9',
  })
  @IsUUID()
  supplierId!: string;

  @ApiProperty({
    example: 2500,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    example: 50,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  currentStock!: number;

  @ApiProperty({
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStock!: number;
}

import { ApiProperty } from '@nestjs/swagger';

export class ProductResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Laptop Dell Inspiron 15' })
  name!: string;

  @ApiProperty({ example: 'LAP-001' })
  sku!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  categoryId!: string;

  @ApiProperty({ example: '8b7b9f58-2a9c-4fd4-9d5f-67b6d4d7d3f9' })
  supplierId!: string;

  @ApiProperty({ example: 2500 })
  price!: number;

  @ApiProperty({ example: 50 })
  currentStock!: number;

  @ApiProperty({ example: 10 })
  minStock!: number;
}

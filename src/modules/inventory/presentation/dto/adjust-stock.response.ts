import { ApiProperty } from '@nestjs/swagger';

class AdjustStockProductResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 60 })
  currentStock!: number;
}

class AdjustStockTransactionResponse {
  @ApiProperty({ example: 'b1c2d3e4-f5a6-7890-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId!: string;

  @ApiProperty({ example: 10 })
  quantity!: number;

  @ApiProperty({ example: 'Restocking from supplier' })
  reason!: string;

  @ApiProperty({
    example: 'INCOMING',
    enum: ['INCOMING', 'OUTGOING'],
  })
  transactionType!: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

class AdjustStockAlertResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId!: string;

  @ApiProperty({ example: 'LOW_STOCK' })
  type!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class AdjustStockResponse {
  @ApiProperty({ type: AdjustStockProductResponse })
  product!: AdjustStockProductResponse;

  @ApiProperty({ type: AdjustStockTransactionResponse })
  transaction!: AdjustStockTransactionResponse;

  @ApiProperty({ type: AdjustStockAlertResponse, nullable: true })
  alert!: AdjustStockAlertResponse | null;
}

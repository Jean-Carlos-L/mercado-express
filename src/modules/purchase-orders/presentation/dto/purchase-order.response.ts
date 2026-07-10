import { ApiProperty } from '@nestjs/swagger';

export class PurchaseOrderResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId!: string;

  @ApiProperty({ example: 20 })
  quantity!: number;

  @ApiProperty({ example: '8b7b9f58-2a9c-4fd4-9d5f-67b6d4d7d3f9' })
  supplierId!: string;

  @ApiProperty({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'],
    description: 'Current status of the purchase order',
  })
  status!: string;

  @ApiProperty({
    example: 'MANUAL',
    enum: ['MANUAL', 'LOW_STOCK_ALERT'],
    description: 'Source that triggered the order',
  })
  source!: string;

  @ApiProperty({
    example: null,
    nullable: true,
    description:
      'Associated alert ID. Only present when source is LOW_STOCK_ALERT',
  })
  alertId!: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Reason for rejection. Only present when status is REJECTED',
  })
  rejectionReason!: string | null;
}

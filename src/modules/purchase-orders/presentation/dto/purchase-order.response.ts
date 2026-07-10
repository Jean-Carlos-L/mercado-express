import { ApiProperty } from '@nestjs/swagger';

export class PurchaseOrderResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  alertId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  rejectionReason!: string | null;
}

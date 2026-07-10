import { ApiProperty } from '@nestjs/swagger';

class AdjustStockProductResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  currentStock!: number;
}

class AdjustStockTransactionResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  transactionType!: string;

  @ApiProperty()
  createdAt!: Date;
}

class AdjustStockAlertResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
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

export interface AdjustStockDto {
  productId: string;
  type: 'INCOMING' | 'OUTGOING';
  quantity: number;
  reason: string;
}

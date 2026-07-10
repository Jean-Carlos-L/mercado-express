export interface CreatePurchaseOrderDto {
  productId: string;
  supplierId: string;
  quantity: number;
  source: 'MANUAL' | 'LOW_STOCK_ALERT';
  alertId?: string;
}

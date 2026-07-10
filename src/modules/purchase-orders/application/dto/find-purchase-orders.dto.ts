export interface FindPurchaseOrdersDto {
  productId?: string;
  supplierId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

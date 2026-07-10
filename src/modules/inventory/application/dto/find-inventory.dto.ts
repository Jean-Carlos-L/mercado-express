export interface FindInventoryDto {
  categoryId?: string;
  supplierId?: string;
  hasActiveAlert?: boolean;
  minStock?: number;
  maxStock?: number;
  page: number;
  pageSize: number;
}

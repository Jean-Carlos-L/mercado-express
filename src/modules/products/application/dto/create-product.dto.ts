export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: number;
  currentStock: number;
  minStock: number;
}

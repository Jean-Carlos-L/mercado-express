import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface ProductRepository {
  findAll(): Promise<Product[]>;

  findById(id: string): Promise<Product | null>;

  findBySku(sku: string): Promise<Product | null>;

  findByFilters(params: {
    categoryId?: string;
    supplierId?: string;
    hasActiveAlert?: boolean;
    minStock?: number;
    maxStock?: number;
    page: number;
    pageSize: number;
  }): Promise<{ data: Product[]; total: number }>;

  save(product: Product): Promise<Product>;

  update(product: Product): Promise<Product>;
}

import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface ProductRepository {
  findAll(): Promise<Product[]>;

  findBySku(sku: string): Promise<Product | null>;

  save(product: Product): Promise<Product>;

  update(product: Product): Promise<Product>;
}

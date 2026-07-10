import { Product } from '../../domain/entities/product.entity';
import { ProductResponse } from '../dto/product.response';

export class ProductPresenter {
  static toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      price: product.price,
      currentStock: product.currentStock,
      minStock: product.minStock,
    };
  }

  static toResponseList(products: Product[]): ProductResponse[] {
    return products.map((p) => ProductPresenter.toResponse(p));
  }
}

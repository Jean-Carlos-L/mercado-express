import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../../domain/entities/product.entity';

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProduct): Product {
    return Product.restore({
      id: prismaProduct.id,
      name: prismaProduct.name,
      sku: prismaProduct.sku,
      categoryId: prismaProduct.category_id,
      supplierId: prismaProduct.supplier_id,
      price: Number(prismaProduct.price),
      currentStock: prismaProduct.current_stock,
      minStock: prismaProduct.min_stock,
    });
  }

  static toPersistence(product: Product) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category_id: product.categoryId,
      supplier_id: product.supplierId,
      price: product.price,
      current_stock: product.currentStock,
      min_stock: product.minStock,
    };
  }
}

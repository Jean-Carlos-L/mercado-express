import { Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../../domain/entities/product.entity';

type PrismaProductWithRelations = PrismaProduct & {
  category?: { name: string } | null;
  supplier?: { name: string } | null;
};

export class ProductMapper {
  static toDomain(prismaProduct: PrismaProductWithRelations): Product {
    return Product.restore({
      id: prismaProduct.id,
      name: prismaProduct.name,
      sku: prismaProduct.sku,
      categoryId: prismaProduct.category_id,
      supplierId: prismaProduct.supplier_id,
      price: Number(prismaProduct.price),
      currentStock: prismaProduct.current_stock,
      minStock: prismaProduct.min_stock,
      categoryName: prismaProduct.category?.name,
      supplierName: prismaProduct.supplier?.name,
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

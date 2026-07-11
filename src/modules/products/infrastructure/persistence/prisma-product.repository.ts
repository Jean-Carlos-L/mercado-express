import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { ProductMapper } from './mappers/product.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    return products.map((p) => ProductMapper.toDomain(p));
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (!product) {
      return null;
    }

    return ProductMapper.toDomain(product);
  }

  async findByFilters(params: {
    categoryId?: string;
    supplierId?: string;
    hasActiveAlert?: boolean;
    minStock?: number;
    maxStock?: number;
    page: number;
    pageSize: number;
  }): Promise<{ data: Product[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (params.categoryId) {
      where.category_id = params.categoryId;
    }

    if (params.supplierId) {
      where.supplier_id = params.supplierId;
    }

    if (params.hasActiveAlert) {
      where.alerts = { some: { status: 'ACTIVE' } };
    }

    if (params.minStock !== undefined || params.maxStock !== undefined) {
      where.current_stock = {};
      if (params.minStock !== undefined) {
        (where.current_stock as Record<string, number>).gte = params.minStock;
      }
      if (params.maxStock !== undefined) {
        (where.current_stock as Record<string, number>).lte = params.maxStock;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true } },
          supplier: { select: { name: true } },
        },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => ProductMapper.toDomain(p)),
      total,
    };
  }

  async save(product: Product) {
    const record = await this.prisma.product.create({
      data: ProductMapper.toPersistence(product),
    });

    return ProductMapper.toDomain(record);
  }

  async update(product: Product): Promise<Product> {
    const record = await this.prisma.product.update({
      where: { id: product.id },
      data: ProductMapper.toPersistence(product),
    });
    return ProductMapper.toDomain(record);
  }
}

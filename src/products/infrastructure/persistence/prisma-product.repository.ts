import { Product } from 'src/modules/products/domain/entities/product.entity';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { ProductMapper } from 'src/modules/products/infrastructure/persistence/mappers/product.mapper';
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

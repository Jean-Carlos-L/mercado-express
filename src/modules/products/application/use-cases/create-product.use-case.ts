import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from '../../domain/repositories/product.repository';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductAlreadyExistsError } from '../../domain/errors/product-already-exists.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findBySku(dto.sku);

    if (existingProduct) {
      throw new ProductAlreadyExistsError();
    }

    const product = Product.create({
      name: dto.name,
      sku: dto.sku,
      categoryId: dto.categoryId,
      supplierId: dto.supplierId,
      price: dto.price,
      currentStock: dto.currentStock,
      minStock: dto.minStock,
    });

    await this.productRepository.save(product);

    return product;
  }
}

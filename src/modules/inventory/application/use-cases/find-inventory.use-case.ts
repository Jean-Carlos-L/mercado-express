import { Inject, Injectable } from '@nestjs/common';
import { Product } from 'src/modules/products/domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from 'src/modules/products/domain/repositories/product.repository';
import { PaginationMetadata } from 'src/shared/pagination/dto/pagination-metadata.response';
import { FindInventoryDto } from '../dto/find-inventory.dto';

@Injectable()
export class FindInventoryUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(
    dto: FindInventoryDto,
  ): Promise<{ data: Product[]; metadata: PaginationMetadata }> {
    const { page, pageSize } = dto;

    const { data, total } = await this.productRepository.findByFilters({
      categoryId: dto.categoryId,
      supplierId: dto.supplierId,
      hasActiveAlert: dto.hasActiveAlert,
      minStock: dto.minStock,
      maxStock: dto.maxStock,
      page,
      pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      metadata: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
      },
    };
  }
}

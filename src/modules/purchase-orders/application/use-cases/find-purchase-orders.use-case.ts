import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import {
  PURCHASE_ORDER_REPOSITORY,
  type PurchaseOrderRepository,
} from '../../domain/repositories/purchase-order.repository';
import { PaginationMetadata } from 'src/shared/pagination/dto/pagination-metadata.response';
import { FindPurchaseOrdersDto } from '../dto/find-purchase-orders.dto';

@Injectable()
export class FindPurchaseOrdersUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async execute(
    dto: FindPurchaseOrdersDto,
  ): Promise<{ data: PurchaseOrder[]; metadata: PaginationMetadata }> {
    const { page, pageSize } = dto;

    const { data, total } = await this.purchaseOrderRepository.findByFilters({
      productId: dto.productId,
      supplierId: dto.supplierId,
      status: dto.status,
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

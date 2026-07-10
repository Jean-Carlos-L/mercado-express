import { Inject, Injectable } from '@nestjs/common';
import { InventoryTransaction } from '../../domain/entities/inventory-transaction.entity';
import { InsufficientStockForAdjustmentError } from '../../domain/errors/insufficient-stock-for-adjustment.error';
import {
  INVENTORY_REPOSITORY,
  type InventoryRepository,
} from '../../domain/repositories/inventory.repository';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from 'src/modules/products/domain/repositories/product.repository';
import { ProductNotFoundError } from 'src/modules/products/domain/errors/product-not-found.error';
import { AdjustStockDto } from '../dto/adjust-stock.dto';

@Injectable()
export class AdjustStockUseCase {
  constructor(
    @Inject(INVENTORY_REPOSITORY)
    private readonly inventoryRepository: InventoryRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) { }

  async execute(dto: AdjustStockDto): Promise<{
    product: { id: string; currentStock: number };
    transaction: InventoryTransaction;
  }> {
    const product = await this.productRepository.findById(dto.productId);

    if (!product) {
      throw new ProductNotFoundError();
    }

    const adjustedQuantity =
      dto.type === 'INCOMING' ? +dto.quantity : -dto.quantity;

    const result = await this.inventoryRepository.adjustStock({
      productId: dto.productId,
      quantity: adjustedQuantity,
      type: dto.type,
      reason: dto.reason,
    });

    if (!result) {
      throw new InsufficientStockForAdjustmentError({
        required: dto.quantity,
        available: product.currentStock,
      });
    }

    return result;
  }
}

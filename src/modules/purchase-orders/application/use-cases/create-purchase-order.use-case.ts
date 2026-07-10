import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { AlertNotActiveError } from '../../domain/errors/alert-not-active.error';
import { AlertIdNotAllowedForManualError } from '../../domain/errors/alert-id-not-allowed-for-manual.error';
import { InvalidQuantityForOrderError } from '../../domain/errors/invalid-quantity-for-order.error';
import {
  PURCHASE_ORDER_REPOSITORY,
  type PurchaseOrderRepository,
} from '../../domain/repositories/purchase-order.repository';
import {
  PRODUCT_REPOSITORY,
  type ProductRepository,
} from 'src/modules/products/domain/repositories/product.repository';
import { ProductNotFoundError } from 'src/modules/products/domain/errors/product-not-found.error';
import {
  ALERT_REPOSITORY,
  type AlertRepository,
} from 'src/modules/inventory/domain/repositories/alert.repository';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
    @Inject(ALERT_REPOSITORY)
    private readonly alertRepository: AlertRepository,
  ) {}

  async execute(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const product = await this.productRepository.findById(dto.productId);

    if (!product) {
      throw new ProductNotFoundError();
    }

    if (dto.source === 'MANUAL' && dto.alertId) {
      throw new AlertIdNotAllowedForManualError();
    }

    if (dto.source === 'LOW_STOCK_ALERT') {
      if (!dto.alertId) {
        throw new AlertNotActiveError();
      }

      const alert = await this.alertRepository.findActiveByProductId(
        dto.productId,
      );

      if (!alert || alert.id !== dto.alertId) {
        throw new AlertNotActiveError();
      }
    }

    const minRequiredQuantity = product.minStock * 2;

    if (dto.quantity < minRequiredQuantity) {
      throw new InvalidQuantityForOrderError({
        minStock: product.minStock,
        quantity: dto.quantity,
      });
    }

    const order = PurchaseOrder.create({
      productId: dto.productId,
      quantity: dto.quantity,
      supplierId: dto.supplierId,
      source: dto.source,
      alertId: dto.alertId,
    });

    return this.purchaseOrderRepository.save(order);
  }
}

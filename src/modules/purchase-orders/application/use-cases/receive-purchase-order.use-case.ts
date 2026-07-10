import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import {
  PURCHASE_ORDER_REPOSITORY,
  type PurchaseOrderRepository,
} from '../../domain/repositories/purchase-order.repository';
import { AdjustStockUseCase } from 'src/modules/inventory/application/use-cases/adjust-stock.use-case';

@Injectable()
export class ReceivePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
    private readonly adjustStockUseCase: AdjustStockUseCase,
  ) {}

  async execute(id: string): Promise<{
    order: PurchaseOrder;
    stockAdjustment: {
      product: { id: string; currentStock: number };
      transaction: { id: string; createdAt: Date };
      alert: { id: string; status: string } | null;
    };
  }> {
    const order = await this.purchaseOrderRepository.findById(id);

    if (!order) {
      throw new PurchaseOrderNotFoundError();
    }

    if (order.status !== 'APPROVED') {
      throw new InvalidOrderStatusTransitionError({
        from: order.status,
        to: 'RECEIVED',
      });
    }

    const stockResult = await this.adjustStockUseCase.execute({
      productId: order.productId,
      type: 'INCOMING',
      quantity: order.quantity,
      reason: `Purchase order received: ${order.id}`,
    });

    const updatedOrder = await this.purchaseOrderRepository.updateStatus(
      id,
      'RECEIVED',
    );

    return {
      order: updatedOrder,
      stockAdjustment: {
        product: stockResult.product,
        transaction: {
          id: stockResult.transaction.id,
          createdAt: stockResult.transaction.createdAt,
        },
        alert: stockResult.alert
          ? { id: stockResult.alert.id, status: stockResult.alert.status }
          : null,
      },
    };
  }
}

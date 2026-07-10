import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import {
  PURCHASE_ORDER_REPOSITORY,
  type PurchaseOrderRepository,
} from '../../domain/repositories/purchase-order.repository';

@Injectable()
export class ApprovePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async execute(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);

    if (!order) {
      throw new PurchaseOrderNotFoundError();
    }

    if (order.status !== 'PENDING') {
      throw new InvalidOrderStatusTransitionError({
        from: order.status,
        to: 'APPROVED',
      });
    }

    return this.purchaseOrderRepository.updateStatus(id, 'APPROVED');
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { PurchaseOrder } from '../../domain/entities/purchase-order.entity';
import { InvalidOrderStatusTransitionError } from '../../domain/errors/invalid-order-status-transition.error';
import { PurchaseOrderNotFoundError } from '../../domain/errors/purchase-order-not-found.error';
import {
  PURCHASE_ORDER_REPOSITORY,
  type PurchaseOrderRepository,
} from '../../domain/repositories/purchase-order.repository';
import { RejectPurchaseOrderDto } from '../dto/reject-purchase-order.dto';

@Injectable()
export class RejectPurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY)
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
  ) {}

  async execute(
    id: string,
    dto: RejectPurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);

    if (!order) {
      throw new PurchaseOrderNotFoundError();
    }

    if (order.status !== 'PENDING') {
      throw new InvalidOrderStatusTransitionError({
        from: order.status,
        to: 'REJECTED',
      });
    }

    return this.purchaseOrderRepository.updateStatus(
      id,
      'REJECTED',
      dto.rejectionReason,
    );
  }
}

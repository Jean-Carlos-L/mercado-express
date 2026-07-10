import { PurchaseOrder } from 'src/modules/purchase-orders/domain/entities/purchase-order.entity';
import { PurchaseOrderResponse } from 'src/modules/purchase-orders/presentation/dto/purchase-order.response';

export class PurchaseOrderPresenter {
  static toResponse(order: PurchaseOrder): PurchaseOrderResponse {
    return {
      id: order.id,
      productId: order.productId,
      quantity: order.quantity,
      supplierId: order.supplierId,
      status: order.status,
      source: order.source,
      alertId: order.alertId,
      createdAt: order.createdAt,
      rejectionReason: order.rejectionReason,
    };
  }

  static toResponseList(orders: PurchaseOrder[]): PurchaseOrderResponse[] {
    return orders.map((o) => PurchaseOrderPresenter.toResponse(o));
  }
}

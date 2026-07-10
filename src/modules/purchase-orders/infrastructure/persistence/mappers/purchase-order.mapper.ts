import { PurchaseOrder as PrismaPurchaseOrder } from '@prisma/client';
import { PurchaseOrder } from '../../../domain/entities/purchase-order.entity';

export class PurchaseOrderMapper {
  static toDomain(prismaOrder: PrismaPurchaseOrder): PurchaseOrder {
    const rejectionReason: string | null = prismaOrder.rejection_reason;

    return PurchaseOrder.restore({
      id: prismaOrder.id,
      productId: prismaOrder.product_id,
      quantity: prismaOrder.quantity,
      supplierId: prismaOrder.supplier_id,
      status: prismaOrder.status,
      source: prismaOrder.source,
      alertId: prismaOrder.alert_id,
      createdAt: prismaOrder.created_at,
      rejectionReason,
    });
  }

  static toPersistence(order: PurchaseOrder) {
    return {
      id: order.id,
      product_id: order.productId,
      quantity: order.quantity,
      supplier_id: order.supplierId,
      status: order.status,
      source: order.source,
      alert_id: order.alertId,
      rejection_reason: order.rejectionReason,
      created_at: order.createdAt,
    };
  }
}

import { PurchaseOrder } from '../entities/purchase-order.entity';

export const PURCHASE_ORDER_REPOSITORY = 'PURCHASE_ORDER_REPOSITORY';

export interface PurchaseOrderRepository {
  save(order: PurchaseOrder): Promise<PurchaseOrder>;

  findById(id: string): Promise<PurchaseOrder | null>;

  updateStatus(
    id: string,
    status: string,
    rejectionReason?: string,
  ): Promise<PurchaseOrder>;

  findByFilters(params: {
    productId?: string;
    supplierId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: PurchaseOrder[]; total: number }>;
}

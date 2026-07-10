import { InventoryTransaction } from '../entities/inventory-transaction.entity';

export const INVENTORY_REPOSITORY = 'INVENTORY_REPOSITORY';

export interface InventoryRepository {
  adjustStock(params: {
    productId: string;
    quantity: number;
    type: 'INCOMING' | 'OUTGOING';
    reason: string;
  }): Promise<{
    product: { id: string; currentStock: number };
    transaction: InventoryTransaction;
  } | null>;
}

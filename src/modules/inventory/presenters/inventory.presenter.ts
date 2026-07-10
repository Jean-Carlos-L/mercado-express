import { InventoryTransaction } from 'src/modules/inventory/domain/entities/inventory-transaction.entity';
import { AdjustStockResponse } from 'src/modules/inventory/presentation/dto/adjust-stock.response';

export class InventoryPresenter {
  static toAdjustStockResponse(result: {
    product: { id: string; currentStock: number };
    transaction: InventoryTransaction;
  }): AdjustStockResponse {
    const product: { id: string; currentStock: number } = {
      id: result.product.id,
      currentStock: result.product.currentStock,
    };

    const transaction = {
      id: result.transaction.id,
      productId: result.transaction.productId,
      quantity: result.transaction.quantity,
      reason: result.transaction.reason,
      transactionType: result.transaction.transactionType,
      createdAt: result.transaction.createdAt,
    };

    return { product, transaction };
  }
}

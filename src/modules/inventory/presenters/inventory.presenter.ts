import { Alert } from 'src/modules/inventory/domain/entities/alert.entity';
import { InventoryTransaction } from 'src/modules/inventory/domain/entities/inventory-transaction.entity';
import { AdjustStockResponse } from 'src/modules/inventory/presentation/dto/adjust-stock.response';
import { AlertResponse } from 'src/modules/inventory/presentation/dto/alert.response';

export class InventoryPresenter {
  static toAdjustStockResponse(result: {
    product: { id: string; currentStock: number };
    transaction: InventoryTransaction;
    alert: Alert | null;
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

    const alert = result.alert
      ? {
          id: result.alert.id,
          productId: result.alert.productId,
          type: result.alert.type,
          status: result.alert.status,
        }
      : null;

    return { product, transaction, alert };
  }

  static toAlertResponse(alert: Alert): AlertResponse {
    return {
      id: alert.id,
      productId: alert.productId,
      type: alert.type,
      status: alert.status,
    };
  }

  static toAlertResponseList(alerts: Alert[]): AlertResponse[] {
    return alerts.map((a) => InventoryPresenter.toAlertResponse(a));
  }
}

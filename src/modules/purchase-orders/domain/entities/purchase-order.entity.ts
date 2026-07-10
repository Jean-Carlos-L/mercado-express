import { randomUUID } from 'crypto';

export class PurchaseOrder {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly supplierId: string,
    public readonly status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED',
    public readonly source: 'MANUAL' | 'LOW_STOCK_ALERT',
    public readonly alertId: string | null,
    public readonly createdAt: Date,
    public readonly rejectionReason: string | null,
  ) {}

  static create(props: {
    productId: string;
    quantity: number;
    supplierId: string;
    source: 'MANUAL' | 'LOW_STOCK_ALERT';
    alertId?: string;
  }): PurchaseOrder {
    return new PurchaseOrder(
      randomUUID(),
      props.productId,
      props.quantity,
      props.supplierId,
      'PENDING',
      props.source,
      props.alertId ?? null,
      new Date(),
      null,
    );
  }

  static restore(props: {
    id: string;
    productId: string;
    quantity: number;
    supplierId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';
    source: 'MANUAL' | 'LOW_STOCK_ALERT';
    alertId: string | null;
    createdAt: Date;
    rejectionReason: string | null;
  }): PurchaseOrder {
    return new PurchaseOrder(
      props.id,
      props.productId,
      props.quantity,
      props.supplierId,
      props.status,
      props.source,
      props.alertId,
      props.createdAt,
      props.rejectionReason,
    );
  }
}

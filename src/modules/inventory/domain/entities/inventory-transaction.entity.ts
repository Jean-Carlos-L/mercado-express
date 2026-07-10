import { randomUUID } from 'crypto';

export class InventoryTransaction {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reason: string,
    public readonly transactionType: 'INCOMING' | 'OUTGOING',
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    productId: string;
    quantity: number;
    reason: string;
    transactionType: 'INCOMING' | 'OUTGOING';
  }): InventoryTransaction {
    return new InventoryTransaction(
      randomUUID(),
      props.productId,
      props.quantity,
      props.reason,
      props.transactionType,
      new Date(),
    );
  }

  static restore(props: {
    id: string;
    productId: string;
    quantity: number;
    reason: string;
    transactionType: 'INCOMING' | 'OUTGOING';
    createdAt: Date;
  }): InventoryTransaction {
    return new InventoryTransaction(
      props.id,
      props.productId,
      props.quantity,
      props.reason,
      props.transactionType,
      props.createdAt,
    );
  }
}

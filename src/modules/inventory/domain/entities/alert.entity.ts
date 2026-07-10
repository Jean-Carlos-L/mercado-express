import { randomUUID } from 'crypto';

export class Alert {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly type: 'LOW_STOCK',
    public readonly status: 'ACTIVE' | 'RESOLVED',
  ) {}

  static create(props: {
    productId: string;
    type: 'LOW_STOCK';
    status?: 'ACTIVE' | 'RESOLVED';
  }): Alert {
    return new Alert(
      randomUUID(),
      props.productId,
      props.type,
      props.status ?? 'ACTIVE',
    );
  }

  static restore(props: {
    id: string;
    productId: string;
    type: 'LOW_STOCK';
    status: 'ACTIVE' | 'RESOLVED';
  }): Alert {
    return new Alert(props.id, props.productId, props.type, props.status);
  }
}

import { randomUUID } from 'crypto';

export class Supplier {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly isDeleted: boolean,
  ) {}

  static create(props: { name: string }): Supplier {
    return new Supplier(randomUUID(), props.name, false);
  }

  static restore(props: {
    id: string;
    name: string;
    isDeleted: boolean;
  }): Supplier {
    return new Supplier(props.id, props.name, props.isDeleted);
  }
}

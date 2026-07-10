import { randomUUID } from 'crypto';

export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly isDeleted: boolean,
  ) {}

  static create(props: { name: string }): Category {
    return new Category(randomUUID(), props.name, false);
  }

  static restore(props: {
    id: string;
    name: string;
    isDeleted: boolean;
  }): Category {
    return new Category(props.id, props.name, props.isDeleted);
  }
}

import { randomUUID } from 'crypto';
import { InsufficientStockError } from '../errors/insufficient-stock.error';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sku: string,
    public readonly categoryId: string,
    public readonly supplierId: string,
    public price: number,
    public currentStock: number,
    public minStock: number,
    public readonly categoryName?: string,
    public readonly supplierName?: string,
  ) {}

  static create(props: {
    name: string;
    sku: string;
    categoryId: string;
    supplierId: string;
    price: number;
    currentStock: number;
    minStock: number;
  }): Product {
    return new Product(
      randomUUID(),
      props.name,
      props.sku,
      props.categoryId,
      props.supplierId,
      props.price,
      props.currentStock,
      props.minStock,
    );
  }

  static restore(props: {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    supplierId: string;
    price: number;
    currentStock: number;
    minStock: number;
    categoryName?: string;
    supplierName?: string;
  }): Product {
    return new Product(
      props.id,
      props.name,
      props.sku,
      props.categoryId,
      props.supplierId,
      props.price,
      props.currentStock,
      props.minStock,
      props.categoryName,
      props.supplierName,
    );
  }

  increaseStock(quantity: number): void {
    this.currentStock += quantity;
  }

  decreaseStock(quantity: number): void {
    if (this.currentStock - quantity < 0) {
      throw new InsufficientStockError();
    }

    this.currentStock -= quantity;
  }

  hasLowStock(): boolean {
    return this.currentStock <= this.minStock;
  }
}

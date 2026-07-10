import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class InvalidQuantityForOrderError extends DomainException {
  code = 'INVALID_QUANTITY_FOR_ORDER';

  constructor(params: { minStock: number; quantity: number }) {
    super(
      `Quantity must be at least twice the minimum stock (${params.minStock}). Received: ${params.quantity}.`,
    );
  }
}

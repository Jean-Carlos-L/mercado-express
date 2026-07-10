import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class InsufficientStockError extends DomainException {
  code = 'INSUFFICIENT_STOCK';

  constructor() {
    super('Insufficient stock.');
  }
}

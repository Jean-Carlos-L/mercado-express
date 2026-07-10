import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class ProductNotFoundError extends DomainException {
  code = 'PRODUCT_NOT_FOUND';

  constructor() {
    super('Product not found.');
  }
}

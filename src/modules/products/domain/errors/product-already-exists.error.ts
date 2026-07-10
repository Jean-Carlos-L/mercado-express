import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class ProductAlreadyExistsError extends DomainException {
  code = 'PRODUCT_ALREADY_EXISTS';

  constructor() {
    super('Product already exists.');
  }
}

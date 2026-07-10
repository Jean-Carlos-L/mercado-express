import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class SupplierAlreadyExistsError extends DomainException {
  code = 'SUPPLIER_ALREADY_EXISTS';

  constructor() {
    super('Supplier already exists.');
  }
}

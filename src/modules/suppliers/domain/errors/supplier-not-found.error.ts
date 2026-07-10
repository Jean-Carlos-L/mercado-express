import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class SupplierNotFoundError extends DomainException {
  code = 'SUPPLIER_NOT_FOUND';

  constructor() {
    super('Supplier not found.');
  }
}

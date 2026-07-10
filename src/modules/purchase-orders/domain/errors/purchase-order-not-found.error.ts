import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class PurchaseOrderNotFoundError extends DomainException {
  code = 'PURCHASE_ORDER_NOT_FOUND';

  constructor() {
    super('Purchase order not found.');
  }
}

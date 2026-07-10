import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class InsufficientStockForAdjustmentError extends DomainException {
  code = 'INSUFFICIENT_STOCK';

  constructor(params: { required: number; available: number }) {
    const shortage = params.required - params.available;
    super(
      `Insufficient stock. Required: ${params.required}, available: ${params.available}. Shortage: ${shortage}`,
    );
  }
}

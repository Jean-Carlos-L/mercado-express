import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class InvalidOrderStatusTransitionError extends DomainException {
  code = 'INVALID_ORDER_STATUS_TRANSITION';

  constructor(params: { from: string; to: string }) {
    super(`Cannot transition from ${params.from} to ${params.to}.`);
  }
}

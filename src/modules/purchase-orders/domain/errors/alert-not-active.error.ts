import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class AlertNotActiveError extends DomainException {
  code = 'ALERT_NOT_ACTIVE';

  constructor() {
    super('The associated alert is not active.');
  }
}

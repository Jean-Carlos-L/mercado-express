import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class AlertIdNotAllowedForManualError extends DomainException {
  code = 'ALERT_ID_NOT_ALLOWED_FOR_MANUAL';

  constructor() {
    super('alertId must not be provided when source is MANUAL.');
  }
}

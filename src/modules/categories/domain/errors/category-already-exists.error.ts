import { DomainException } from 'src/shared/domain/errors/domain.exception';

export class CategoryAlreadyExistsError extends DomainException {
  code = 'CATEGORY_ALREADY_EXISTS';

  constructor() {
    super('Category already exists.');
  }
}

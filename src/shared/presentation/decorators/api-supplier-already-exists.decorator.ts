import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiSupplierAlreadyExistsError() {
  return applyDecorators(
    ApiResponse({
      status: 409,
      description: 'A supplier with the same name already exists.',
      schema: {
        example: {
          statusCode: 409,
          code: 'SUPPLIER_ALREADY_EXISTS',
          message: 'Supplier already exists.',
          method: 'POST',
          path: '/suppliers',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}

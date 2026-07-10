import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiInvalidQuantityForOrderError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description:
        'The requested quantity does not meet the minimum order requirements.',
      schema: {
        example: {
          statusCode: 400,
          code: 'INVALID_QUANTITY_FOR_ORDER',
          message:
            'Quantity must be at least twice the minimum stock (10). Received: 5.',
          method: 'POST',
          path: '/purchase-orders',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}

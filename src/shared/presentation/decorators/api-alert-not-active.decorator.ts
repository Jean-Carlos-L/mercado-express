import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiAlertNotActiveError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description:
        'The associated alert is not active or does not match the product.',
      schema: {
        example: {
          statusCode: 400,
          code: 'ALERT_NOT_ACTIVE',
          message: 'The associated alert is not active.',
          method: 'POST',
          path: '/purchase-orders',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}

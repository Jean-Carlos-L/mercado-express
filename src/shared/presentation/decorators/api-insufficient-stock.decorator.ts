import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiInsufficientStockError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Insufficient stock for the requested operation.',
      schema: {
        example: {
          statusCode: 400,
          code: 'INSUFFICIENT_STOCK',
          message:
            'Insufficient stock. Required: 20, available: 5. Shortage: 15',
          method: 'POST',
          path: '/inventory/adjustments',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}

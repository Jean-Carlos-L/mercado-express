import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiAlertIdNotAllowedForManualError() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'alertId must not be provided when source is MANUAL.',
      schema: {
        example: {
          statusCode: 400,
          code: 'ALERT_ID_NOT_ALLOWED_FOR_MANUAL',
          message: 'alertId must not be provided when source is MANUAL.',
          method: 'POST',
          path: '/purchase-orders',
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      },
    }),
  );
}

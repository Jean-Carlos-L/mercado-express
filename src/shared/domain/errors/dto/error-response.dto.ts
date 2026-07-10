import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    example: 'BAD_REQUEST',
  })
  code!: string;

  @ApiProperty({
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    example: 'GET',
  })
  method!: string;

  @ApiProperty({
    example: '/resource',
  })
  path!: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
  })
  timestamp!: string;
}

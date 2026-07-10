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
    example: 'Invalid request body',
  })
  message!: string;

  @ApiProperty({
    example: 'POST',
  })
  method!: string;

  @ApiProperty({
    example: '/products',
  })
  path!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp!: string;
}

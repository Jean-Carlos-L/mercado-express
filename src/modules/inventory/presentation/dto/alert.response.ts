import { ApiProperty } from '@nestjs/swagger';

export class AlertResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  productId!: string;

  @ApiProperty({
    example: 'LOW_STOCK',
    enum: ['LOW_STOCK'],
    description: 'Type of alert',
  })
  type!: string;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'RESOLVED'],
    description: 'Current status of the alert',
  })
  status!: string;
}

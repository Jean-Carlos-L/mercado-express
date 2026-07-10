import { ApiProperty } from '@nestjs/swagger';

export class AlertResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  productId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  status!: string;
}

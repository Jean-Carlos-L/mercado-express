import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}

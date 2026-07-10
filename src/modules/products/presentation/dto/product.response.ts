import { ApiProperty } from '@nestjs/swagger';

export class ProductResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  currentStock!: number;

  @ApiProperty()
  minStock!: number;
}

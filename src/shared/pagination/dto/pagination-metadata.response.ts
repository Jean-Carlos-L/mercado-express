import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadata {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 50 })
  pageSize!: number;

  @ApiProperty({ example: 150 })
  totalItems!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

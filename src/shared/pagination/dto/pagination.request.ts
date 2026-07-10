import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationRequest {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number (1-based)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({
    example: 50,
    default: 50,
    description: 'Number of items per page',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number = 50;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationRequest } from 'src/shared/pagination/dto/pagination.request';

export class FindInventoryRequest extends PaginationRequest {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter products that have at least one active alert',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasActiveAlert?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Filter products with currentStock >= minStock',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minStock?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Filter products with currentStock <= maxStock',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxStock?: number;
}

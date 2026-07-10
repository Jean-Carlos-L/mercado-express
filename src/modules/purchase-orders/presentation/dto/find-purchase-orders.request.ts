import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationRequest } from 'src/shared/pagination/dto/pagination.request';

export class FindPurchaseOrdersRequest extends PaginationRequest {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    example: '8b7b9f58-2a9c-4fd4-9d5f-67b6d4d7d3f9',
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'],
    description: 'Filter orders by status',
  })
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED'])
  status?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationRequest } from 'src/shared/pagination/dto/pagination.request';

export class FindAlertsRequest extends PaginationRequest {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'RESOLVED'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'RESOLVED'])
  status?: string;
}

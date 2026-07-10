import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadata } from './pagination-metadata.response';

export function PaginatedResponseType<T>(itemClass: Type<T>) {
  class PaginatedResponse {
    @ApiProperty({ type: [itemClass] })
    data!: T[];

    @ApiProperty({ type: PaginationMetadata })
    metadata!: PaginationMetadata;
  }

  return PaginatedResponse;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectPurchaseOrderRequest {
  @ApiProperty({
    example: 'Supplier cannot fulfill this order at this time.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  rejectionReason!: string;
}

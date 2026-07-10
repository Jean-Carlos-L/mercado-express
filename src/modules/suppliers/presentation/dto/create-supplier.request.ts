import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupplierRequest {
  @ApiProperty({
    example: 'Dell Technologies',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}

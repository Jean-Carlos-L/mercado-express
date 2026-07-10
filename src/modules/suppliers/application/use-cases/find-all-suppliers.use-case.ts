import { Supplier } from '../../domain/entities/supplier.entity';
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../../domain/repositories/supplier.repository';
import { Inject, Injectable } from '@nestjs/common';
import { PaginationMetadata } from 'src/shared/pagination/dto/pagination-metadata.response';

@Injectable()
export class FindAllSuppliersUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(params: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Supplier[]; metadata: PaginationMetadata }> {
    const { page, pageSize } = params;

    const { data, total } = await this.supplierRepository.findAll({
      page,
      pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      metadata: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
      },
    };
  }
}

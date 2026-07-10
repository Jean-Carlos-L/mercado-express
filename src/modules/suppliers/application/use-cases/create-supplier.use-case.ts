import { Supplier } from '../../domain/entities/supplier.entity';
import {
  SUPPLIER_REPOSITORY,
  type SupplierRepository,
} from '../../domain/repositories/supplier.repository';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { SupplierAlreadyExistsError } from '../../domain/errors/supplier-already-exists.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async execute(dto: CreateSupplierDto): Promise<Supplier> {
    const existingSupplier = await this.supplierRepository.findByName(dto.name);

    if (existingSupplier) {
      throw new SupplierAlreadyExistsError();
    }

    const supplier = Supplier.create({ name: dto.name });

    await this.supplierRepository.save(supplier);

    return supplier;
  }
}

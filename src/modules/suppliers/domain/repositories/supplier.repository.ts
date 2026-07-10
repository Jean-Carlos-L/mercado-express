import { Supplier } from '../entities/supplier.entity';

export const SUPPLIER_REPOSITORY = 'SUPPLIER_REPOSITORY';

export interface SupplierRepository {
  findAll(params: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Supplier[]; total: number }>;

  findByName(name: string): Promise<Supplier | null>;

  save(supplier: Supplier): Promise<Supplier>;
}

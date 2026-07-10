import { Supplier } from '../../domain/entities/supplier.entity';
import { SupplierResponse } from '../dto/supplier.response';

export class SupplierPresenter {
  static toResponse(supplier: Supplier): SupplierResponse {
    return {
      id: supplier.id,
      name: supplier.name,
    };
  }

  static toResponseList(suppliers: Supplier[]): SupplierResponse[] {
    return suppliers.map((s) => SupplierPresenter.toResponse(s));
  }
}

import { Supplier as PrismaSupplier } from '@prisma/client';
import { Supplier } from '../../../domain/entities/supplier.entity';

export class SupplierMapper {
  static toDomain(prismaSupplier: PrismaSupplier): Supplier {
    return Supplier.restore({
      id: prismaSupplier.id,
      name: prismaSupplier.name,
      isDeleted: prismaSupplier.is_deleted,
    });
  }

  static toPersistence(supplier: Supplier) {
    return {
      id: supplier.id,
      name: supplier.name,
      is_deleted: supplier.isDeleted,
    };
  }
}

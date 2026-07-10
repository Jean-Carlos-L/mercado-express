import { Supplier } from 'src/modules/suppliers/domain/entities/supplier.entity';
import { SupplierRepository } from 'src/modules/suppliers/domain/repositories/supplier.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { SupplierMapper } from './mappers/supplier.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Supplier[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where: { is_deleted: false },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({
        where: { is_deleted: false },
      }),
    ]);

    return {
      data: suppliers.map((s) => SupplierMapper.toDomain(s)),
      total,
    };
  }

  async findByName(name: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findFirst({
      where: { name, is_deleted: false },
    });

    if (!supplier) {
      return null;
    }

    return SupplierMapper.toDomain(supplier);
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const record = await this.prisma.supplier.create({
      data: SupplierMapper.toPersistence(supplier),
    });

    return SupplierMapper.toDomain(record);
  }
}

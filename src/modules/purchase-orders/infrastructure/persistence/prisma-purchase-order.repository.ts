import { PurchaseOrder } from 'src/modules/purchase-orders/domain/entities/purchase-order.entity';
import { PurchaseOrderRepository } from 'src/modules/purchase-orders/domain/repositories/purchase-order.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { PurchaseOrderMapper } from './mappers/purchase-order.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaPurchaseOrderRepository implements PurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: PurchaseOrder): Promise<PurchaseOrder> {
    const record = await this.prisma.purchaseOrder.create({
      data: PurchaseOrderMapper.toPersistence(order),
    });

    return PurchaseOrderMapper.toDomain(record);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const record = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return PurchaseOrderMapper.toDomain(record);
  }

  async updateStatus(
    id: string,
    status: string,
    rejectionReason?: string,
  ): Promise<PurchaseOrder> {
    const record = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED',
        ...(rejectionReason !== undefined && {
          rejection_reason: rejectionReason,
        }),
      },
    });

    return PurchaseOrderMapper.toDomain(record);
  }

  async findByFilters(params: {
    productId?: string;
    supplierId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const { productId, supplierId, status, page, pageSize } = params;

    const where: Record<string, unknown> = {};

    if (productId) {
      where.product_id = productId;
    }

    if (supplierId) {
      where.supplier_id = supplierId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: orders.map((o) => PurchaseOrderMapper.toDomain(o)),
      total,
    };
  }
}

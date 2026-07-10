import { AlertRepository } from 'src/modules/inventory/domain/repositories/alert.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { AlertMapper } from './mappers/alert.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaAlertRepository implements AlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByProductId(productId: string) {
    const alert = await this.prisma.alert.findFirst({
      where: {
        product_id: productId,
        status: 'ACTIVE',
        type: 'LOW_STOCK',
      },
    });

    if (!alert) {
      return null;
    }

    return AlertMapper.toDomain(alert);
  }

  async findByFilters(params: {
    productId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const { productId, status, page, pageSize } = params;

    const where: Record<string, unknown> = {};

    if (productId) {
      where.product_id = productId;
    }

    if (status) {
      where.status = status;
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      data: alerts.map((a) => AlertMapper.toDomain(a)),
      total,
    };
  }
}

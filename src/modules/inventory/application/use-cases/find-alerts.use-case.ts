import { Inject, Injectable } from '@nestjs/common';
import { Alert } from '../../domain/entities/alert.entity';
import {
  ALERT_REPOSITORY,
  type AlertRepository,
} from '../../domain/repositories/alert.repository';
import { PaginationMetadata } from 'src/shared/pagination/dto/pagination-metadata.response';
import { FindAlertsDto } from '../dto/find-alerts.dto';

@Injectable()
export class FindAlertsUseCase {
  constructor(
    @Inject(ALERT_REPOSITORY)
    private readonly alertRepository: AlertRepository,
  ) {}

  async execute(
    dto: FindAlertsDto,
  ): Promise<{ data: Alert[]; metadata: PaginationMetadata }> {
    const { page, pageSize } = dto;

    const { data, total } = await this.alertRepository.findByFilters({
      productId: dto.productId,
      status: dto.status,
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

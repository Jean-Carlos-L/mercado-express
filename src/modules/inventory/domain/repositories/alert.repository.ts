import { Alert } from '../entities/alert.entity';

export const ALERT_REPOSITORY = 'ALERT_REPOSITORY';

export interface AlertRepository {
  findActiveByProductId(productId: string): Promise<Alert | null>;

  findByFilters(params: {
    productId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }): Promise<{ data: Alert[]; total: number }>;
}

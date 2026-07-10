import { Alert as PrismaAlert } from '@prisma/client';
import { Alert } from '../../../domain/entities/alert.entity';

export class AlertMapper {
  static toDomain(prismaAlert: PrismaAlert): Alert {
    return Alert.restore({
      id: prismaAlert.id,
      productId: prismaAlert.product_id,
      type: prismaAlert.type,
      status: prismaAlert.status,
    });
  }
}

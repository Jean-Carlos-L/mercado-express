import { Category as PrismaCategory } from '@prisma/client';
import { Category } from '../../../domain/entities/category.entity';

export class CategoryMapper {
  static toDomain(prismaCategory: PrismaCategory): Category {
    return Category.restore({
      id: prismaCategory.id,
      name: prismaCategory.name,
      isDeleted: prismaCategory.is_deleted,
    });
  }

  static toPersistence(category: Category) {
    return {
      id: category.id,
      name: category.name,
      is_deleted: category.isDeleted,
    };
  }
}

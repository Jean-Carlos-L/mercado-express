import { Category } from 'src/modules/categories/domain/entities/category.entity';
import { CategoryRepository } from 'src/modules/categories/domain/repositories/category.repository';
import { PrismaService } from 'src/shared/database/prisma.service';
import { CategoryMapper } from './mappers/category.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Category[]; total: number }> {
    const skip = (page - 1) * pageSize;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: { is_deleted: false },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({
        where: { is_deleted: false },
      }),
    ]);

    return {
      data: categories.map((c) => CategoryMapper.toDomain(c)),
      total,
    };
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findFirst({
      where: { name, is_deleted: false },
    });

    if (!category) {
      return null;
    }

    return CategoryMapper.toDomain(category);
  }

  async save(category: Category): Promise<Category> {
    const record = await this.prisma.category.create({
      data: CategoryMapper.toPersistence(category),
    });

    return CategoryMapper.toDomain(record);
  }
}

import { Category } from '../entities/category.entity';

export const CATEGORY_REPOSITORY = 'CATEGORY_REPOSITORY';

export interface CategoryRepository {
  findAll(params: {
    page: number;
    pageSize: number;
  }): Promise<{ data: Category[]; total: number }>;

  findByName(name: string): Promise<Category | null>;

  save(category: Category): Promise<Category>;
}

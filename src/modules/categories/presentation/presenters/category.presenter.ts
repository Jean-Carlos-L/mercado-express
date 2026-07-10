import { Category } from '../../domain/entities/category.entity';
import { CategoryResponse } from '../dto/category.response';

export class CategoryPresenter {
  static toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
    };
  }

  static toResponseList(categories: Category[]): CategoryResponse[] {
    return categories.map((c) => CategoryPresenter.toResponse(c));
  }
}

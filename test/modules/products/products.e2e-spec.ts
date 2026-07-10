import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../../helpers/test-app.helper';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
} from '../../helpers/test-database.helper';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /products', () => {
    it('should create a product', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();

      const response = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          sku: 'SKU-TEST-001',
          categoryId: category.id,
          supplierId: supplier.id,
          price: 25.5,
          currentStock: 50,
          minStock: 10,
        })
        .expect(201);

      expect(response.body.name).toBe('Test Product');
      expect(response.body.sku).toBe('SKU-TEST-001');
      expect(response.body.price).toBe(25.5);
    });

    it('should return 409 when SKU already exists', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product 1',
          sku: 'DUPLICATE-SKU',
          categoryId: category.id,
          supplierId: supplier.id,
          price: 10,
          currentStock: 5,
          minStock: 1,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product 2',
          sku: 'DUPLICATE-SKU',
          categoryId: category.id,
          supplierId: supplier.id,
          price: 20,
          currentStock: 10,
          minStock: 2,
        })
        .expect(409);

      expect(response.body.code).toBe('PRODUCT_ALREADY_EXISTS');
    });

    it('should return 400 for invalid body', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'ab',
          sku: 'NO',
        })
        .expect(400);
    });
  });
});

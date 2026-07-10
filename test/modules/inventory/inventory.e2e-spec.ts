import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from '../../helpers/test-app.helper';
import {
  cleanDatabase,
  seedCategory,
  seedSupplier,
  seedProduct,
  seedAlert,
} from '../../helpers/test-database.helper';

describe('Inventory (e2e)', () => {
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

  describe('POST /inventory/adjustments', () => {
    it('should create INCOMING adjustment and increase stock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 10,
      });

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: product.id,
          type: 'INCOMING',
          quantity: 5,
          reason: 'Restock from supplier',
        })
        .expect(200);

      expect(response.body.product.currentStock).toBe(15);
      expect(response.body.transaction.quantity).toBe(5);
      expect(response.body.transaction.transactionType).toBe('INCOMING');
    });

    it('should create OUTGOING adjustment and decrease stock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 20,
      });

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: product.id,
          type: 'OUTGOING',
          quantity: 5,
          reason: 'Customer sale',
        })
        .expect(200);

      expect(response.body.product.currentStock).toBe(15);
      expect(response.body.transaction.quantity).toBe(-5);
    });

    it('should return 400 when OUTGOING would result in negative stock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 3,
      });

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: product.id,
          type: 'OUTGOING',
          quantity: 5,
          reason: 'Sale',
        })
        .expect(400);

      expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    });

    it('should return 404 when product does not exist', async () => {
      await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: '00000000-0000-0000-0000-000000000000',
          type: 'INCOMING',
          quantity: 5,
          reason: 'Restock',
        })
        .expect(404);
    });

    it('should create LOW_STOCK alert when stock drops below minStock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 7,
        minStock: 5,
      });

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: product.id,
          type: 'OUTGOING',
          quantity: 3,
          reason: 'Sale',
        })
        .expect(200);

      expect(response.body.alert).not.toBeNull();
      expect(response.body.alert.status).toBe('ACTIVE');
      expect(response.body.alert.type).toBe('LOW_STOCK');
    });

    it('should resolve alert when INCOMING brings stock above minStock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 3,
        minStock: 5,
      });
      const alert = await seedAlert({
        productId: product.id,
        status: 'ACTIVE',
      });

      const response = await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: product.id,
          type: 'INCOMING',
          quantity: 10,
          reason: 'Restock',
        })
        .expect(200);

      expect(response.body.alert).not.toBeNull();
      expect(response.body.alert.status).toBe('RESOLVED');
      expect(response.body.alert.id).toBe(alert.id);
    });

    it('should return 400 for invalid body', async () => {
      await request(app.getHttpServer())
        .post('/inventory/adjustments')
        .send({
          productId: 'invalid',
          type: 'INVALID',
          quantity: -1,
        })
        .expect(400);
    });
  });

  describe('GET /inventory', () => {
    it('should return paginated inventory', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });

      const response = await request(app.getHttpServer())
        .get('/inventory')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.metadata).toBeDefined();
    });
  });

  describe('GET /inventory/alerts', () => {
    it('should return paginated alerts', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      await seedAlert({ productId: product.id, status: 'ACTIVE' });

      const response = await request(app.getHttpServer())
        .get('/inventory/alerts')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('ACTIVE');
    });
  });
});

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
  seedPurchaseOrder,
} from '../../helpers/test-database.helper';

describe('Purchase Orders (e2e)', () => {
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

  describe('POST /purchase-orders', () => {
    it('should create a MANUAL purchase order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        minStock: 5,
      });

      const response = await request(app.getHttpServer())
        .post('/purchase-orders')
        .send({
          productId: product.id,
          supplierId: supplier.id,
          quantity: 20,
          source: 'MANUAL',
        })
        .expect(201);

      expect(response.body.status).toBe('PENDING');
      expect(response.body.source).toBe('MANUAL');
      expect(response.body.quantity).toBe(20);
    });

    it('should return 400 when quantity is less than 2x minStock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        minStock: 10,
      });

      const response = await request(app.getHttpServer())
        .post('/purchase-orders')
        .send({
          productId: product.id,
          supplierId: supplier.id,
          quantity: 19,
          source: 'MANUAL',
        })
        .expect(400);

      expect(response.body.code).toBe('INVALID_QUANTITY_FOR_ORDER');
    });

    it('should allow order when quantity equals exactly 2x minStock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        minStock: 10,
      });

      await request(app.getHttpServer())
        .post('/purchase-orders')
        .send({
          productId: product.id,
          supplierId: supplier.id,
          quantity: 20,
          source: 'MANUAL',
        })
        .expect(201);
    });

    it('should return 400 when MANUAL source includes alertId', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        minStock: 5,
      });

      const response = await request(app.getHttpServer())
        .post('/purchase-orders')
        .send({
          productId: product.id,
          supplierId: supplier.id,
          quantity: 20,
          source: 'MANUAL',
          alertId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);

      expect(response.body.code).toBe('ALERT_ID_NOT_ALLOWED_FOR_MANUAL');
    });

    it('should return 404 when product does not exist', async () => {
      const supplier = await seedSupplier();

      await request(app.getHttpServer())
        .post('/purchase-orders')
        .send({
          productId: '00000000-0000-0000-0000-000000000000',
          supplierId: supplier.id,
          quantity: 20,
          source: 'MANUAL',
        })
        .expect(404);
    });
  });

  describe('PATCH /purchase-orders/:id/approve', () => {
    it('should approve a PENDING order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/approve`)
        .expect(200);

      expect(response.body.status).toBe('APPROVED');
    });

    it('should return 400 when approving a non-PENDING order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'APPROVED',
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/approve`)
        .expect(400);

      expect(response.body.code).toBe('INVALID_ORDER_STATUS_TRANSITION');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .patch('/purchase-orders/00000000-0000-0000-0000-000000000000/approve')
        .expect(404);
    });
  });

  describe('PATCH /purchase-orders/:id/reject', () => {
    it('should reject a PENDING order with reason', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/reject`)
        .send({ rejectionReason: 'Too expensive' })
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
      expect(response.body.rejectionReason).toBe('Too expensive');
    });

    it('should return 400 when rejecting a non-PENDING order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'REJECTED',
      });

      await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/reject`)
        .send({ rejectionReason: 'Already rejected' })
        .expect(400);
    });
  });

  describe('PATCH /purchase-orders/:id/receive', () => {
    it('should receive an APPROVED order and update stock', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
        currentStock: 10,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'APPROVED',
        quantity: 20,
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/receive`)
        .expect(200);

      expect(response.body.order.status).toBe('RECEIVED');
      expect(response.body.stockAdjustment.product.currentStock).toBe(30);
    });

    it('should resolve alert when receiving brings stock above minStock', async () => {
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
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'APPROVED',
        quantity: 20,
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/receive`)
        .expect(200);

      expect(response.body.stockAdjustment.alert).not.toBeNull();
      expect(response.body.stockAdjustment.alert.status).toBe('RESOLVED');
    });

    it('should return 400 when receiving a non-APPROVED order', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      const order = await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });

      const response = await request(app.getHttpServer())
        .patch(`/purchase-orders/${order.id}/receive`)
        .expect(400);

      expect(response.body.code).toBe('INVALID_ORDER_STATUS_TRANSITION');
    });
  });

  describe('GET /purchase-orders', () => {
    it('should return paginated purchase orders', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
      });

      const response = await request(app.getHttpServer())
        .get('/purchase-orders')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.metadata).toBeDefined();
    });

    it('should filter by status', async () => {
      const category = await seedCategory();
      const supplier = await seedSupplier();
      const product = await seedProduct({
        categoryId: category.id,
        supplierId: supplier.id,
      });
      await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'PENDING',
      });
      await seedPurchaseOrder({
        productId: product.id,
        supplierId: supplier.id,
        status: 'APPROVED',
      });

      const response = await request(app.getHttpServer())
        .get('/purchase-orders?status=APPROVED')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('APPROVED');
    });
  });
});

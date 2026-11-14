# Reporte de Casos de Prueba — Suite E2E

**Proyecto:** Mercado Express · **Commit:** `0f8745c` · **Fecha:** 2026-11-14
**Comando ejecutado:** `npm run test:e2e -- --verbose`
**Resultado global:** 4 suites, 28 casos, **4 PASS / 24 FAIL**.

> 23 fallos se deben a F-01 (helpers de seed con UUID como `text`); 1 fallo es una expectativa obsoleta en `test/app.e2e-spec.ts` (F-03).

---

## 1. Matriz de Casos de Prueba

### 1.1 `test/app.e2e-spec.ts` (1 caso)

#### TC-E-001 · Endpoint raíz GET /

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-001` — `AppController (e2e) › / (GET)` |
| **2. Precondiciones** | Aplicación Nest creada desde `AppModule` en `beforeEach` (sin `ValidationPipe` ni `GlobalExceptionFilter` globales); BD de test disponible por la inicialización de módulos. |
| **3. Datos de Entrada** | `GET /` sin body ni query. |
| **4. Pasos** | 1. Crear la app de prueba.<br>2. `request(app.getHttpServer()).get('/')`.<br>3. Verificar status 200 y body. |
| **5. Resultado Esperado** | HTTP 200 y body exactamente `'Hello World!'`. |
| **6. Resultado Obtenido** | FAIL. HTTP 200, pero el body real es `{"message":"Welcome to the Inventory Management System API!","version":"1.0.0","timestamp":"2026-11-14T21:12:18.278Z"}`. |
| **7. Estado Final** | `FAIL` |

### 1.2 `test/modules/products/products.e2e-spec.ts` (3 casos)

#### TC-E-002 · Crear producto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-002` — `Products (e2e) › POST /products › should create a product` |
| **2. Precondiciones** | `createTestApp()` con `AppModule`, `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) y `GlobalExceptionFilter`; `cleanDatabase()`; categoría y proveedor sembrados. |
| **3. Datos de Entrada** | `{ name: 'Test Product', sku: 'SKU-TEST-001', categoryId, supplierId, price: 25.5, currentStock: 50, minStock: 10 }` |
| **4. Pasos** | 1. Sembrar categoría y proveedor.<br>2. `POST /products` con el payload.<br>3. Verificar status 201 y campos. |
| **5. Resultado Esperado** | 201; `name`, `sku` y `price` iguales a la entrada. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory` (`test/helpers/test-database.helper.ts:20`); la petición HTTP no se ejecuta. |
| **7. Estado Final** | `FAIL` |

#### TC-E-003 · SKU duplicado retorna 409

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-003` — `Products (e2e) › POST /products › should return 409 when SKU already exists` |
| **2. Precondiciones** | BD limpia; categoría y proveedor sembrados. |
| **3. Datos de Entrada** | Primer POST: `{ name: 'Product 1', sku: 'DUPLICATE-SKU', categoryId, supplierId, price: 10, currentStock: 5, minStock: 1 }`. Segundo POST: `{ name: 'Product 2', sku: 'DUPLICATE-SKU', ... price: 20, currentStock: 10, minStock: 2 }`. |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear el primer producto (201).<br>3. Repetir con el mismo SKU.<br>4. Verificar 409 y código. |
| **5. Resultado Esperado** | Segundo POST: 409 con `code: 'PRODUCT_ALREADY_EXISTS'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-004 · Body inválido retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-004` — `Products (e2e) › POST /products › should return 400 for invalid body` |
| **2. Precondiciones** | App de prueba inicializada; no requiere seeds. |
| **3. Datos de Entrada** | `{ name: 'ab', sku: 'NO' }` |
| **4. Pasos** | 1. `POST /products` con payload inválido.<br>2. Verificar status. |
| **5. Resultado Esperado** | 400 por validación (`name` mínimo 3, `sku` mínimo 6 y campos faltantes). |
| **6. Resultado Obtenido** | PASS. La validación se ejecutó y devolvió 400. |
| **7. Estado Final** | `PASS` |

### 1.3 `test/modules/purchase-orders/purchase-orders.e2e-spec.ts` (15 casos)

#### TC-E-005 · Crear orden MANUAL

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-005` — `Purchase Orders (e2e) › POST /purchase-orders › should create a MANUAL purchase order` |
| **2. Precondiciones** | BD limpia; categoría, proveedor y producto con `minStock: 5` sembrados. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. `POST /purchase-orders`.<br>3. Verificar status y body. |
| **5. Resultado Esperado** | 201; `status: 'PENDING'`, `source: 'MANUAL'`, `quantity: 20`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-006 · Cantidad menor a 2× minStock retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-006` — `Purchase Orders (e2e) › POST /purchase-orders › should return 400 when quantity is less than 2x minStock` |
| **2. Precondiciones** | Producto con `minStock: 10`. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 19, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear orden.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | 400 con `code: 'INVALID_QUANTITY_FOR_ORDER'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-007 · Cantidad exactamente 2× minStock es aceptada

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-007` — `Purchase Orders (e2e) › POST /purchase-orders › should allow order when quantity equals exactly 2x minStock` |
| **2. Precondiciones** | Producto con `minStock: 10`. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear orden.<br>3. Verificar status. |
| **5. Resultado Esperado** | 201. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-008 · MANUAL con alertId retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-008` — `Purchase Orders (e2e) › POST /purchase-orders › should return 400 when MANUAL source includes alertId` |
| **2. Precondiciones** | Producto `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 20, source: 'MANUAL', alertId: '00000000-0000-0000-0000-000000000000' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear orden.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | 400 con `code: 'ALERT_ID_NOT_ALLOWED_FOR_MANUAL'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-009 · Producto inexistente retorna 404

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-009` — `Purchase Orders (e2e) › POST /purchase-orders › should return 404 when product does not exist` |
| **2. Precondiciones** | BD limpia; **solo** proveedor sembrado. |
| **3. Datos de Entrada** | `{ productId: '00000000-0000-0000-0000-000000000000', supplierId, quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar proveedor.<br>2. Crear orden con producto inexistente.<br>3. Verificar status. |
| **5. Resultado Esperado** | 404 (`PRODUCT_NOT_FOUND`). |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedSupplier` (`test/helpers/test-database.helper.ts:35`). |
| **7. Estado Final** | `FAIL` |

#### TC-E-010 · Aprobar orden PENDING

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-010` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/approve › should approve a PENDING order` |
| **2. Precondiciones** | Producto y orden `PENDING` sembrados. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/approve` sin body. |
| **4. Pasos** | 1. Sembrar datos.<br>2. Aprobar.<br>3. Verificar status. |
| **5. Resultado Esperado** | 200 con `status: 'APPROVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-011 · Aprobar orden no PENDING retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-011` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/approve › should return 400 when approving a non-PENDING order` |
| **2. Precondiciones** | Orden sembrada en estado `APPROVED`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/approve` |
| **4. Pasos** | 1. Sembrar orden APPROVED.<br>2. Intentar aprobar.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | 400 con `code: 'INVALID_ORDER_STATUS_TRANSITION'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-012 · Aprobar orden inexistente retorna 404

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-012` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/approve › should return 404 for non-existent order` |
| **2. Precondiciones** | BD limpia; sin seeds. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/00000000-0000-0000-0000-000000000000/approve` |
| **4. Pasos** | 1. Enviar PATCH con UUID inexistente.<br>2. Verificar status. |
| **5. Resultado Esperado** | 404. |
| **6. Resultado Obtenido** | PASS. Devolvió 404. |
| **7. Estado Final** | `PASS` |

#### TC-E-013 · Rechazar orden PENDING con motivo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-013` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/reject › should reject a PENDING order with reason` |
| **2. Precondiciones** | Orden `PENDING` sembrada. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/reject` con `{ rejectionReason: 'Too expensive' }` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Rechazar.<br>3. Verificar estado y motivo. |
| **5. Resultado Esperado** | 200; `status: 'REJECTED'` y `rejectionReason: 'Too expensive'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-014 · Rechazar orden no PENDING retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-014` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/reject › should return 400 when rejecting a non-PENDING order` |
| **2. Precondiciones** | Orden sembrada en estado `REJECTED`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/reject` con `{ rejectionReason: 'Already rejected' }` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Intentar rechazar.<br>3. Verificar status. |
| **5. Resultado Esperado** | 400. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-015 · Recibir orden APPROVED actualiza stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-015` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/receive › should receive an APPROVED order and update stock` |
| **2. Precondiciones** | Producto con `currentStock: 10`; orden `APPROVED` con `quantity: 20`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/receive` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Recibir orden.<br>3. Verificar estado y stock. |
| **5. Resultado Esperado** | 200; `order.status: 'RECEIVED'` y `stockAdjustment.product.currentStock: 30`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-016 · Recibir orden resuelve alerta activa

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-016` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/receive › should resolve alert when receiving brings stock above minStock` |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`; alerta `ACTIVE`; orden `APPROVED` con `quantity: 20`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/receive` |
| **4. Pasos** | 1. Sembrar producto, alerta y orden.<br>2. Recibir.<br>3. Verificar alerta. |
| **5. Resultado Esperado** | 200; `stockAdjustment.alert` no nulo con `status: 'RESOLVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-017 · Recibir orden no APPROVED retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-017` — `Purchase Orders (e2e) › PATCH /purchase-orders/:id/receive › should return 400 when receiving a non-APPROVED order` |
| **2. Precondiciones** | Orden `PENDING`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/receive` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Intentar recibir.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | 400 con `code: 'INVALID_ORDER_STATUS_TRANSITION'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-018 · Listado paginado de órdenes

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-018` — `Purchase Orders (e2e) › GET /purchase-orders › should return paginated purchase orders` |
| **2. Precondiciones** | Una orden sembrada. |
| **3. Datos de Entrada** | `GET /purchase-orders` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Consultar listado.<br>3. Verificar `data` y `metadata`. |
| **5. Resultado Esperado** | 200; `data.length === 1` y `metadata` definido. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-019 · Filtrado de órdenes por estado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-019` — `Purchase Orders (e2e) › GET /purchase-orders › should filter by status` |
| **2. Precondiciones** | Una orden `PENDING` y una `APPROVED`. |
| **3. Datos de Entrada** | `GET /purchase-orders?status=APPROVED` |
| **4. Pasos** | 1. Sembrar órdenes.<br>2. Consultar con filtro.<br>3. Verificar resultado. |
| **5. Resultado Esperado** | 200; `data.length === 1` y `data[0].status === 'APPROVED'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

### 1.4 `test/modules/inventory/inventory.e2e-spec.ts` (9 casos)

#### TC-E-020 · Ajuste INCOMING incrementa stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-020` — `Inventory (e2e) › POST /inventory/adjustments › should create INCOMING adjustment and increase stock` |
| **2. Precondiciones** | Producto con `currentStock: 10`. |
| **3. Datos de Entrada** | `{ productId, type: 'INCOMING', quantity: 5, reason: 'Restock from supplier' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. `POST /inventory/adjustments`.<br>3. Verificar stock y transacción. |
| **5. Resultado Esperado** | 200; `product.currentStock: 15`, `transaction.quantity: 5`, `transactionType: 'INCOMING'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-021 · Ajuste OUTGOING decrementa stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-021` — `Inventory (e2e) › POST /inventory/adjustments › should create OUTGOING adjustment and decrease stock` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `{ productId, type: 'OUTGOING', quantity: 5, reason: 'Customer sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ajustar.<br>3. Verificar. |
| **5. Resultado Esperado** | 200; stock 15 y `transaction.quantity: -5`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-022 · OUTGOING con stock insuficiente retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-022` — `Inventory (e2e) › POST /inventory/adjustments › should return 400 when OUTGOING would result in negative stock` |
| **2. Precondiciones** | Producto con `currentStock: 3`. |
| **3. Datos de Entrada** | `{ productId, type: 'OUTGOING', quantity: 5, reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ajustar.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | 400 con `code: 'INSUFFICIENT_STOCK'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-023 · Producto inexistente en ajuste retorna 404

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-023` — `Inventory (e2e) › POST /inventory/adjustments › should return 404 when product does not exist` |
| **2. Precondiciones** | BD limpia; sin seeds. |
| **3. Datos de Entrada** | `{ productId: '00000000-0000-0000-0000-000000000000', type: 'INCOMING', quantity: 5, reason: 'Restock' }` |
| **4. Pasos** | 1. Enviar ajuste con UUID inexistente.<br>2. Verificar status. |
| **5. Resultado Esperado** | 404. |
| **6. Resultado Obtenido** | PASS. Devolvió 404. |
| **7. Estado Final** | `PASS` |

#### TC-E-024 · OUTGOING crea alerta LOW_STOCK

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-024` — `Inventory (e2e) › POST /inventory/adjustments › should create LOW_STOCK alert when stock drops below minStock` |
| **2. Precondiciones** | Producto `currentStock: 7`, `minStock: 5`; sin alerta activa. |
| **3. Datos de Entrada** | `{ productId, type: 'OUTGOING', quantity: 3, reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ajustar.<br>3. Verificar alerta. |
| **5. Resultado Esperado** | 200; `alert` no nula, `status: 'ACTIVE'`, `type: 'LOW_STOCK'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-025 · INCOMING resuelve alerta activa

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-025` — `Inventory (e2e) › POST /inventory/adjustments › should resolve alert when INCOMING brings stock above minStock` |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`; alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `{ productId, type: 'INCOMING', quantity: 10, reason: 'Restock' }` |
| **4. Pasos** | 1. Sembrar producto y alerta.<br>2. Ajustar.<br>3. Verificar alerta. |
| **5. Resultado Esperado** | 200; `alert.status: 'RESOLVED'` y mismo `id` de la alerta sembrada. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-026 · Body inválido en ajuste retorna 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-026` — `Inventory (e2e) › POST /inventory/adjustments › should return 400 for invalid body` |
| **2. Precondiciones** | App de prueba inicializada; no requiere seeds. |
| **3. Datos de Entrada** | `{ productId: 'invalid', type: 'INVALID', quantity: -1 }` |
| **4. Pasos** | 1. Enviar payload inválido.<br>2. Verificar status. |
| **5. Resultado Esperado** | 400 por validación (`IsUUID`, `IsIn`, `IsPositive`). |
| **6. Resultado Obtenido** | PASS. Devolvió 400. |
| **7. Estado Final** | `PASS` |

#### TC-E-027 · Listado paginado de inventario

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-027` — `Inventory (e2e) › GET /inventory › should return paginated inventory` |
| **2. Precondiciones** | Un producto sembrado. |
| **3. Datos de Entrada** | `GET /inventory` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Consultar.<br>3. Verificar `data` y `metadata`. |
| **5. Resultado Esperado** | 200; `data.length === 1` y `metadata` definido. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

#### TC-E-028 · Listado paginado de alertas

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-E-028` — `Inventory (e2e) › GET /inventory/alerts › should return paginated alerts` |
| **2. Precondiciones** | Producto con una alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `GET /inventory/alerts` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Consultar.<br>3. Verificar. |
| **5. Resultado Esperado** | 200; `data.length === 1` y `data[0].status === 'ACTIVE'`. |
| **6. Resultado Obtenido** | FAIL. `42804` en `seedCategory:20`. |
| **7. Estado Final** | `FAIL` |

---

## 2. Hallazgos Reproducibles y Evidencias

### F-03 (Alta) · Expectativa obsoleta en el smoke test raíz

- **Descripción:** `test/app.e2e-spec.ts:23` espera el string `'Hello World!'`, pero `AppService.getHello()` (`src/app.service.ts:5-11`) devuelve `{ message, version, timestamp }`. La prueba falla siempre desde que se cambió el endpoint raíz.
- **Severidad:** Alta (falso negativo permanente en la suite E2E; prueba de humo inútil).
- **Pasos para reproducirlo:**
  1. `npm run test:e2e -- --verbose`.
  2. Observar el fallo de `TC-E-001`.
  3. Alternativamente: `GET /` contra la app y comparar con el body esperado.
- **Evidencia visual sugerida:**
  1. Captura de la consola con `expected 'Hello World!' response body, got '{"message":"Welcome...'`.
  2. Captura de `src/app.service.ts:5-11` mostrando el objeto real.
  3. Captura de Postman/Swagger con `GET /` y el JSON de respuesta.
- **Logs de ejecución:**
  ```text
  ● AppController (e2e) › / (GET)

    expected 'Hello World!' response body, got
    '{"message":"Welcome to the Inventory Management System API!","version":"1.0.0","timestamp":"2026-11-14T21:12:18.278Z"}'

       21 |       .get('/')
       22 |       .expect(200)
    >  23 |       .expect('Hello World!');
          |        ^
  ```

### F-01 (Crítica) · Seeds con UUID como `text` bloquean 23 casos E2E

- **Descripción:** Los casos que siembran datos fallan antes de la petición HTTP con `PrismaClientKnownRequestError` P2010 / SQLSTATE `42804`. Afecta `seedCategory` (`test/helpers/test-database.helper.ts:20`) y `seedSupplier` (`:35`).
- **Severidad:** Crítica.
- **Pasos para reproducirlo:**
  1. `npm run test:e2e -- --verbose`.
  2. Contar 24 fallos; 23 de ellos muestran el stack en `seedCategory` o `seedSupplier`.
  3. Ejecutar la prueba unitaria de Prisma descrita en `reporte-integration.md` (F-01) para aislar la causa.
- **Evidencia visual sugerida:**
  1. Terminal con `Tests: 24 failed, 4 passed, 28 total`.
  2. Captura de un stack trace con `seedCategory (helpers/test-database.helper.ts:20)`.
  3. Captura de la tabla `categories` con `id uuid` en `psql`.
- **Logs de ejecución:**
  ```text
  PrismaClientKnownRequestError:
  Raw query failed. Code: `42804`. Message: `ERROR: column "id" is of type uuid
  but expression is of type text`
      at seedCategory (helpers/test-database.helper.ts:20:3)

  Test Suites: 4 failed, 4 total
  Tests:       24 failed, 4 passed, 28 total
  Force exiting Jest: Have you considered using `--detectOpenHandles`...
  ```
- **Impacto:** No se validan 23 flujos HTTP críticos (productos, órdenes de compra, inventario y alertas). Los 4 PASS solo cubren validación de DTO y 404 sin seeds.

### F-02 (Crítica) · Riesgo funcional en `POST /inventory/adjustments`

- **Descripción:** Aunque el E2E no llega a ejecutar el endpoint por F-01, la implementación subyacente usa `$executeRawUnsafe` con UUID como texto (`prisma-inventory.repository.ts:25-28`). La reproducción directa con Prisma devuelve `42883: operator does not exist: uuid = text`. Esto afectaría a TC-E-020, TC-E-021, TC-E-022, TC-E-024, TC-E-025 y a la recepción de órdenes (TC-E-015/016) una vez corregido el seed.
- **Severidad:** Crítica.
- **Pasos para reproducirlo:** Ver `reporte-integration.md`, Hallazgo F-02.
- **Evidencia visual sugerida:**
  1. Captura del error `P2010` / `42883`.
  2. Captura de Swagger/Postman con 500 en `POST /inventory/adjustments`.
  3. Captura del código en `prisma-inventory.repository.ts:25`.
- **Logs de ejecución:**
  ```text
  ERROR CODE: P2010
  ERROR MSG: Raw query failed. Code: `42883`. Message: `ERROR: operator does not exist: uuid = text
  HINT: No operator matches the given name and argument types.
  You might need to add explicit type casts.`
  ```

### Observación (Baja) · `--forceExit` y posible fuga de handles

- **Descripción:** El script E2E usa `--runInBand --forceExit`. Jest advierte `Force exiting Jest: Have you considered using --detectOpenHandles`. `test/helpers/test-database.helper.ts:3` instancia un `PrismaService` global que nunca se desconecta; el `PrismaService` de la app se cierra con `app.close()`, pero el del helper no.
- **Severidad:** Baja.
- **Pasos para reproducirlo:** Ejecutar `npm run test:e2e` sin `--forceExit` y ver si el proceso queda abierto.
- **Evidencia visual sugerida:** Captura del mensaje de `--detectOpenHandles` y del helper en la línea 3.
- **Logs de ejecución:**
  ```text
  Force exiting Jest: Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?
  ```

### Puntos ciegos de cobertura E2E

- No hay casos E2E para `GET /categories`, `POST /categories`, `GET /suppliers`, `POST /suppliers`.
- No se prueba la creación de orden con `source: 'LOW_STOCK_ALERT'` por HTTP (solo unitaria).
- No se prueba `rejectionReason` vacío o menor a 10 caracteres (validación del DTO).
- No se prueban paginación fuera de rango, filtros combinados ni ordenamiento.
- No se prueban respuestas 500 del servidor ni headers de seguridad (`helmet`) o CORS.

---

## 3. Entorno, Herramientas y Recursos de Prueba

### Herramientas y frameworks

| Herramienta | Versión / Uso |
| :--- | :--- |
| Node.js | `v24.21.0` |
| npm | `11.19.0` |
| Jest | `30.4.1` |
| ts-jest | `^29.2.5` |
| Supertest | `^7.0.0` |
| `@nestjs/testing` | `^11.0.1` |
| Prisma Client / CLI | `6.19.3` |
| PostgreSQL | `16-alpine` (contenedor `mercado-express-db`) |
| Docker | `29.7.2`, Compose `5.5.1` |
| `cross-env` | `^10.1.0` |

### Scripts de ejecución

| Comando | Propósito |
| :--- | :--- |
| `npm run test:e2e` | `cross-env DATABASE_URL=... jest --config ./test/jest-e2e.json --runInBand --forceExit`. Ejecuta `*.e2e-spec.ts`. |
| `npm run test:integration:setup` | Requisito previo: aplica migraciones a `mercado_express_test`. |
| `npm test` | Solo unitarias; **no** ejecuta esta suite. |

### Configuraciones requeridas

- **Archivo:** `test/jest-e2e.json`
  - `rootDir`: `.` (directorio `test/`).
  - `testRegex`: `.e2e-spec.ts$`.
  - `transform`: `ts-jest`.
  - `moduleNameMapper`: `^src/(.*)$` → `<rootDir>/../src/$1`.
  - `testEnvironment`: `node`.
- **Variable de entorno:** `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mercado_express_test?schema=public`.
- **Servicio externo:** PostgreSQL 16 en `localhost:5432`.
- **Bootstrap de prueba:** `test/helpers/test-app.helper.ts`
  - Importa `AppModule`.
  - Aplica `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
  - Aplica `GlobalExceptionFilter`.
  - Llama `app.init()` (no `listen`, Supertest usa el servidor HTTP interno).
- **Prisma Client:** requiere `npx prisma generate`.

### Datos de prueba (fixtures / seeds)

Se reutilizan los helpers de `test/helpers/test-database.helper.ts`:

| Función | Datos por defecto |
| :--- | :--- |
| `cleanDatabase()` | Borra `purchase_orders`, `alerts`, `inventory_transactions`, `products`, `categories`, `suppliers`. |
| `seedCategory()` | `name: 'Category <uuid8>'`, `is_deleted: false`. |
| `seedSupplier()` | `name: 'Supplier <uuid8>'`, `is_deleted: false`. |
| `seedProduct()` | `price: 10.0`, `currentStock: 20`, `minStock: 5`, SKU y nombre aleatorios. |
| `seedAlert()` | `type: 'LOW_STOCK'`, `status: 'ACTIVE'`. |
| `seedPurchaseOrder()` | `quantity: 20`, `status: 'PENDING'`, `source: 'MANUAL'`. |

**Problema conocido:** los seeds usan `$executeRawUnsafe` con UUID como texto y son la causa de F-01.

### Consideraciones de ejecución

- La suite requiere que la BD `mercado_express_test` exista y tenga migraciones aplicadas; el `compose.yaml` solo crea `mercado_express`.
- `--runInBand` evita paralelismo dentro de Jest; `--forceExit` enmascara posibles handles abiertos.
- No se modificó ningún archivo fuente ni configuración para obtener estos resultados.

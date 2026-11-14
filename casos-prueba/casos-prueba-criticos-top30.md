# Casos de Prueba Críticos — Top 30 (Risk-Based Testing)

**Proyecto:** Mercado Express · **Fecha:** 2026-11-14 · **Rama:** `master`
**Total de pruebas analizadas:** 110 (53 unitarias, 29 de integración, 28 E2E)
**Casos seleccionados:** 30
**Estado de ejecución:** 30/30 PASS. Las suites completas se ejecutaron con resultado 53/53, 29/29 y 28/28 PASS.

> Los 30 casos forman parte de las suites reales del repositorio. No se inventaron pruebas ni resultados. Las correcciones de la auditoría anterior (casts de UUID y expectativa del endpoint raíz) están aplicadas y verificadas.

---

## 1. Resumen Ejecutivo de Priorización

### Criterios aplicados

| Dimensión | Peso | Justificación |
| :--- | :---: | :--- |
| Integridad de datos e invariantes | 30 % | Evita stock negativo, duplicados de SKU y alertas duplicadas. |
| Atomicidad y transacciones | 25 % | Un ajuste de stock debe actualizar stock, registrar movimiento y gestionar alerta en una sola transacción. |
| Máquina de estados de órdenes | 20 % | Impide aprobar/rechazar/recibir órdenes en estados inválidos. |
| Reglas de negocio de creación | 15 % | Cantidad mínima, origen MANUAL vs LOW_STOCK_ALERT y consistencia de alertId. |
| Flujos E2E principales | 10 % | Verifica el recorrido HTTP → caso de uso → Prisma → PostgreSQL. |

Se descartaron pruebas triviales de getters/setters, validaciones de tipo obvias, paginaciones/filtros sin impacto transaccional y casos unitarios duplicados (por ejemplo, `TC-U-035`, idéntico a `TC-U-034`).

### Desglose por flujo crítico

| Flujo / módulo | Casos | IDs |
| :--- | ---: | :--- |
| Inventario: atomicidad, stock negativo y alertas | 9 | `TC-CRIT-01` a `TC-CRIT-09` |
| Órdenes de compra: reglas de creación | 6 | `TC-CRIT-10` a `TC-CRIT-15` |
| Órdenes de compra: máquina de estados y recepción | 6 | `TC-CRIT-16` a `TC-CRIT-21` |
| Flujos E2E principales (productos, órdenes, recepción) | 7 | `TC-CRIT-22` a `TC-CRIT-28` |
| Integridad de producto y manejo global de errores | 2 | `TC-CRIT-29` a `TC-CRIT-30` |
| **Total** | **30** | — |

### Cobertura por capa

| Capa | Casos |
| :--- | ---: |
| Dominio / casos de uso (unitarias) | 14 |
| Repositorios Prisma contra PostgreSQL real (integración) | 6 |
| HTTP E2E con Supertest | 10 |

---

## 2. Matriz de Casos de Prueba Críticos (Top 30)

### Inventario: atomicidad, stock negativo y alertas

#### TC-CRIT-01 · INCOMING incrementa stock y registra transacción atómicamente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-01` — Inventario / `PrismaInventoryRepository.adjustStock` — INCOMING atómico |
| **2. Precondiciones** | PostgreSQL `mercado_express_test` con migraciones; `cleanDatabase()`; producto con `currentStock: 10`, `minStock: 5`; repositorio conectado. |
| **3. Datos de Entrada** | `{ productId, quantity: 5, type: 'INCOMING', reason: 'Restock from supplier' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar `repository.adjustStock(...)`.<br>3. Verificar stock, transacción y motivo. |
| **5. Resultado Esperado** | Stock 15; transacción con `quantity: 5`, `transactionType: 'INCOMING'` y motivo preservado. |
| **6. Resultado Obtenido** | PASS. `product.currentStock = 15`, transacción persistida correctamente. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-02 · OUTGOING decrementa stock y registra transacción atómicamente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-02` — Inventario / `PrismaInventoryRepository.adjustStock` — OUTGOING atómico |
| **2. Precondiciones** | BD limpia; producto `currentStock: 20`, `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, quantity: -5, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar el ajuste.<br>3. Verificar stock y transacción. |
| **5. Resultado Esperado** | Stock 15; transacción `quantity: -5`, `transactionType: 'OUTGOING'`. |
| **6. Resultado Obtenido** | PASS. Stock 15 y movimiento persistido. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-03 · OUTGOING con stock insuficiente no altera la BD

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-03` — Inventario / `PrismaInventoryRepository.adjustStock` — prevención de stock negativo |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, quantity: -5, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar el ajuste.<br>3. Verificar resultado. |
| **5. Resultado Esperado** | `null` (la actualización condicional `(current_stock + $1) >= 0` no afecta filas). |
| **6. Resultado Obtenido** | PASS. Retornó `null`. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-04 · Creación automática de alerta LOW_STOCK

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-04` — Inventario / `PrismaInventoryRepository.adjustStock` — creación de alerta |
| **2. Precondiciones** | Producto `currentStock: 7`, `minStock: 5`; sin alerta activa. |
| **3. Datos de Entrada** | `{ productId, quantity: -3, type: 'OUTGOING', reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ejecutar el ajuste.<br>3. Verificar stock y alerta. |
| **5. Resultado Esperado** | Stock 4; alerta `LOW_STOCK` con `status: 'ACTIVE'`. |
| **6. Resultado Obtenido** | PASS. Alerta creada con `type: 'LOW_STOCK'` y `status: 'ACTIVE'`. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-05 · No se duplica una alerta activa existente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-05` — Inventario / `PrismaInventoryRepository.adjustStock` — unicidad de alerta activa |
| **2. Precondiciones** | Producto `currentStock: 4`, `minStock: 5`; alerta `ACTIVE` ya sembrada. |
| **3. Datos de Entrada** | `{ productId, quantity: -1, type: 'OUTGOING', reason: 'Another sale' }` |
| **4. Pasos** | 1. Sembrar producto y alerta.<br>2. Ejecutar el ajuste.<br>3. Verificar `alert` y contar alertas activas. |
| **5. Resultado Esperado** | `alert === null`; exactamente 1 alerta activa para el producto. |
| **6. Resultado Obtenido** | PASS. `alert` nulo y conteo de alertas activas igual a 1. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-06 · INCOMING resuelve automáticamente la alerta activa

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-06` — Inventario / `PrismaInventoryRepository.adjustStock` — resolución de alerta |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`; alerta `ACTIVE` sembrada. |
| **3. Datos de Entrada** | `{ productId, quantity: 10, type: 'INCOMING', reason: 'Restock' }` |
| **4. Pasos** | 1. Sembrar producto y alerta.<br>2. Ejecutar el ajuste.<br>3. Verificar alerta devuelta y en BD. |
| **5. Resultado Esperado** | Stock 13; alerta `RESOLVED` con el mismo `id`. |
| **6. Resultado Obtenido** | PASS. Alerta resuelta y mismo identificador. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-07 · El caso de uso traduce el fallo del repositorio a error de dominio

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-07` — Inventario / `AdjustStockUseCase` — manejo de stock insuficiente |
| **2. Precondiciones** | Mocks de `InventoryRepository` y `ProductRepository`; producto mock `currentStock: 3`; `adjustStock` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', type: 'OUTGOING', quantity: 5, reason: 'Sale' }` |
| **4. Pasos** | 1. Configurar mocks.<br>2. Ejecutar `useCase.execute(dto)`.<br>3. Verificar rechazo. |
| **5. Resultado Esperado** | `InsufficientStockForAdjustmentError`. |
| **6. Resultado Obtenido** | PASS. La promesa rechazó con el error de dominio esperado. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-08 · E2E: OUTGOING sin stock devuelve 400 INSUFFICIENT_STOCK

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-08` — Inventario / `POST /inventory/adjustments` — error de negocio por HTTP |
| **2. Precondiciones** | App Nest con `ValidationPipe` y `GlobalExceptionFilter`; BD limpia; producto `currentStock: 3`. |
| **3. Datos de Entrada** | `{ productId, type: 'OUTGOING', quantity: 5, reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. `POST /inventory/adjustments`.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | HTTP 400 con `code: 'INSUFFICIENT_STOCK'`. |
| **6. Resultado Obtenido** | PASS. 400 y código correcto. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-09 · E2E: OUTGOING bajo el mínimo crea alerta LOW_STOCK

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-09` — Inventario / `POST /inventory/adjustments` — alerta por HTTP |
| **2. Precondiciones** | App de prueba; producto `currentStock: 7`, `minStock: 5`; sin alerta activa. |
| **3. Datos de Entrada** | `{ productId, type: 'OUTGOING', quantity: 3, reason: 'Sale' }` |
| **4. Pasos** | 1. Sembrar producto.<br>2. Ajustar por HTTP.<br>3. Verificar `alert`. |
| **5. Resultado Esperado** | HTTP 200; `alert.status: 'ACTIVE'` y `alert.type: 'LOW_STOCK'`. |
| **6. Resultado Obtenido** | PASS. Alerta activa devuelta en la respuesta. |
| **7. Estado Final** | `PASS` |

### Órdenes de compra: reglas de creación

#### TC-CRIT-10 · Creación MANUAL sin alertId

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-10` — Purchase Orders / `CreatePurchaseOrderUseCase` — flujo MANUAL |
| **2. Precondiciones** | Producto mock; `purchaseOrderRepository.save` resuelve orden `PENDING`/`MANUAL`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar el caso de uso.<br>2. Verificar `save`.<br>3. Comparar resultado. |
| **5. Resultado Esperado** | Orden creada con `source: 'MANUAL'`, `status: 'PENDING'` y `alertId: null`. |
| **6. Resultado Obtenido** | PASS. Orden guardada y retornada correctamente. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-11 · LOW_STOCK_ALERT sin alertId es rechazada

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-11` — Purchase Orders / `CreatePurchaseOrderUseCase` — obligatoriedad de alertId |
| **2. Precondiciones** | Producto mock. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-12 · LOW_STOCK_ALERT sin alerta activa es rechazada

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-12` — Purchase Orders / `CreatePurchaseOrderUseCase` — inexistencia de alerta activa |
| **2. Precondiciones** | Producto mock; `findActiveByProductId` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT', alertId: 'alert-uuid' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-13 · LOW_STOCK_ALERT con alertId que no coincide es rechazada

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-13` — Purchase Orders / `CreatePurchaseOrderUseCase` — integridad alerta-orden |
| **2. Precondiciones** | Producto mock; alerta activa retornada con id `different-alert`. |
| **3. Datos de Entrada** | `alertId: 'alert-uuid'` (no coincide con la alerta activa). |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-14 · LOW_STOCK_ALERT con alertId coincidente crea la orden

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-14` — Purchase Orders / `CreatePurchaseOrderUseCase` — flujo LOW_STOCK_ALERT |
| **2. Precondiciones** | Alerta activa `alert-uuid`; `save` resuelve orden con ese `alertId`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT', alertId: 'alert-uuid' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar `save`.<br>3. Comparar resultado. |
| **5. Resultado Esperado** | Orden `LOW_STOCK_ALERT` con `alertId: 'alert-uuid'`, estado `PENDING`. |
| **6. Resultado Obtenido** | PASS. Orden creada y persistida (mock). |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-15 · Cantidad menor a 2× minStock es rechazada

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-15` — Purchase Orders / `CreatePurchaseOrderUseCase` — regla de cantidad mínima |
| **2. Precondiciones** | Producto mock con `minStock: 10`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 19, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidQuantityForOrderError` (19 < 20). |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

### Órdenes de compra: máquina de estados y recepción

#### TC-CRIT-16 · Aprobar una orden PENDING

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-16` — Purchase Orders / `ApprovePurchaseOrderUseCase` — transición PENDING → APPROVED |
| **2. Precondiciones** | Orden mock `PENDING`; `updateStatus` resuelve `APPROVED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Resolver orden.<br>2. Ejecutar.<br>3. Verificar llamada y estado. |
| **5. Resultado Esperado** | `updateStatus('order-uuid', 'APPROVED')` y `status: 'APPROVED'`. |
| **6. Resultado Obtenido** | PASS. Transición aplicada. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-17 · Aprobar una orden no PENDING es rechazado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-17` — Purchase Orders / `ApprovePurchaseOrderUseCase` — guarda de estado |
| **2. Precondiciones** | Orden mock `APPROVED` (representa cualquier estado distinto de `PENDING`). |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Resolver orden.<br>2. Ejecutar.<br>3. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. Las variantes desde `REJECTED` y `RECEIVED` también pasan. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-18 · Rechazar una orden PENDING con motivo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-18` — Purchase Orders / `RejectPurchaseOrderUseCase` — transición PENDING → REJECTED |
| **2. Precondiciones** | Orden mock `PENDING`; `updateStatus` resuelve `REJECTED` con motivo. |
| **3. Datos de Entrada** | `execute('order-uuid', { rejectionReason: 'Not needed' })` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar argumentos y resultado. |
| **5. Resultado Esperado** | `updateStatus('order-uuid', 'REJECTED', 'Not needed')`; motivo persistido. |
| **6. Resultado Obtenido** | PASS. Estado y motivo correctos. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-19 · Recibir orden APPROVED incrementa stock y cambia estado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-19` — Purchase Orders / `ReceivePurchaseOrderUseCase` — APPROVED → RECEIVED + ajuste de stock |
| **2. Precondiciones** | Orden `APPROVED` con `quantity: 20`; `adjustStockUseCase` resuelve stock 40; `updateStatus` resuelve `RECEIVED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Resolver orden.<br>2. Ejecutar.<br>3. Verificar ajuste, estado y stock. |
| **5. Resultado Esperado** | Ajuste `INCOMING` de 20 con motivo `Purchase order received: order-uuid`; estado `RECEIVED`; stock 40. |
| **6. Resultado Obtenido** | PASS. Las tres aserciones se cumplen. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-20 · Recibir orden propaga la alerta resuelta

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-20` — Purchase Orders / `ReceivePurchaseOrderUseCase` — propagación de alerta |
| **2. Precondiciones** | Orden `APPROVED`; el ajuste devuelve `alert: { id: 'alert-uuid', status: 'RESOLVED' }`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Comparar `stockAdjustment.alert`. |
| **5. Resultado Esperado** | La respuesta incluye `{ id: 'alert-uuid', status: 'RESOLVED' }`. |
| **6. Resultado Obtenido** | PASS. Alerta propagada sin pérdida de datos. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-21 · Recibir una orden desde PENDING es rechazado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-21` — Purchase Orders / `ReceivePurchaseOrderUseCase` — guarda de estado |
| **2. Precondiciones** | Orden mock `PENDING`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. Variantes desde `REJECTED` y `RECEIVED` también pasan. |
| **7. Estado Final** | `PASS` |

### Flujos E2E principales

#### TC-CRIT-22 · E2E: SKU duplicado devuelve 409

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-22` — Products / `POST /products` — unicidad de SKU |
| **2. Precondiciones** | App con `ValidationPipe` y `GlobalExceptionFilter`; BD limpia; categoría y proveedor sembrados. |
| **3. Datos de Entrada** | POST 1: `{ name: 'Product 1', sku: 'DUPLICATE-SKU', categoryId, supplierId, price: 10, currentStock: 5, minStock: 1 }`. POST 2: mismo SKU, `name: 'Product 2'`. |
| **4. Pasos** | 1. Crear producto 1 (201).<br>2. Repetir POST con el mismo SKU.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | Segundo POST: HTTP 409 con `code: 'PRODUCT_ALREADY_EXISTS'`. |
| **6. Resultado Obtenido** | PASS. 201 en el primero y 409 con el código esperado en el segundo. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-23 · E2E: crear orden MANUAL

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-23` — Purchase Orders / `POST /purchase-orders` — flujo de creación |
| **2. Precondiciones** | BD limpia; categoría, proveedor y producto con `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. `POST /purchase-orders`.<br>3. Verificar body. |
| **5. Resultado Esperado** | HTTP 201; `status: 'PENDING'`, `source: 'MANUAL'`, `quantity: 20`. |
| **6. Resultado Obtenido** | PASS. Orden creada con los valores esperados. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-24 · E2E: MANUAL con alertId devuelve 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-24` — Purchase Orders / `POST /purchase-orders` — integridad de origen |
| **2. Precondiciones** | Producto `minStock: 5`. |
| **3. Datos de Entrada** | `{ productId, supplierId, quantity: 20, source: 'MANUAL', alertId: '00000000-0000-0000-0000-000000000000' }` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Crear orden.<br>3. Verificar status y código. |
| **5. Resultado Esperado** | HTTP 400 con `code: 'ALERT_ID_NOT_ALLOWED_FOR_MANUAL'`. |
| **6. Resultado Obtenido** | PASS. 400 y código correcto. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-25 · E2E: aprobar orden PENDING

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-25` — Purchase Orders / `PATCH /purchase-orders/:id/approve` — flujo de aprobación |
| **2. Precondiciones** | Producto y orden `PENDING` sembrados. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/approve` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Aprobar por HTTP.<br>3. Verificar estado. |
| **5. Resultado Esperado** | HTTP 200 con `status: 'APPROVED'`. |
| **6. Resultado Obtenido** | PASS. Orden aprobada correctamente. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-26 · E2E: rechazar orden PENDING con motivo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-26` — Purchase Orders / `PATCH /purchase-orders/:id/reject` — flujo de rechazo |
| **2. Precondiciones** | Orden `PENDING` sembrada. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/reject` con `{ rejectionReason: 'Too expensive' }` |
| **4. Pasos** | 1. Sembrar orden.<br>2. Rechazar.<br>3. Verificar estado y motivo. |
| **5. Resultado Esperado** | HTTP 200; `status: 'REJECTED'` y `rejectionReason: 'Too expensive'`. |
| **6. Resultado Obtenido** | PASS. Estado y motivo persistidos. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-27 · E2E: recibir orden APPROVED actualiza stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-27` — Purchase Orders / `PATCH /purchase-orders/:id/receive` — flujo transaccional principal |
| **2. Precondiciones** | Producto `currentStock: 10`; orden `APPROVED` con `quantity: 20`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/receive` |
| **4. Pasos** | 1. Sembrar datos.<br>2. Recibir.<br>3. Verificar estado y stock. |
| **5. Resultado Esperado** | HTTP 200; `order.status: 'RECEIVED'` y `stockAdjustment.product.currentStock: 30`. |
| **6. Resultado Obtenido** | PASS. Stock incrementado de 10 a 30 y orden recibida. |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-28 · E2E: recibir orden resuelve alerta activa

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-28` — Purchase Orders / `PATCH /purchase-orders/:id/receive` — resolución de alerta |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`; alerta `ACTIVE`; orden `APPROVED` con `quantity: 20`. |
| **3. Datos de Entrada** | `PATCH /purchase-orders/{order.id}/receive` |
| **4. Pasos** | 1. Sembrar producto, alerta y orden.<br>2. Recibir.<br>3. Verificar alerta. |
| **5. Resultado Esperado** | HTTP 200; `stockAdjustment.alert.status: 'RESOLVED'`. |
| **6. Resultado Obtenido** | PASS. Alerta resuelta al superar el mínimo. |
| **7. Estado Final** | `PASS` |

### Integridad de producto y manejo global de errores

#### TC-CRIT-29 · E2E: producto inexistente en orden devuelve 404

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-29` — Purchase Orders / `POST /purchase-orders` — integridad referencial |
| **2. Precondiciones** | BD limpia; solo proveedor sembrado. |
| **3. Datos de Entrada** | `{ productId: '00000000-0000-0000-0000-000000000000', supplierId, quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Sembrar proveedor.<br>2. Crear orden con producto inexistente.<br>3. Verificar status. |
| **5. Resultado Esperado** | HTTP 404 (`PRODUCT_NOT_FOUND`). |
| **6. Resultado Obtenido** | PASS. 404 (`PRODUCT_NOT_FOUND`). |
| **7. Estado Final** | `PASS` |

#### TC-CRIT-30 · Excepción no controlada devuelve 500 genérico sin filtrar detalles

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-CRIT-30` — Shared / `GlobalExceptionFilter` — manejo seguro de errores |
| **2. Precondiciones** | Filtro instanciado; mocks de `Request`/`Response`; `Logger.error` silenciado. |
| **3. Datos de Entrada** | `new Error('Something went wrong')` |
| **4. Pasos** | 1. Ejecutar `filter.catch(exception, host)`.<br>2. Verificar status y body. |
| **5. Resultado Esperado** | HTTP 500, `code: 'INTERNAL_SERVER_ERROR'` y `message: 'An unexpected error occurred.'` |
| **6. Resultado Obtenido** | PASS. Respuesta genérica 500 y log interno del error. |
| **7. Estado Final** | `PASS` |

---

## 3. Hallazgos Reproducibles y Evidencias

**Resultado de la ejecución actual:** los 30 casos seleccionados **PASARON**. No hay fallos reproducibles en los flujos críticos cubiertos por la suite. Los hallazgos de la auditoría anterior (UUID como `text`, expectativa obsoleta de `GET /`) fueron corregidos y verificados.

A continuación se documentan brechas críticas de cobertura/riesgo detectadas por análisis, no fallos de tests existentes.

### H-01 (Crítica) · Ausencia total de autenticación/autorización

- **Descripción y ubicación:** no existe `AuthGuard`, `UseGuards`, `@nestjs/jwt` ni `APP_GUARD` en `src/`. Todos los endpoints de escritura (`POST /products`, `POST /purchase-orders`, `PATCH /purchase-orders/:id/receive`, `POST /inventory/adjustments`) son accesibles sin credenciales. La suite E2E ejecuta estas operaciones sin autenticarse y obtiene 200/201, lo que evidencia el comportamiento.
- **Severidad:** Crítica (seguridad).
- **Pasos para reproducirlo:**
  1. Levantar la API (`npm run start:dev`).
  2. Ejecutar `POST /products` o `PATCH /purchase-orders/{id}/receive` sin cabecera `Authorization`.
  3. Observar que la operación se ejecuta con 200/201.
- **Evidencia visual sugerida:**
  1. Captura de Swagger/Postman con la petición sin token y respuesta 201.
  2. Captura de `grep -r "UseGuards" src` sin resultados.
  3. Captura del código de `main.ts` mostrando que no se registra autenticación.
- **Registros / Logs de ejecución:**
  ```text
  Tests: 28 passed, 28 total
  (las peticiones E2E de escritura no envían credenciales y aun así reciben 200/201)
  ```

### H-02 (Crítica) · Riesgo de doble recepción de una orden de compra (race condition)

- **Descripción y ubicación:** `src/modules/purchase-orders/application/use-cases/receive-purchase-order.use-case.ts:21-50` hace `findById` → valida `APPROVED` → `adjustStock` → `updateStatus('RECEIVED')` sin una transacción ni bloqueo que cubra todo el flujo. Dos peticiones concurrentes pueden leer `APPROVED` antes de que la primera actualice el estado y ambas incrementar el stock (doble recepción).
- **Severidad:** Crítica (corrupción de inventario).
- **Pasos para reproducirlo:**
  1. Sembrar una orden `APPROVED` con `quantity: 20` y producto con stock 10.
  2. Enviar dos `PATCH /purchase-orders/{id}/receive` simultáneos (`Promise.all` o `ab`/`hey`).
  3. Verificar cuántas respuestas 200 hay y el stock final.
  4. Resultado esperado correcto: una sola recepción (stock 30, segunda petición 400). No existe prueba que lo garantice.
- **Evidencia visual sugerida:**
  1. Captura de las dos respuestas HTTP concurrentes.
  2. Captura de `SELECT current_stock` mostrando 50 en lugar de 30.
  3. Captura de dos filas en `inventory_transactions` con el mismo `purchase order received`.
- **Registros / Logs de ejecución:** No aplica: la suite actual no ejecuta concurrencia; no hay log de fallo reproducible todavía. Se recomienda una prueba con `Promise.all` como la descrita.

### H-03 (Alta) · El CI no ejecuta integración ni E2E

- **Descripción y ubicación:** `.github/workflows/deploy.yaml:40` ejecuta `npm test`, que solo corre pruebas unitarias. No se invocan `test:integration` ni `test:e2e`, por lo que regresiones en transacciones, Prisma o endpoints no bloquean el despliegue.
- **Severidad:** Alta.
- **Pasos para reproducirlo:** abrir el workflow y verificar el único paso de test; comparar con `package.json` (`scripts.test` y bloque `jest`).
- **Evidencia visual sugerida:** captura del workflow y del bloque Jest de `package.json`.
- **Registros / Logs de ejecución:** No aplica (configuración).

### H-04 (Media) · Módulos `categories` y `suppliers` sin pruebas

- **Descripción y ubicación:** existen controllers, casos de uso y repositorios en `src/modules/categories` y `src/modules/suppliers`, pero no hay archivos `*.spec.ts` que los cubran. Los E2E de productos dependen de seeds directos, no de los endpoints de categorías/proveedores.
- **Severidad:** Media (cobertura).
- **Pasos para reproducirlo:** `glob "**/categories/**/*.spec.ts"` y `glob "**/suppliers/**/*.spec.ts"` no devuelven archivos.
- **Evidencia visual sugerida:** captura de la estructura de ambos módulos sin tests.
- **Registros / Logs de ejecución:** No aplica (análisis estático).

### H-05 (Baja) · Handles abiertos en E2E

- **Descripción y ubicación:** `test/helpers/test-database.helper.ts:3` crea un `PrismaService` global que nunca se desconecta; el script E2E usa `--forceExit`, enmascarando el problema. Jest emite: `Force exiting Jest: Have you considered using --detectOpenHandles`.
- **Severidad:** Baja.
- **Pasos para reproducirlo:** `npm run test:e2e` y observar la advertencia final.
- **Evidencia visual sugerida:** captura del mensaje de `--detectOpenHandles` y del helper en la línea 3.
- **Registros / Logs de ejecución:**
  ```text
  Test Suites: 4 passed, 4 total
  Tests:       28 passed, 28 total
  Force exiting Jest: Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?
  ```

---

## 4. Entorno, Herramientas y Recursos de Prueba

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
| Docker / Compose | `29.7.2` / `5.5.1` |

### Scripts de ejecución

| Comando | Propósito |
| :--- | :--- |
| `npm run test:unit` | Casos de dominio y casos de uso (14 de los 30). |
| `npm run test:integration:setup` | Aplica migraciones a `mercado_express_test`. |
| `npm run test:integration` | Repositorios Prisma contra PostgreSQL real (6 de los 30). |
| `npm run test:e2e -- --verbose` | Flujos HTTP completos con Supertest (10 de los 30). |
| `npm test` | Solo unitarias; no cubre los 30 casos completos. |

### Configuraciones y variables de entorno

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mercado_express_test?schema=public`
- `test/jest-integration.json`: `rootDir: ../src`, `testRegex: .*\.integration\.spec\.ts$`.
- `test/jest-e2e.json`: `rootDir: .`, `testRegex: .e2e-spec.ts$`, `moduleNameMapper` para `src/*`.
- `package.json` (unitarias): `rootDir: src`, `testRegex: .*(?<!\.integration)\.spec\.ts$`.
- PostgreSQL 16 con migraciones `20260709172717_init` y `20260710160653_add_rejection_reason_to_purchase_orders`.
- `npx prisma generate` requerido antes de ejecutar.

### Datos de prueba (fixtures / seeds)

| Ubicación | Descripción |
| :--- | :--- |
| `test/helpers/test-database.helper.ts:5` | `cleanDatabase()`: limpia órdenes, alertas, transacciones, productos, categorías y proveedores. |
| `test/helpers/test-database.helper.ts:14` | `seedCategory`: id UUID, nombre aleatorio. |
| `test/helpers/test-database.helper.ts:29` | `seedSupplier`: id UUID, nombre aleatorio. |
| `test/helpers/test-database.helper.ts:44` | `seedProduct`: precio 10, stock 20, mínimo 5 por defecto. |
| `test/helpers/test-database.helper.ts:95` | `seedAlert`: `LOW_STOCK` / `ACTIVE` por defecto. |
| `test/helpers/test-database.helper.ts:116` | `seedPurchaseOrder`: cantidad 20, `PENDING` / `MANUAL` por defecto. |
| Specs unitarias | Fábricas `mockProduct`, `mockOrder`, `mockAlert` y objetos `defaultProps`. |

### Salidas reales de la ejecución

```text
# Unitarias
Test Suites: 7 passed, 7 total
Tests:       53 passed, 53 total

# Integración
Test Suites: 4 passed, 4 total
Tests:       29 passed, 29 total

# E2E
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
```

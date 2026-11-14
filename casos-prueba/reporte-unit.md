# Reporte de Casos de Prueba — Suite Unitaria

**Proyecto:** Mercado Express · **Commit:** `0f8745c` · **Fecha:** 2026-11-14
**Comando ejecutado:** `npm run test:unit -- --verbose` (`jest --testPathPatterns='src/.*(?<!\.integration)\.spec\.ts$'`)
**Resultado global:** 7 suites, 53 casos, **53 PASS / 0 FAIL**.

---

## 1. Matriz de Casos de Prueba

### 1.1 `adjust-stock.use-case.spec.ts` (4 casos)

#### TC-U-001 · ProductNotFoundError cuando el producto no existe

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-001` — `AdjustStockUseCase › when product is not found › should throw ProductNotFoundError` |
| **2. Precondiciones** | `AdjustStockUseCase` instanciado con `inventoryRepository` y `productRepository` mockeados. `productRepository.findById` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'non-existent', type: 'INCOMING', quantity: 10, reason: 'Restock' }` |
| **4. Pasos** | 1. Configurar `findById` para resolver `null`.<br>2. Ejecutar `useCase.execute(dto)`.<br>3. Verificar la promesa rechazada. |
| **5. Resultado Esperado** | Rechazo con `ProductNotFoundError`. |
| **6. Resultado Obtenido** | PASS. `rejects.toThrow(ProductNotFoundError)` satisfecho; no se invocó `adjustStock`. |
| **7. Estado Final** | `PASS` |

#### TC-U-002 · Ajuste INCOMING envía cantidad positiva

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-002` — `AdjustStockUseCase › when product exists › should call inventoryRepository.adjustStock with positive quantity for INCOMING` |
| **2. Precondiciones** | Producto mock `currentStock: 20`. `findById` resuelve el producto; `adjustStock` resuelve `{ product: { currentStock: 30 }, transaction: { quantity: 10, transactionType: 'INCOMING' }, alert: null }`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', type: 'INCOMING', quantity: 10, reason: 'Restock' }` |
| **4. Pasos** | 1. Resolver producto.<br>2. Resolver resultado del repositorio.<br>3. Ejecutar el caso de uso.<br>4. Verificar argumentos y respuesta. |
| **5. Resultado Esperado** | `adjustStock` llamado con `{ productId: 'prod-uuid', quantity: 10, type: 'INCOMING', reason: 'Restock' }` y respuesta idéntica al mock. |
| **6. Resultado Obtenido** | PASS. Argumentos y respuesta coinciden (`toEqual(result)`). |
| **7. Estado Final** | `PASS` |

#### TC-U-003 · Ajuste OUTGOING envía cantidad negativa

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-003` — `AdjustStockUseCase › when product exists › should call inventoryRepository.adjustStock with negative quantity for OUTGOING` |
| **2. Precondiciones** | Producto mock `currentStock: 20`; `adjustStock` resuelve stock 15 y transacción `quantity: -5`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', type: 'OUTGOING', quantity: 5, reason: 'Sale' }` |
| **4. Pasos** | 1. Resolver producto y resultado.<br>2. Ejecutar el caso de uso.<br>3. Verificar argumentos y respuesta. |
| **5. Resultado Esperado** | `adjustStock` llamado con `quantity: -5` y `type: 'OUTGOING'`; respuesta igual al mock. |
| **6. Resultado Obtenido** | PASS. `quantity: -5` verificado. |
| **7. Estado Final** | `PASS` |

#### TC-U-004 · InsufficientStockForAdjustmentError cuando el repositorio retorna null

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-004` — `AdjustStockUseCase › when product exists › should throw InsufficientStockForAdjustmentError when repository returns null` |
| **2. Precondiciones** | Producto mock `currentStock: 3`; `adjustStock` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', type: 'OUTGOING', quantity: 5, reason: 'Sale' }` |
| **4. Pasos** | 1. Resolver producto con stock 3.<br>2. Resolver `null` desde el repositorio.<br>3. Ejecutar y verificar el rechazo. |
| **5. Resultado Esperado** | Rechazo con `InsufficientStockForAdjustmentError`. |
| **6. Resultado Obtenido** | PASS. Error de dominio esperado lanzado. |
| **7. Estado Final** | `PASS` |

### 1.2 `product.entity.spec.ts` (11 casos)

#### TC-U-005 · Creación de producto con id generado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-005` — `Product Entity › create › should create a product with a generated id` |
| **2. Precondiciones** | Entidad de dominio `Product` disponible sin dependencias externas. |
| **3. Datos de Entrada** | `{ name: 'Test Product', sku: 'SKU-001', categoryId: 'cat-uuid', supplierId: 'sup-uuid', price: 25.5, currentStock: 20, minStock: 5 }` |
| **4. Pasos** | 1. Ejecutar `Product.create(defaultProps)`.<br>2. Verificar id y cada propiedad. |
| **5. Resultado Esperado** | `id` definido (UUID) y propiedades iguales a la entrada. |
| **6. Resultado Obtenido** | PASS. Todas las aserciones de igualdad satisfechas. |
| **7. Estado Final** | `PASS` |

#### TC-U-006 · Restauración de producto con id dado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-006` — `Product Entity › restore › should restore a product with the given id` |
| **2. Precondiciones** | Entidad `Product` disponible. |
| **3. Datos de Entrada** | `{ ...defaultProps, id: 'fixed-uuid' }` |
| **4. Pasos** | 1. Ejecutar `Product.restore(...)`.<br>2. Verificar id y nombre. |
| **5. Resultado Esperado** | `id === 'fixed-uuid'` y `name` preservado. |
| **6. Resultado Obtenido** | PASS. Id y nombre restaurados correctamente. |
| **7. Estado Final** | `PASS` |

#### TC-U-007 · Incremento de stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-007` — `Product Entity › increaseStock › should increase the current stock by the given quantity` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `increaseStock(10)` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `increaseStock(10)`.<br>3. Leer `currentStock`. |
| **5. Resultado Esperado** | `currentStock === 30`. |
| **6. Resultado Obtenido** | PASS. Stock final 30. |
| **7. Estado Final** | `PASS` |

#### TC-U-008 · Incremento de stock en cero

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-008` — `Product Entity › increaseStock › should handle increasing by zero` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `increaseStock(0)` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `increaseStock(0)`.<br>3. Leer `currentStock`. |
| **5. Resultado Esperado** | Stock sin cambios (`20`). |
| **6. Resultado Obtenido** | PASS. Stock final 20. |
| **7. Estado Final** | `PASS` |

#### TC-U-009 · Decremento de stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-009` — `Product Entity › decreaseStock › should decrease the current stock by the given quantity` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `decreaseStock(5)` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `decreaseStock(5)`.<br>3. Leer stock. |
| **5. Resultado Esperado** | `currentStock === 15`. |
| **6. Resultado Obtenido** | PASS. Stock final 15. |
| **7. Estado Final** | `PASS` |

#### TC-U-010 · Decremento hasta cero exacto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-010` — `Product Entity › decreaseStock › should decrease stock to exactly zero` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `decreaseStock(20)` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `decreaseStock(20)`.<br>3. Leer stock. |
| **5. Resultado Esperado** | `currentStock === 0`. |
| **6. Resultado Obtenido** | PASS. Stock final 0 (límite permitido). |
| **7. Estado Final** | `PASS` |

#### TC-U-011 · Error al intentar stock negativo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-011` — `Product Entity › decreaseStock › should throw InsufficientStockError when stock would go negative` |
| **2. Precondiciones** | Producto con `currentStock: 20`. |
| **3. Datos de Entrada** | `decreaseStock(25)` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `decreaseStock(25)` dentro de una función.<br>3. Verificar excepción. |
| **5. Resultado Esperado** | Lanza `InsufficientStockError`. |
| **6. Resultado Obtenido** | PASS. Excepción de dominio lanzada. |
| **7. Estado Final** | `PASS` |

#### TC-U-012 · Error al decrementar con stock en cero

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-012` — `Product Entity › decreaseStock › should throw InsufficientStockError when stock is zero` |
| **2. Precondiciones** | Producto con `currentStock: 0`. |
| **3. Datos de Entrada** | `decreaseStock(1)` |
| **4. Pasos** | 1. Crear producto con stock 0.<br>2. Invocar `decreaseStock(1)`.<br>3. Verificar excepción. |
| **5. Resultado Esperado** | Lanza `InsufficientStockError`. |
| **6. Resultado Obtenido** | PASS. Excepción lanzada. |
| **7. Estado Final** | `PASS` |

#### TC-U-013 · hasLowStock con stock igual al mínimo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-013` — `Product Entity › hasLowStock › should return true when current stock is equal to min stock` |
| **2. Precondiciones** | Producto `currentStock: 5`, `minStock: 5`. |
| **3. Datos de Entrada** | `hasLowStock()` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `hasLowStock()`. |
| **5. Resultado Esperado** | `true` (el umbral es inclusivo). |
| **6. Resultado Obtenido** | PASS. Retorna `true`. |
| **7. Estado Final** | `PASS` |

#### TC-U-014 · hasLowStock con stock bajo el mínimo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-014` — `Product Entity › hasLowStock › should return true when current stock is below min stock` |
| **2. Precondiciones** | Producto `currentStock: 3`, `minStock: 5`. |
| **3. Datos de Entrada** | `hasLowStock()` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `hasLowStock()`. |
| **5. Resultado Esperado** | `true`. |
| **6. Resultado Obtenido** | PASS. Retorna `true`. |
| **7. Estado Final** | `PASS` |

#### TC-U-015 · hasLowStock con stock sobre el mínimo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-015` — `Product Entity › hasLowStock › should return false when current stock is above min stock` |
| **2. Precondiciones** | Producto `currentStock: 10`, `minStock: 5`. |
| **3. Datos de Entrada** | `hasLowStock()` |
| **4. Pasos** | 1. Crear producto.<br>2. Invocar `hasLowStock()`. |
| **5. Resultado Esperado** | `false`. |
| **6. Resultado Obtenido** | PASS. Retorna `false`. |
| **7. Estado Final** | `PASS` |

### 1.3 `global-exception.filter.spec.ts` (11 casos)

#### TC-U-016 · Mapeo de código de dominio conocido

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-016` — `GlobalExceptionFilter › DomainException handling › should map known domain error codes to correct HTTP status` |
| **2. Precondiciones** | `GlobalExceptionFilter` instanciado; `ArgumentsHost`, `Request` y `Response` mockeados; `Logger.error` silenciado con spy. Excepción de prueba con `code = 'TEST_ERROR'`. |
| **3. Datos de Entrada** | `new TestDomainException()` (`message: 'Test domain error'`), request `GET /test`. |
| **4. Pasos** | 1. Construir mocks de HTTP.<br>2. Ejecutar `filter.catch(exception, host)`.<br>3. Inspeccionar `status` y `json`. |
| **5. Resultado Esperado** | HTTP 400 y cuerpo con `statusCode: 400`, `code: 'TEST_ERROR'`, `message`, `method: 'GET'`, `path: '/test'`. |
| **6. Resultado Obtenido** | PASS. Status 400 y objeto de respuesta conforme. |
| **7. Estado Final** | `PASS` |

#### TC-U-017 · Mapeo PRODUCT_NOT_FOUND a 404

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-017` — `GlobalExceptionFilter › DomainException handling › should map PRODUCT_NOT_FOUND to 404` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. Excepción anónima `DomainException` con `code = 'PRODUCT_NOT_FOUND'`. |
| **3. Datos de Entrada** | `new DomainException` con mensaje `'Product not found'` y código `PRODUCT_NOT_FOUND`. |
| **4. Pasos** | 1. Ejecutar `filter.catch(...)`.<br>2. Verificar status. |
| **5. Resultado Esperado** | `HttpStatus.NOT_FOUND` (404). |
| **6. Resultado Obtenido** | PASS. Status 404. |
| **7. Estado Final** | `PASS` |

#### TC-U-018 · Mapeo INSUFFICIENT_STOCK a 400

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-018` — `GlobalExceptionFilter › DomainException handling › should map INSUFFICIENT_STOCK to 400` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. Código de dominio `INSUFFICIENT_STOCK`. |
| **3. Datos de Entrada** | `{ code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock' }` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status. |
| **5. Resultado Esperado** | `HttpStatus.BAD_REQUEST` (400). |
| **6. Resultado Obtenido** | PASS. Status 400. |
| **7. Estado Final** | `PASS` |

#### TC-U-019 · Mapeo PRODUCT_ALREADY_EXISTS a 409

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-019` — `GlobalExceptionFilter › DomainException handling › should map PRODUCT_ALREADY_EXISTS to 409` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. Código de dominio `PRODUCT_ALREADY_EXISTS`. |
| **3. Datos de Entrada** | `{ code: 'PRODUCT_ALREADY_EXISTS', message: 'Product already exists' }` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status. |
| **5. Resultado Esperado** | `HttpStatus.CONFLICT` (409). |
| **6. Resultado Obtenido** | PASS. Status 409. |
| **7. Estado Final** | `PASS` |

#### TC-U-020 · Código de dominio desconocido usa 400 por defecto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-020` — `GlobalExceptionFilter › DomainException handling › should default to 400 for unknown domain error codes` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. `UnknownDomainException` con `code = 'UNKNOWN_CODE'`. |
| **3. Datos de Entrada** | `{ code: 'UNKNOWN_CODE', message: 'Unknown domain error' }` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status. |
| **5. Resultado Esperado** | `HttpStatus.BAD_REQUEST` (400). |
| **6. Resultado Obtenido** | PASS. Status 400. |
| **7. Estado Final** | `PASS` |

#### TC-U-021 · HttpException con respuesta string

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-021` — `GlobalExceptionFilter › HttpException handling › should handle HttpException with string response` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. |
| **3. Datos de Entrada** | `new HttpException('Bad request', 400)` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status y body. |
| **5. Resultado Esperado** | 400 con `message: 'Bad request'`. |
| **6. Resultado Obtenido** | PASS. Status 400 y mensaje preservado. |
| **7. Estado Final** | `PASS` |

#### TC-U-022 · HttpException con arreglo de mensajes

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-022` — `GlobalExceptionFilter › HttpException handling › should handle HttpException with object response containing message array` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. |
| **3. Datos de Entrada** | `new HttpException({ message: ['field1 is required', 'field2 is invalid'], error: 'Validation' }, 400)` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status, `code` y `message`. |
| **5. Resultado Esperado** | 400, `code: 'Validation'`, `message: 'field1 is required, field2 is invalid'`. |
| **6. Resultado Obtenido** | PASS. Mensajes unidos con `, `. |
| **7. Estado Final** | `PASS` |

#### TC-U-023 · HttpException con mensaje string en objeto

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-023` — `GlobalExceptionFilter › HttpException handling › should handle HttpException with object response containing string message` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. |
| **3. Datos de Entrada** | `new HttpException({ message: 'Not found', error: 'Error' }, 404)` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status y mensaje. |
| **5. Resultado Esperado** | 404 con `message: 'Not found'`. |
| **6. Resultado Obtenido** | PASS. Status y mensaje correctos. |
| **7. Estado Final** | `PASS` |

#### TC-U-024 · Excepción desconocida retorna 500

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-024` — `GlobalExceptionFilter › unknown exception handling › should return 500 for unknown exceptions` |
| **2. Precondiciones** | Filtro y mocks HTTP listos; `Logger.error` silenciado. |
| **3. Datos de Entrada** | `new Error('Something went wrong')` |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Verificar status y body. |
| **5. Resultado Esperado** | 500, `code: 'INTERNAL_SERVER_ERROR'`, `message: 'An unexpected error occurred.'` |
| **6. Resultado Obtenido** | PASS. Respuesta genérica 500. |
| **7. Estado Final** | `PASS` |

#### TC-U-025 · La respuesta incluye timestamp

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-025` — `GlobalExceptionFilter › response format › should include timestamp in the response` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. |
| **3. Datos de Entrada** | `TestDomainException`; request `GET /test`. |
| **4. Pasos** | 1. Ejecutar el filtro.<br>2. Extraer el primer argumento de `json`.<br>3. Validar `timestamp`. |
| **5. Resultado Esperado** | `timestamp` definido y parseable a fecha válida. |
| **6. Resultado Obtenido** | PASS. `new Date(timestamp).getTime()` no es `NaN`. |
| **7. Estado Final** | `PASS` |

#### TC-U-026 · La respuesta incluye method y path

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-026` — `GlobalExceptionFilter › response format › should include method and path from request` |
| **2. Precondiciones** | Filtro y mocks HTTP listos. |
| **3. Datos de Entrada** | Request mockeado con `method: 'POST'`, `originalUrl: '/inventory/adjustments'`. |
| **4. Pasos** | 1. Modificar método y URL del request.<br>2. Ejecutar el filtro.<br>3. Verificar body. |
| **5. Resultado Esperado** | `method: 'POST'` y `path: '/inventory/adjustments'`. |
| **6. Resultado Obtenido** | PASS. Ambos campos presentes y correctos. |
| **7. Estado Final** | `PASS` |

### 1.4 `create-purchase-order.use-case.spec.ts` (11 casos)

#### TC-U-027 · ProductNotFoundError al crear orden

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-027` — `CreatePurchaseOrderUseCase › when product is not found › should throw ProductNotFoundError` |
| **2. Precondiciones** | Repositorios de orden, producto y alerta mockeados; `productRepository.findById` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'non-existent', supplierId: 'sup-uuid', quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Configurar `findById` → `null`.<br>2. Ejecutar el caso de uso.<br>3. Verificar rechazo. |
| **5. Resultado Esperado** | `ProductNotFoundError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-028 · MANUAL con alertId es rechazado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-028` — `CreatePurchaseOrderUseCase › when source is MANUAL › should throw AlertIdNotAllowedForManualError if alertId is provided` |
| **2. Precondiciones** | `findById` resuelve producto mock. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'MANUAL', alertId: 'some-alert' }` |
| **4. Pasos** | 1. Resolver producto.<br>2. Ejecutar.<br>3. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertIdNotAllowedForManualError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-029 · Creación MANUAL sin alertId

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-029` — `CreatePurchaseOrderUseCase › when source is MANUAL › should create order without alertId` |
| **2. Precondiciones** | Producto mock; `purchaseOrderRepository.save` resuelve orden `PENDING`/`MANUAL`/`alertId: null`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar caso de uso.<br>2. Verificar llamada a `save`.<br>3. Comparar resultado. |
| **5. Resultado Esperado** | `save` invocado y resultado idéntico a la orden guardada. |
| **6. Resultado Obtenido** | PASS. Orden persistida (mock) y retornada. |
| **7. Estado Final** | `PASS` |

#### TC-U-030 · LOW_STOCK_ALERT sin alertId es rechazado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-030` — `CreatePurchaseOrderUseCase › when source is LOW_STOCK_ALERT › should throw AlertNotActiveError if alertId is not provided` |
| **2. Precondiciones** | Producto mock. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-031 · LOW_STOCK_ALERT sin alerta activa es rechazado

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-031` — `CreatePurchaseOrderUseCase › when source is LOW_STOCK_ALERT › should throw AlertNotActiveError if no active alert exists` |
| **2. Precondiciones** | `findById` resuelve producto; `alertRepository.findActiveByProductId` resuelve `null`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT', alertId: 'alert-uuid' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-032 · LOW_STOCK_ALERT con alertId que no coincide

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-032` — `CreatePurchaseOrderUseCase › when source is LOW_STOCK_ALERT › should throw AlertNotActiveError if alertId does not match active alert` |
| **2. Precondiciones** | Alerta activa retornada con id `different-alert`. |
| **3. Datos de Entrada** | `alertId: 'alert-uuid'` (no coincide). |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `AlertNotActiveError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-033 · LOW_STOCK_ALERT con alertId coincidente

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-033` — `CreatePurchaseOrderUseCase › when source is LOW_STOCK_ALERT › should create order when alertId matches active alert` |
| **2. Precondiciones** | Alerta activa `alert-uuid`; `save` resuelve orden con `source: 'LOW_STOCK_ALERT'` y `alertId: 'alert-uuid'`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'LOW_STOCK_ALERT', alertId: 'alert-uuid' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar `save`.<br>3. Comparar resultado. |
| **5. Resultado Esperado** | Orden creada y guardada. |
| **6. Resultado Obtenido** | PASS. Resultado igual a la orden guardada. |
| **7. Estado Final** | `PASS` |

#### TC-U-034 · Cantidad menor a 2× minStock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-034` — `CreatePurchaseOrderUseCase › quantity validation (minStock * 2) › should throw InvalidQuantityForOrderError when quantity is less than 2x minStock` |
| **2. Precondiciones** | Producto con `minStock: 10`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 19, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidQuantityForOrderError` (19 < 20). |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-035 · Cantidad igual a 2× minStock − 1

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-035` — `CreatePurchaseOrderUseCase › quantity validation (minStock * 2) › should throw InvalidQuantityForOrderError when quantity equals 2x minStock - 1` |
| **2. Precondiciones** | Producto con `minStock: 10`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 19, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidQuantityForOrderError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. **Caso redundante:** mismos datos y aserción que TC-U-034. |
| **7. Estado Final** | `PASS` |

#### TC-U-036 · Cantidad exactamente 2× minStock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-036` — `CreatePurchaseOrderUseCase › quantity validation (minStock * 2) › should allow order when quantity equals exactly 2x minStock` |
| **2. Precondiciones** | Producto `minStock: 10`; `save` resuelve orden con `quantity: 20`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 20, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar resolución. |
| **5. Resultado Esperado** | Orden creada (límite inclusivo permitido). |
| **6. Resultado Obtenido** | PASS. `resolves.toEqual(savedOrder)`. |
| **7. Estado Final** | `PASS` |

#### TC-U-037 · Cantidad mayor a 2× minStock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-037` — `CreatePurchaseOrderUseCase › quantity validation (minStock * 2) › should allow order when quantity is greater than 2x minStock` |
| **2. Precondiciones** | Producto `minStock: 10`; `save` resuelve orden con `quantity: 50`. |
| **3. Datos de Entrada** | `{ productId: 'prod-uuid', supplierId: 'sup-uuid', quantity: 50, source: 'MANUAL' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar resolución. |
| **5. Resultado Esperado** | Orden creada. |
| **6. Resultado Obtenido** | PASS. Orden retornada correctamente. |
| **7. Estado Final** | `PASS` |

### 1.5 `approve-purchase-order.use-case.spec.ts` (5 casos)

#### TC-U-038 · Orden inexistente al aprobar

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-038` — `ApprovePurchaseOrderUseCase › when order is not found › should throw PurchaseOrderNotFoundError` |
| **2. Precondiciones** | `purchaseOrderRepository.findById` resuelve `null`. |
| **3. Datos de Entrada** | `execute('non-existent')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `PurchaseOrderNotFoundError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-039 · Aprobar orden PENDING

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-039` — `ApprovePurchaseOrderUseCase › when order is in PENDING status › should approve the order` |
| **2. Precondiciones** | Orden mock `status: 'PENDING'`; `updateStatus` resuelve orden `APPROVED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Resolver orden PENDING.<br>2. Ejecutar.<br>3. Verificar llamada y estado. |
| **5. Resultado Esperado** | `updateStatus('order-uuid', 'APPROVED')` y `status === 'APPROVED'`. |
| **6. Resultado Obtenido** | PASS. Transición aplicada. |
| **7. Estado Final** | `PASS` |

#### TC-U-040 · Transición inválida desde APPROVED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-040` — `ApprovePurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from APPROVED` |
| **2. Precondiciones** | Orden mock `status: 'APPROVED'`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-041 · Transición inválida desde REJECTED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-041` — `ApprovePurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from REJECTED` |
| **2. Precondiciones** | Orden mock `status: 'REJECTED'`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-042 · Transición inválida desde RECEIVED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-042` — `ApprovePurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from RECEIVED` |
| **2. Precondiciones** | Orden mock `status: 'RECEIVED'`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

### 1.6 `reject-purchase-order.use-case.spec.ts` (5 casos)

#### TC-U-043 · Orden inexistente al rechazar

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-043` — `RejectPurchaseOrderUseCase › when order is not found › should throw PurchaseOrderNotFoundError` |
| **2. Precondiciones** | `findById` resuelve `null`. |
| **3. Datos de Entrada** | `execute('non-existent', { rejectionReason: 'Not needed' })` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `PurchaseOrderNotFoundError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-044 · Rechazar orden PENDING con motivo

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-044` — `RejectPurchaseOrderUseCase › when order is in PENDING status › should reject the order with a reason` |
| **2. Precondiciones** | Orden PENDING; `updateStatus` resuelve orden `REJECTED` con `rejectionReason: 'Not needed'`. |
| **3. Datos de Entrada** | `execute('order-uuid', { rejectionReason: 'Not needed' })` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar argumentos y resultado. |
| **5. Resultado Esperado** | `updateStatus('order-uuid', 'REJECTED', 'Not needed')`; estado y motivo correctos. |
| **6. Resultado Obtenido** | PASS. Motivo y estado persistidos (mock). |
| **7. Estado Final** | `PASS` |

#### TC-U-045 · Rechazo inválido desde APPROVED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-045` — `RejectPurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from APPROVED` |
| **2. Precondiciones** | Orden `APPROVED`. |
| **3. Datos de Entrada** | `{ rejectionReason: 'Changed mind' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-046 · Rechazo inválido desde REJECTED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-046` — `RejectPurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from REJECTED` |
| **2. Precondiciones** | Orden `REJECTED`. |
| **3. Datos de Entrada** | `{ rejectionReason: 'Already rejected' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-047 · Rechazo inválido desde RECEIVED

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-047` — `RejectPurchaseOrderUseCase › when order is not in PENDING status › should throw InvalidOrderStatusTransitionError from RECEIVED` |
| **2. Precondiciones** | Orden `RECEIVED`. |
| **3. Datos de Entrada** | `{ rejectionReason: 'Too late' }` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

### 1.7 `receive-purchase-order.use-case.spec.ts` (6 casos)

#### TC-U-048 · Orden inexistente al recibir

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-048` — `ReceivePurchaseOrderUseCase › when order is not found › should throw PurchaseOrderNotFoundError` |
| **2. Precondiciones** | `findById` resuelve `null`. |
| **3. Datos de Entrada** | `execute('non-existent')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `PurchaseOrderNotFoundError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-049 · Recibir orden APPROVED y ajustar stock

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-049` — `ReceivePurchaseOrderUseCase › when order is in APPROVED status › should receive the order, adjust stock, and update status` |
| **2. Precondiciones** | Orden `APPROVED` con `quantity: 20`; `adjustStockUseCase.execute` resuelve stock 40; `updateStatus` resuelve orden `RECEIVED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Resolver orden.<br>2. Ejecutar.<br>3. Verificar llamada a ajuste, cambio de estado y stock. |
| **5. Resultado Esperado** | `adjustStock` con `{ productId, type: 'INCOMING', quantity: 20, reason: 'Purchase order received: order-uuid' }`; orden `RECEIVED`; stock 40. |
| **6. Resultado Obtenido** | PASS. Las tres aserciones se cumplen. |
| **7. Estado Final** | `PASS` |

#### TC-U-050 · Recibir orden y devolver alerta resuelta

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-050` — `ReceivePurchaseOrderUseCase › when order is in APPROVED status › should return alert data when alert is resolved` |
| **2. Precondiciones** | Orden APPROVED; el ajuste de stock devuelve `alert: { id: 'alert-uuid', status: 'RESOLVED' }`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Comparar `stockAdjustment.alert`. |
| **5. Resultado Esperado** | `stockAdjustment.alert` igual a `{ id: 'alert-uuid', status: 'RESOLVED' }`. |
| **6. Resultado Obtenido** | PASS. Alerta propagada correctamente. |
| **7. Estado Final** | `PASS` |

#### TC-U-051 · Recibir desde PENDING es inválido

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-051` — `ReceivePurchaseOrderUseCase › when order is not in APPROVED status › should throw InvalidOrderStatusTransitionError from PENDING` |
| **2. Precondiciones** | Orden `PENDING`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-052 · Recibir desde REJECTED es inválido

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-052` — `ReceivePurchaseOrderUseCase › when order is not in APPROVED status › should throw InvalidOrderStatusTransitionError from REJECTED` |
| **2. Precondiciones** | Orden `REJECTED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

#### TC-U-053 · Recibir desde RECEIVED es inválido

| Campo | Descripción / Contenido |
| :--- | :--- |
| **1. Identificador** | `TC-U-053` — `ReceivePurchaseOrderUseCase › when order is not in APPROVED status › should throw InvalidOrderStatusTransitionError from RECEIVED` |
| **2. Precondiciones** | Orden `RECEIVED`. |
| **3. Datos de Entrada** | `execute('order-uuid')` |
| **4. Pasos** | 1. Ejecutar.<br>2. Verificar rechazo. |
| **5. Resultado Esperado** | `InvalidOrderStatusTransitionError`. |
| **6. Resultado Obtenido** | PASS. Error esperado. |
| **7. Estado Final** | `PASS` |

---

## 2. Hallazgos Reproducibles y Evidencias

### F-05 (Media) · Caso duplicado en validación de cantidad

- **Descripción:** `src/modules/purchase-orders/application/use-cases/create-purchase-order.use-case.spec.ts:214` y `:231` declaran dos pruebas con el mismo `minStock: 10` y `quantity: 19`, y la misma aserción (`InvalidQuantityForOrderError`). La segunda no aporta un escenario nuevo.
- **Severidad:** Media (deuda técnica en tests).
- **Pasos para reproducirlo:**
  1. Abrir el archivo y comparar ambos bloques `it`.
  2. Ejecutar `npm run test:unit` y observar que ambas pruebas pasan por la misma rama.
  3. Cambiar temporalmente una aserción de la segunda prueba: sigue pasando por el mismo camino, confirmando la duplicación.
- **Evidencia visual sugerida:** Captura de ambos bloques `it` resaltados y del reporte de Jest mostrando los dos nombres.
- **Logs de ejecución:**
  ```text
  Test Suites: 7 passed, 7 total
  Tests:       53 passed, 53 total
  ```

### Observación (Baja) · Sin cobertura de caminos de borde en entidades

- **Descripción:** No se prueban cantidades negativas en `increaseStock`/`decreaseStock`, precios negativos ni `minStock` negativo a nivel de entidad. La validación de DTO cubre la API, pero la entidad no protege esos invariantes.
- **Severidad:** Baja.
- **Pasos para reproducirlo:** Buscar en `product.entity.spec.ts` casos con valores negativos o `NaN`; no existen.
- **Evidencia visual sugerida:** Captura del archivo de test y del reporte de cobertura de `Product` (no se generó cobertura para no escribir fuera de `casos-prueba/`).
- **Logs de ejecución:** No aplica (análisis estático).

### Conclusión de la suite unitaria

La suite unitaria **pasó sin fallos** (53/53). Los únicos hallazgos son de deuda técnica y cobertura, no de comportamiento. Puntos ciegos principales: módulos `categories` y `suppliers`, caso de uso `CreateProduct`, casos de uso `Find*` (inventario, alertas, órdenes) y presenters/controllers.

---

## 3. Entorno, Herramientas y Recursos de Prueba

### Herramientas y frameworks

| Herramienta | Versión / Uso |
| :--- | :--- |
| Node.js | `v24.21.0` (entorno de ejecución auditado) |
| npm | `11.19.0` |
| Jest | `30.4.1` |
| ts-jest | `^29.2.5` |
| `@nestjs/testing` | `^11.0.1` (solo en la app E2E; la suite unitaria no levanta Nest) |
| TypeScript | `^5.7.3` |

### Scripts de ejecución

| Comando | Propósito |
| :--- | :--- |
| `npm run test:unit` | Ejecuta solo `*.spec.ts` dentro de `src/`, excluyendo `*.integration.spec.ts` mediante el patrón `src/.*(?<!\.integration)\.spec\.ts$`. |
| `npm test` | Ejecuta Jest con la configuración de `package.json` (`rootDir: src`, `testRegex: .*(?<!\.integration)\.spec\.ts$`). Es el comando usado por CI. |
| `npm run test:watch` | Modo watch de Jest (misma configuración que `npm test`). |
| `npm run test:cov` | Ejecuta con cobertura; escribe en `../coverage` (no ejecutado en esta auditoría para no crear archivos fuera de `casos-prueba/`). |
| `npm run test:debug` | Depuración con inspector. |

### Configuraciones requeridas

- **Configuración Jest:** bloque `jest` de `package.json`.
  - `moduleFileExtensions`: `js`, `json`, `ts`.
  - `rootDir`: `src`.
  - `testRegex`: `.*(?<!\.integration)\.spec\.ts$`.
  - `testPathIgnorePatterns`: `/node_modules/` y `\\.integration\\.spec\\.ts$`.
  - `transform`: `ts-jest`.
  - `moduleNameMapper`: `^src/(.*)$` → `<rootDir>/$1`.
  - `testEnvironment`: `node`.
- **TypeScript:** `tsconfig.json` con resolución de paths para imports `src/...`.
- **Variables de entorno:** no se requieren para esta suite (no hay conexión a base de datos). `PrismaService` importa `dotenv/config`, pero no es instanciado por las pruebas unitarias.
- **Servicios externos:** ninguno.

### Datos de prueba (fixtures / mocks)

| Ubicación | Descripción |
| :--- | :--- |
| `adjust-stock.use-case.spec.ts:14` | Fábrica `mockProduct` con `id: 'prod-uuid'`, stock 20, mínimo 5 y métodos mockeados. |
| `adjust-stock.use-case.spec.ts:32` | Mocks de `InventoryRepository` (`adjustStock`) y `ProductRepository` (`findAll`, `findById`, `findBySku`, `findByFilters`, `save`, `update`). |
| `create-purchase-order.use-case.spec.ts:18` | Fábrica `mockProduct`. |
| `create-purchase-order.use-case.spec.ts:35` | Fábrica `mockAlert` (`id: 'alert-uuid'`, `type: 'LOW_STOCK'`, `status: 'ACTIVE'`). |
| `approve/reject/receive-purchase-order.use-case.spec.ts` | Fábrica `mockOrder` con estado por defecto `PENDING` (o `APPROVED` en receive) y `overrides`. |
| `product.entity.spec.ts:5` | `defaultProps` con nombre, SKU, categoría, proveedor, precio 25.5, stock 20 y mínimo 5. |
| `global-exception.filter.spec.ts:11-25` | Clases `TestDomainException` y `UnknownDomainException`. |
| `global-exception.filter.spec.ts:47-62` | Mocks de `Response`, `Request` y `ArgumentsHost`; spy sobre `Logger.prototype.error`. |

No se usan fixtures en disco ni seeds de base de datos en esta suite.

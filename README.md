# Mercado Express

API REST para la gestión de inventario y órdenes de compra. Desarrollada como prueba técnica demostrando Clean Architecture, diseño orientado a dominio, operaciones transaccionales de inventario y despliegue automatizado en AWS.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Arquitectura](#arquitectura)
  - [Por qué Clean Architecture](#por-qué-clean-architecture)
  - [Responsabilidades de cada Capa](#responsabilidades-de-cada-capa)
  - [Capa Transversal](#capa-transversal-shared)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación Local](#instalación-local)
  - [Requisitos Previos](#requisitos-previos)
  - [Clonar el Repositorio](#1-clonar-el-repositorio)
  - [Configurar Variables de Entorno](#2-configurar-variables-de-entorno)
  - [Ejecutar con Docker Compose](#3-ejecutar-con-docker-compose)
  - [Aplicar Migraciones](#4-aplicar-migraciones)
  - [Generar Cliente Prisma](#5-generar-cliente-prisma)
  - [Iniciar la Aplicación](#6-iniciar-la-aplicación)
  - [Inicio Rápido](#inicio-rápido)
- [Documentación de la API](#documentación-de-la-api)
- [Pruebas](#pruebas)
- [Despliegue](#despliegue)
  - [Flujo de Despliegue](#flujo-de-despliegue)
  - [Rol de cada Servicio](#rol-de-cada-servicio)
  - [Variables de Entorno de Producción](#variables-de-entorno-de-producción)
- [Reglas de Negocio](#reglas-de-negocio)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Mejoras Futuras](#mejoras-futuras)

---

## Descripción

Mercado Express es un sistema backend que gestiona **productos**, **categorías**, **proveedores**, **transacciones de inventario**, **alertas de stock bajo** y **órdenes de compra**. Ofrece:

- CRUD de productos con validación de unicidad de SKU.
- Gestión de categorías y proveedores con eliminación lógica (soft delete).
- Ajustes de stock (entradas/salidas) con garantías transaccionales atómicas.
- Creación y resolución automática de alertas de stock bajo vinculadas a movimientos de inventario.
- Ciclo de vida de órdenes de compra (crear, aprobar, rechazar, recibir) con transiciones de estado estrictas.
- Consultas filtradas y paginadas en todas las entidades principales.

---

## Tecnologías

| Tecnología                                                          | Propósito                                    |
| ------------------------------------------------------------------- | -------------------------------------------- |
| [NestJS](https://nestjs.com/)                                       | Framework de aplicación                      |
| [TypeScript](https://www.typescriptlang.org/)                       | Lenguaje (módulo nodeNext)                   |
| [Prisma](https://www.prisma.io/)                                    | ORM con `@prisma/adapter-pg` (driver nativo) |
| [PostgreSQL](https://www.postgresql.org/)                           | Base de datos relacional                     |
| [Docker](https://www.docker.com/)                                   | Contenedorización multi-etapa                |
| [Docker Compose](https://docs.docker.com/compose/)                  | Orquestación de servicios (dev y prod)       |
| [Jest](https://jestjs.io/)                                          | Pruebas unitarias, de integración y E2E      |
| [Supertest](https://github.com/ladakh/supertest)                    | Aserciones HTTP para pruebas E2E             |
| [Swagger](https://swagger.io/)                                      | Documentación de la API en `/docs`           |
| [Helmet](https://helmetjs.github.io/)                               | Headers de seguridad HTTP                    |
| [class-validator](https://github.com/typestack/class-validator)     | Validación de DTOs de entrada                |
| [class-transformer](https://github.com/typestack/class-transformer) | Transformación de objetos                    |
| [ESLint](https://eslint.org/)                                       | Linting (flat config, type-checked)          |
| [Prettier](https://prettier.io/)                                    | Formateo de código                           |
| [GitHub Actions](https://github.com/features/actions)               | CI/CD automatizado                           |
| [Amazon ECR](https://aws.amazon.com/ecr/)                           | Registro de imágenes Docker                  |
| [Amazon EC2](https://aws.amazon.com/ec2/)                           | Infraestructura de cómputo en la nube        |
| [Amazon RDS](https://aws.amazon.com/rds/)                           | Base de datos PostgreSQL gestionada          |
| [Caddy](https://caddyserver.com/)                                   | Reverse proxy con HTTPS automático           |

---

## Arquitectura

El proyecto sigue los principios de **Clean Architecture** adaptados al ecosistema NestJS, organizado en cuatro capas distintas por módulo.

### ¿Por qué Clean Architecture?

Elegí Clean Architecture porque desde el inicio planteé este proyecto como la base de un sistema de inventario más completo, no únicamente como un CRUD. Sabía que el dominio iba a crecer con nuevas funcionalidades y reglas de negocio, por lo que preferí una estructura que facilitara su evolución y mantenimiento en el tiempo.

Uno de mis principales objetivos fue mantener la lógica del negocio separada de la infraestructura. Reglas como impedir que el stock quede negativo, mantener una única alerta activa por producto, validar los cambios de estado de una orden o cerrar automáticamente una alerta cuando el inventario se recupera pertenecen al dominio del negocio y no deberían depender del framework, del ORM o de la base de datos utilizada.

Esta arquitectura también me permitió concentrar en los casos de uso operaciones que implican varios pasos. Por ejemplo, al ajustar el inventario no solo se actualiza el stock, sino que también se registra el movimiento y se evalúa si es necesario crear o cerrar una alerta. De forma similar, al recibir una orden de compra se incrementa el inventario, se registra el movimiento correspondiente y se resuelve automáticamente la alerta asociada cuando aplica. Mantener esa coordinación en un solo lugar hace que el comportamiento del sistema sea más fácil de entender y mantener.

Otro aspecto importante fue reducir el acoplamiento con la infraestructura. Gracias al uso de interfaces y repositorios, la lógica del negocio permanece independiente de PostgreSQL y Prisma, lo que facilita reemplazar estas tecnologías en el futuro sin afectar el dominio. Además, si el proyecto continúa creciendo y en algún momento surge la necesidad de evolucionar hacia una arquitectura de microservicios, esta separación facilitaría ese proceso al tener las responsabilidades claramente definidas desde el inicio.

Finalmente, aunque para un proyecto pequeño esta arquitectura podría parecer excesiva, considero que en este caso fue una decisión acertada. La cantidad de reglas de negocio, la interacción entre varias entidades y la posibilidad de seguir ampliando el sistema justifican una estructura que priorice la mantenibilidad, la escalabilidad y la claridad del código desde el inicio.

### Responsabilidades de cada Capa

```
Dominio          →  Entidades, interfaces de repositorio, errores de dominio
Aplicación       →  Casos de uso (orquestan la lógica de dominio), DTOs de aplicación
Infraestructura  →  Implementaciones de repositorio en Prisma, mappers (Prisma ↔ Dominio)
Presentación     →  Controllers, DTOs de request/response, decoradores Swagger, presenters
```

### Capa Transversal (shared/)

```
shared/
  database/       →  PrismaService (gestión del ciclo de vida, conexión)
  domain/errors/  →  Clase base DomainException, DTO ErrorResponse
  pagination/     →  DTOs genéricos de paginación (request, metadata, response)
  presentation/   →  GlobalExceptionFilter, decoradores de error de Swagger
```

---

## Estructura del Proyecto

```
mercado-express/
├── .github/
│   └── workflows/
│       └── deploy.yaml              # CI/CD: build, test, push a ECR, deploy a EC2
├── docker/
│   └── entrypoint.sh                # Migraciones automáticas al iniciar el contenedor
├── prisma/
│   └── schema.prisma                # Esquema de base de datos, enums, índices
├── src/
│   ├── main.ts                      # Bootstrap: pipes, filters, Swagger, CORS, Helmet
│   ├── app.module.ts                # Módulo raíz
│   ├── modules/
│   │   ├── categories/              # CRUD de categorías
│   │   ├── suppliers/               # CRUD de proveedores
│   │   ├── products/                # CRUD de productos con unicidad de SKU
│   │   ├── inventory/               # Ajustes de stock + gestión de alertas
│   │   └── purchase-orders/         # Ciclo de vida de órdenes de compra
│   └── shared/
│       ├── database/                # PrismaService
│       ├── domain/errors/           # DomainException, ErrorResponse
│       ├── pagination/              # Tipos genéricos de paginación
│       └── presentation/            # GlobalExceptionFilter, decoradores Swagger
├── test/
│   ├── helpers/                     # Limpieza de BD de prueba, fábrica de apps de test
│   ├── modules/                     # Pruebas E2E por módulo
│   ├── jest-e2e.json                # Configuración de pruebas E2E
│   └── jest-integration.json        # Configuración de pruebas de integración
├── compose.yaml                     # Docker Compose (desarrollo local)
├── compose.prod.yaml                # Docker Compose (producción)
├── Dockerfile                       # Build multi-etapa (Node 22 Alpine)
├── eslint.config.mjs                # Configuración flat de ESLint
├── tsconfig.json                    # Configuración de TypeScript
└── package.json                     # Scripts y dependencias
```

---

## Instalación Local

### Requisitos Previos

| Software                | Versión                       |
| ----------------------- | ----------------------------- |
| Node.js                 | >= 18.0 (recomendado: 22 LTS) |
| npm                     | >= 9.0                        |
| Docker + Docker Compose | >= 20.10                      |

### 1. Clonar el Repositorio

```bash
# HTTPS
git clone https://github.com/Jean-Carlos-L/mercado-express.git

# SSH
git clone git@github.com:Jean-Carlos-L/mercado-express.git

cd mercado-express
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con la configuración de tu base de datos:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mercado_express?schema=public"
PORT=3000
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
NODE_ENV=development
```

| Variable          | Descripción                      | Valor por defecto                             |
| ----------------- | -------------------------------- | --------------------------------------------- |
| `DATABASE_URL`    | Cadena de conexión a PostgreSQL  | Obligatoria                                   |
| `PORT`            | Puerto de escucha del servidor   | `3000`                                        |
| `ALLOWED_ORIGINS` | Orígenes CORS separados por coma | `http://localhost:3000,http://localhost:5173` |
| `NODE_ENV`        | Entorno de ejecución             | `development`                                 |

### 3. Ejecutar con Docker Compose

```bash
docker compose up -d
```

Esto inicia:

- **PostgreSQL 16** en el puerto `5432` con la base de datos `mercado_express`.
- **API** en el puerto `3000` (solo si usas `compose.yaml` completo).

El servicio `postgres` incluye un healthcheck que verifica que la base de datos esté lista antes de aceptar conexiones.

### 4. Aplicar Migraciones

```bash
npx prisma migrate dev
```

Esto crea todas las tablas definidas en `prisma/schema.prisma`: `categories`, `suppliers`, `products`, `inventory_transactions`, `alerts` y `purchase_orders`.

### 5. Generar Cliente Prisma

```bash
npx prisma generate
```

Genera el cliente Prisma optimizado en `node_modules/.prisma/client`. Este paso es necesario para que TypeScript reconozca los tipos generados por Prisma.

### 6. Iniciar la Aplicación

```bash
npm run start:dev
```

La API estará disponible en `http://localhost:3000`. La documentación Swagger se encuentra en `http://localhost:3000/docs`.

### Inicio Rápido

```bash
git clone git@github.com:Jean-Carlos-L/mercado-express.git
cd mercado-express
cp .env.example .env
npm install
docker compose up -d
npx prisma migrate dev
npx prisma generate
npm run start:dev
```

---

## Documentación de la API

Swagger UI está disponible en:

```
http://localhost:3000/docs
```

### Resumen de Endpoints

| Método  | Endpoint                       | Descripción                                   |
| ------- | ------------------------------ | --------------------------------------------- |
| `POST`  | `/categories`                  | Crear una categoría                           |
| `GET`   | `/categories`                  | Listar categorías (paginado)                  |
| `POST`  | `/suppliers`                   | Crear un proveedor                            |
| `GET`   | `/suppliers`                   | Listar proveedores (paginado)                 |
| `POST`  | `/products`                    | Crear un producto                             |
| `POST`  | `/inventory/adjustments`       | Ajustar stock (entrada/salida)                |
| `GET`   | `/inventory`                   | Consultar productos con filtros               |
| `GET`   | `/inventory/alerts`            | Listar alertas de stock bajo                  |
| `POST`  | `/purchase-orders`             | Crear una orden de compra                     |
| `GET`   | `/purchase-orders`             | Listar órdenes de compra (filtrado, paginado) |
| `PATCH` | `/purchase-orders/:id/approve` | Aprobar una orden pendiente                   |
| `PATCH` | `/purchase-orders/:id/reject`  | Rechazar una orden pendiente                  |
| `PATCH` | `/purchase-orders/:id/receive` | Recibir una orden aprobada (actualiza stock)  |

---

## Pruebas

El proyecto incluye tres niveles de pruebas:

### Pruebas Unitarias

Validan la lógica de entidades de dominio y casos de uso sin dependencia de base de datos:

```bash
npm run test:unit
```

Cobertura: entidades (`Product`), casos de uso (`CreatePurchaseOrder`, `ApprovePurchaseOrder`, `RejectPurchaseOrder`, `ReceivePurchaseOrder`, `AdjustStock`) y `GlobalExceptionFilter`.

### Pruebas de Integración

Validan los repositorios Prisma contra una base de datos PostgreSQL real:

```bash
# Asegurar que la BD de prueba existe y las migraciones están aplicadas
npm run test:integration:setup
npm run test:integration
```

Cobertura: `PrismaInventoryRepository` (queries SQL raw, alertas), `PrismaPurchaseOrderRepository`, `PrismaAlertRepository`, `PrismaProductRepository`.

### Pruebas E2E

Validan los flujos completos desde peticiones HTTP hasta la base de datos:

```bash
npm run test:e2e
```

Cobertura: endpoints críticos de inventario, órdenes de compra y productos.

### Cobertura

```bash
npm run test:cov
```

Los reportes de cobertura se generan en el directorio `coverage/`.

---

## Despliegue

El proyecto se despliega automáticamente mediante un pipeline CI/CD que integra GitHub Actions, Docker, Amazon ECR y Amazon EC2.

### Flujo de Despliegue

```
Push a master
    ↓
GitHub Actions
    ↓
Instalar dependencias + Prisma generate
    ↓
Ejecutar tests (npm test)
    ↓
Build imagen Docker (multi-etapa)
    ↓
Push a Amazon ECR (tags: latest + SHA)
    ↓
SSH a Amazon EC2
    ↓
docker compose pull (nueva imagen desde ECR)
    ↓
docker compose up -d
    ↓
docker image prune (limpiar imágenes anteriores)
    ↓
Nueva versión desplegada
```

### Rol de cada Servicio

| Servicio           | Rol en la Arquitectura                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Actions** | Orquesta el pipeline CI/CD. Ejecuta tests, construye la imagen Docker y la push a ECR. Luego conecta vía SSH a EC2 para ejecutar el pull y reinicio.                                                      |
| **Amazon ECR**     | Registro privado de imágenes Docker. Almacena las versiones construidas por GitHub Actions y las sirve a EC2 durante el despliegue.                                                                       |
| **Amazon EC2**     | Instancia de cómputo donde se ejecuta la aplicación. Recibe la nueva imagen vía Docker Compose pull, ejecuta las migraciones automáticamente (entrypoint.sh) y expone la API al público.                  |
| **Amazon RDS**     | Base de datos PostgreSQL gestionada por AWS. Proporciona alta disponibilidad, backups automáticos y escalabilidad sin administración del motor de base de datos.                                          |
| **Docker**         | Contenedoriza la aplicación en una imagen multi-etapa (build + producción). Reduce el tamaño de la imagen final y aísla la aplicación del sistema operativo.                                              |
| **Docker Compose** | Define los servicios de la aplicación tanto en desarrollo (`compose.yaml`) como en producción (`compose.prod.yaml`). En producción, gestiona el pull de la imagen desde ECR y el reinicio del contenedor. |
| **Caddy**          | Reverse proxy con generación automática de certificados HTTPS vía Let's Encrypt. Gestiona el tráfico entrante, termina TLS y lo proxea a la aplicación NestJS.                                            |
| **Let's Encrypt**  | Autoridad de certificación que emite certificados SSL/TLS gratuitos. Caddy lo integra automáticamente para habilitar HTTPS en el dominio personalizado.                                                   |

---

## Reglas de Negocio

### Inventario

- **Sin stock negativo**: Los ajustes de stock son rechazados a nivel de base de datos mediante un `UPDATE ... WHERE (current_stock + $1) >= 0` condicional. Si la condición falla, la transacción retorna `null` y la aplicación lanza `InsufficientStockError`.
- **Cambios atómicos de stock**: La actualización de stock, el registro de transacción de inventario y la gestión de alertas se ejecutan dentro de una sola transacción de base de datos. Todo tiene éxito o nada persiste.
- **Historial de transacciones inmutable**: Los registros de `InventoryTransaction` son de solo append. No existen operaciones de actualización o eliminación en el repositorio.

### Alertas de Stock Bajo

- **Creación automática**: Cuando el stock baja a o por debajo de `minStock` y no existe una alerta activa, se crea una alerta `LOW_STOCK` con estado `ACTIVE`.
- **Resolución automática**: Cuando el stock sube por encima de `minStock` y existe una alerta activa, el estado de la alerta cambia a `RESOLVED`.
- **Una alerta activa por producto**: Solo puede existir una alerta `LOW_STOCK` activa a la vez por producto.

### Órdenes de Compra

- **Cantidad mínima de pedido**: `quantity >= 2 × product.minStock`. Las órdenes por debajo de este umbral son rechazadas.
- **Creación consciente del origen**:
  - `MANUAL`: No puede incluir `alertId`.
  - `LOW_STOCK_ALERT`: Debe incluir un `alertId` válido y activo asociado al producto.
- **Máquina de estados estricta**:
  - `PENDING` → `APPROVED` o `REJECTED`
  - `APPROVED` → `RECEIVED`
  - Todas las demás transiciones son rechazadas con `InvalidOrderStatusTransitionError`.
- **Recepción de orden**: Cuando se recibe una orden `APPROVED`, el stock se incrementa automáticamente vía `AdjustStockUseCase` dentro de la misma operación.

### Entidades

- **Unicidad de SKU**: Los productos garantizan SKU único a nivel de capa de aplicación (verificar antes de crear).
- **Eliminación lógica**: Categorías y Proveedores utilizan un flag `is_deleted`. Todas las consultas filtran los registros eliminados lógicamente.
- **Llaves primarias UUID**: Todas las entidades usan UUIDs de PostgreSQL (`@default(uuid())`).

---

## Decisiones Técnicas

### Repository Pattern con Tokens de Inyección de Tipo String

Las interfaces de repositorio se definen en la capa de dominio y se enlazan a implementaciones de Prisma mediante tokens de tipo string (ej. `PRODUCT_REPOSITORY`). Esto desacopla los casos de uso de la infraestructura y facilita el mocking en pruebas unitarias.

### Entidades de Dominio como Clases Simples

Las entidades no están ligadas a modelos de Prisma. Utilizan métodos de fábrica estáticos (`create()`, `restore()`) y propiedades simples, manteniendo la capa de dominio independiente del framework.

### Presenters para Mapeo de Respuestas

Cada módulo tiene una clase `Presenter` con métodos estáticos que convierten entidades de dominio a DTOs de respuesta. Esto mantiene los controllers delgados y centraliza la lógica de transformación de respuestas.

### Manejo Global de Excepciones

Un solo `GlobalExceptionFilter` mapea códigos de error de dominio a estados HTTP mediante una tabla de búsqueda (`STATUS_MAP`). Esto elimina el manejo repetitivo de errores en los controllers y asegura un formato de respuesta de error consistente.

### SQL Condicional para Actualizaciones de Stock

Los ajustes de stock usan `$executeRawUnsafe` con una cláusula `WHERE` en lugar de un leer-then-escribir a nivel de aplicación. Esto previene condiciones de carrera y garantiza atomicidad sin bloqueos explícitos a nivel de fila.

### Decoradores de Error en Swagger

Cada endpoint del controller usa decoradores Swagger específicos (ej. `@ApiProductAlreadyExistsError()`) en lugar de respuestas de error genéricas. Esto produce documentación precisa y específica por endpoint en Swagger UI.

### Build Multi-Etapa en Docker

El `Dockerfile` utiliza dos etapas: una de build con todas las dependencias de desarrollo y una de producción solo con las dependencias necesarias. Esto reduce significativamente el tamaño de la imagen final y mejora la seguridad al minimizar el software expuesto.

### Entrypoint con Migraciones Automáticas

El `entrypoint.sh` ejecuta `npx prisma migrate deploy` antes de iniciar la aplicación. Esto garantiza que la base de datos esté actualizada cada vez que se despliega una nueva versión, sin intervención manual.

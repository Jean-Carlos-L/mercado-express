import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/products/product.module';
import { CategoryModule } from './modules/categories/category.module';
import { SupplierModule } from './modules/suppliers/supplier.module';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [ProductModule, CategoryModule, SupplierModule, InventoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

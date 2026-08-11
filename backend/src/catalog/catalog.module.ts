import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogSeedService } from './seed/catalog-seed.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogSeedService],
  exports: [CatalogService],
})
export class CatalogModule {}

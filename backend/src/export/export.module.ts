import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { TerraformGeneratorService } from './generators/terraform.generator';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';

@Module({
  imports: [PrismaModule, GraphModule],
  controllers: [ExportController],
  providers: [ExportService, TerraformGeneratorService],
  exports: [ExportService],
})
export class ExportModule {}

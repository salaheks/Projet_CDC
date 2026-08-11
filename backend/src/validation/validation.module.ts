import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';

@Module({
  imports: [PrismaModule, GraphModule],
  controllers: [ValidationController],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ValidationModule {}

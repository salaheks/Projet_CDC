import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll(@Query('provider') provider?: string) {
    return this.catalogService.findAll(provider);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.catalogService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }
}

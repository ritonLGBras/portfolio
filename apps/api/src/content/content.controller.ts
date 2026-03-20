import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get(':section')
  async getSection(@Param('section') section: string) {
    if (section === 'projects') {
      return this.contentService.getProjects();
    }
    return this.contentService.getSection(section);
  }
}

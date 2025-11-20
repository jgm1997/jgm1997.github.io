import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { TagService } from './tag.service';
import { CreateTagDto } from 'src/dto/tag';

@UseGuards(AuthGuard)
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  getAllTags(@Req() req) {
    return this.tagService.getAllTags(req.user);
  }

  @Get(':id')
  getTag(@Param('id') id: string, @Req() req) {
    return this.tagService.getTag(id, req.user);
  }

  @Post()
  createTag(@Req() req, @Body() dto: CreateTagDto) {
    return this.tagService.createTag(req.user.sub, dto);
  }

  @Put(':id')
  updateTag(@Param('id') id: string, @Req() req, @Body() dto) {
    return this.tagService.updateTag(id, req.user, dto);
  }

  @Delete(':id')
  deleteTag(@Param('id') id: string, @Req() req) {
    return this.tagService.deleteTag(id, req.user);
  }
}

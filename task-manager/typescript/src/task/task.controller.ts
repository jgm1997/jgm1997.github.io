import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TaskService } from './task.service';
import { TagService } from '../tag/tag.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly tagService: TagService,
  ) {}

  @Get()
  getAllTasks(
    @Req() req,
    @Query('task_status') taskStatus?: string,
    @Query('due_before') dueBefore?: string,
    @Query('due_after') dueAfter?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('search_mode') searchMode: 'simple' | 'fulltext' = 'simple',
    @Query('order_by') orderBy: string = 'created_at',
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.taskService.getAllTasks({
      taskStatus,
      dueBefore,
      dueAfter,
      tags,
      search,
      searchMode,
      orderBy,
      order,
      limit,
      offset,
      user: req.user,
    });
  }

  @Get(':id')
  getTask(@Param('id') id: string, @Req() req) {
    return this.taskService.getTask(req.user, id);
  }

  @Post()
  createTask(@Req() req, @Body() dto: CreateTaskDto) {
    return this.taskService.createTask(req.user.sub, dto);
  }

  @Post(':task_id/tags/:tag_id')
  assignTagToTask(@Param('task_id') taskId: string, @Param('tag_id') tagId: string, @Req() req) {
    return this.tagService.assignTagToTask(req.user, taskId, tagId);
  }

  @Put(':id')
  updateTask(@Param('id') id: string, @Req() req, @Body() dto: UpdateTaskDto) {
    return this.taskService.updateTask(req.user, id, dto);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string, @Req() req) {
    return this.taskService.deleteTask(req.user, id);
  }

  @Delete(':task_id/tags/:tag_id')
  unassignTagFromTask(
    @Param('task_id') taskId: string,
    @Param('tag_id') tagId: string,
    @Req() req,
  ) {
    return this.tagService.unassignTagFromTask(req.user, taskId, tagId);
  }
}

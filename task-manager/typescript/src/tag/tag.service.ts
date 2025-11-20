import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { supabase } from 'src/common/supabase.client';
import { CreateTagDto, UpdateTagDto } from 'src/dto/tag';
import { v4 } from 'uuid';

@Injectable()
export class TagService {
  async createTag(user: string, dto: CreateTagDto) {
    const { data: ex, error: errex } = await supabase
      .from('tag')
      .select('id')
      .eq('user', user)
      .eq('name', dto.name);
    if (errex) throw new BadRequestException(errex.message);
    if (ex.length > 0) throw new BadRequestException('Tag with the same name already exists');

    const { data, error } = await supabase.from('tag').insert([{ ...dto, user: user }]);
    if (error || !data) throw new BadRequestException(error.message);
    return data[0];
  }

  async getAllTags(user: any) {
    let query = supabase.from('tag').select('*');
    if (user.role !== 'admin') query = query.eq('user', user.id);
    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getTag(id: string, user: any) {
    const { data, error } = await supabase.from('tag').select('*').eq('pk', id).single();
    if (error || !data) throw new BadRequestException('Tag not found');
    if (user.role !== 'admin' && data.user !== user.sub)
      throw new ForbiddenException('Access denied');
    return data;
  }

  async updateTag(id: string, user: any, dto: UpdateTagDto) {
    await this.getTag(id, user); // Check existence and permissions
    const { data, error } = await supabase.from('tag').update(dto).eq('pk', id);
    if (error || !data) throw new BadRequestException(error.message);
    return data[0];
  }

  async deleteTag(id: string, user: any) {
    const tag = await this.getTag(id, user); // Check existence and permissions
    await supabase.from('task_tag').delete().eq('tag', tag.pk);
    const { error } = await supabase.from('tag').delete().eq('pk', id);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Tag deleted successfully' };
  }

  async assignTagToTask(task: string, tag: string, user: any) {
    const { data: taskData } = await supabase.from('task').select('*').eq('pk', task).single();
    if (!taskData) throw new BadRequestException('Task not found');
    if (user.role !== 'admin' && taskData.user !== user.sub)
      throw new ForbiddenException('Access denied');

    const { data: tagData } = await supabase.from('tag').select('*').eq('pk', tag).single();
    if (!tagData) throw new BadRequestException('Tag not found');
    if (user.role !== 'admin' && tagData.user !== user.sub)
      throw new ForbiddenException('Access denied');

    const { data: exists } = await supabase
      .from('task_tag')
      .select('*')
      .eq('task', task)
      .eq('tag', tag);
    if (exists?.length > 0) throw new BadRequestException('Tag already assigned to task');

    const { data, error } = await supabase
      .from('task_tag')
      .insert([{ pk: v4(), task: task, tag: tag }]);
    if (error || !data) throw new BadRequestException(error.message);
    return data[0];
  }

  async unassignTagFromTask(task: string, tag: string, user: any) {
    const { data: taskData } = await supabase.from('task').select('*').eq('pk', task).single();
    if (!taskData) throw new BadRequestException('Task not found');
    if (user.role !== 'admin' && taskData.user !== user.sub)
      throw new ForbiddenException('Access denied');

    const { error } = await supabase.from('task_tag').delete().eq('task', task).eq('tag', tag);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Tag unassigned from task successfully' };
  }
}

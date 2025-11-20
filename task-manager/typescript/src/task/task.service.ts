import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { supabase } from '../common/supabase.client';
import { CreateTaskDto, UpdateTaskDto } from 'src/dto/task';

@Injectable()
export class TaskService {
  async #getTaskIdsByTagIds(tagIdsCsv?: string) {
    if (!tagIdsCsv) return [];
    const tags = tagIdsCsv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!tags?.length) return [];
    const { data, error } = await supabase.from('task_tag').select('task').in('tag', tags);
    if (error) throw new BadRequestException(error.message);
    return Array.from(new Set(data.map((r) => r.task)));
  }

  async createTask(user: string, dto: CreateTaskDto) {
    const { data, error } = await supabase.from('tasks').insert([{ ...dto, user: user }]);
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No column was inserted');
    return data[0];
  }

  async getAllTasks(opts: {
    taskStatus?: string;
    dueBefore?: string;
    dueAfter?: string;
    tags?: string;
    search?: string;
    searchMode?: 'simple' | 'fulltext';
    orderBy?: string;
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    user?: any;
  }) {
    const {
      taskStatus,
      dueBefore,
      dueAfter,
      tags,
      search,
      searchMode = 'simple',
      orderBy = 'created_at',
      order = 'desc',
      limit = 50,
      offset = 0,
      user,
    } = opts;

    let tasks = await await this.#getTaskIdsByTagIds(tags);
    if (tasks?.length === 0) return [];

    if (search && searchMode === 'fulltext') {
      const { data: ftData, error: ftError } = await supabase.rpc('fts_tasks', { q: search });
      if (ftError) throw new BadRequestException(ftError.message);
      const ftIds = ftData.map((r) => r.id);
      tasks = tasks ? tasks.filter((t) => ftIds!.includes(t)) : ftIds;
      if (!tasks?.length) return [];
    }

    let query = supabase.from('tasks').select('*');
    if (user.role !== 'admin') query = query.eq('user', user.sub);
    if (taskStatus) query = query.eq('status', taskStatus);
    if (dueBefore) query = query.lte('due_date', dueBefore);
    if (dueAfter) query = query.gte('due_date', dueAfter);
    if (tasks) query = query.in('id', tasks);
    if (search && searchMode === 'simple') {
      const ilikeExpr = `%${search}%`;
      query = query.or(`title.ilike.${ilikeExpr},description.ilike.${ilikeExpr}`);
    }
    const asc = order === 'asc';
    query = query.order(orderBy, { ascending: asc }).range(offset, offset + limit - 1);
    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getTask(user: any, id: string) {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (error || !data) throw new Error(error.message);
    if (user.role !== 'admin' && data.user !== user.sub) throw new ForbiddenException();
    return data;
  }

  async updateTask(user: any, id: string, dto: UpdateTaskDto) {
    await this.getTask(user, id); // Check permissions
    const { data, error } = await supabase.from('tasks').update(dto).eq('id', id);
    if (error) throw new Error(error.message);
    if (!data) throw new Error('No column was updated');
    return data[0];
  }

  async deleteTask(user: any, id: string) {
    await this.getTask(user, id); // Check permissions
    if (user.role !== 'admin') throw new ForbiddenException();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Task deleted successfully' };
  }
}

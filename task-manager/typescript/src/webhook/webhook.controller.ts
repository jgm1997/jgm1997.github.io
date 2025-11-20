import { Body, Controller, Post, Headers, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { WebhookService } from './webhook.service';

const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('task')
  async handleWebhookTask(@Headers('authorization') auth: string, @Body() payload: any) {
    if (!auth?.startsWith('Bearer '))
      throw new UnauthorizedException('Missing or invalid authorization header');
    const token = auth.split(' ')[1];
    try {
      jwt.verify(token, SUPABASE_WEBHOOK_SECRET);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.table !== 'tasks') return { message: 'Ignored: wrong table' };
    this.webhookService.processEvent(payload);
    return { ok: true };
  }
}

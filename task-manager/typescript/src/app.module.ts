import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TaskModule } from './task/task.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [AuthModule, TaskModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

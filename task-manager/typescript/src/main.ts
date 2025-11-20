import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  });
  app.setGlobalPrefix('api');
  const apiConfig = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('API for the Task Manager app')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'Bearer',
    })
    .build();
  const document = SwaggerModule.createDocument(app, apiConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Task Manager API',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

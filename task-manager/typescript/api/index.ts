// Load environment variables first, before any other imports
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();

export const createNestApp = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: true,
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
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js',
    ],
  });

  await app.init();
  return app;
};

createNestApp(server)
  .then(() => console.log('Nest application ready'))
  .catch((err) => console.error('Nest application failed to start', err));

export default server;

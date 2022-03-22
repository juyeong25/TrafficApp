import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from 'src/config/swagger';
import * as express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger : ['error', 'warn', 'log', 'verbose', 'debug']
  });

  app.use(cookieParser());

  app.use('/public', express.static(join(__dirname, '..', 'public'))); // <-

  setupSwagger(app);

  app.enableCors({
    allowedHeaders: "Content-Type",
    methods: "POST,GET,PUT,PATCH,DELETE,OPTIONS",
    credentials: true,
    origin: true
  });
  await app.listen(3001);
}
bootstrap();

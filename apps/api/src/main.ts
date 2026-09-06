import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  app.setGlobalPrefix(
    'api/v1',
  );

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted:
        true,

      transform: true,
    }),
  );

  app.enableCors({
    origin:
      'http://localhost:3000',

    credentials: true,
  });

  app.enableShutdownHooks();

  const port =
    process.env.PORT ?? 4000;

  await app.listen(port);

  console.log(
    `ClientFlow API running on http://localhost:${port}/api/v1`,
  );
}

bootstrap();
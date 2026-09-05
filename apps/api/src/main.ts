import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.enableShutdownHooks();

  const port = process.env.PORT ?? 4000;

  await app.listen(port);

  console.log(
    `ClientFlow API running on http://localhost:${port}/api/v1`,
  );
}

bootstrap();
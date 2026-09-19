import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  const configService =
    app.get(ConfigService);

  const port =
    configService.get<number>(
      'PORT',
      3000,
    );

  const clientUrl =
    configService.get<string>(
      'CLIENT_URL',
      'http://localhost:5173',
    );

  /*
   * Security headers
   */
  app.use(helmet());

  /*
   * All endpoints:
   *
   * /api/...
   */
  app.setGlobalPrefix('api');

  /*
   * React frontend
   */
  app.enableCors({
    origin: clientUrl,
  });

  /*
   * DTO validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted:
        true,

      transform: true,

      transformOptions: {
        enableImplicitConversion:
          true,
      },
    }),
  );

  await app.listen(port);

  console.log(
    `Quizzen AI API running on http://localhost:${port}/api`,
  );
}

void bootstrap();
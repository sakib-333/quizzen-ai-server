import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { HistoryModule } from './modules/history/history.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { ConvexModule } from './database/convex/convex.module';

const envSchema = z.object({
  NODE_ENV: z
    .enum([
      'development',
      'production',
      'test',
    ])
    .default('development'),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3000),

  CLIENT_URL: z
    .string()
    .url()
    .default(
      'http://localhost:5173',
    ),

  GEMINI_API_KEY: z
    .string()
    .min(1),

  GEMINI_MODEL: z
    .string()
    .default('gemini-3.1-flash-lite'),

  CONVEX_URL: z
    .string()
    .min(1),

  CONVEX_DEPLOYMENT: z
    .string()
    .min(1),
  
    CONVEX_SITE_URL: z
    .string()
    .min(1),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envSchema,
    }),
    ConvexModule,
    AuthModule,
    AiModule,
    QuizzesModule,
    HistoryModule,
    PdfModule,
  ],

  controllers: [
    AppController,
  ],
})
export class AppModule { }
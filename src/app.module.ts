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
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  CLIENT_URL: z.string().url(),

  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-3.1-flash-lite'),

  CONVEX_URL: z.string().url(),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => envSchema.parse(config),
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

import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  health() {
    return {
      success: true,
      message:
        'Quizzen AI API is running.',
      timestamp:
        new Date().toISOString(),
    };
  }
}
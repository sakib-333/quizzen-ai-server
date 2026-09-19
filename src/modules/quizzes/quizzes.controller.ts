import { Body, Controller, Post } from '@nestjs/common';

import { GenerateQuizDto } from './dto/generate-quiz.dto';

@Controller('quizzes')
export class QuizzesController {
    @Post('generate')
    generate(
        @Body()
        dto: GenerateQuizDto,
    ) {
        return {
            success: true,

            message:
                'Quiz generation request received.',

            data: dto,
        };
    }
}
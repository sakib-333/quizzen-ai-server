import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { OptionalFirebaseAuthGuard } from '../auth/guards/optional-firebase-auth.guard';

import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizzesService } from './quizzes.service';

type AuthRequest = Request & {
    user?: DecodedIdToken;
};

@Controller('quizzes')
export class QuizzesController {
    constructor(private readonly quizzesService: QuizzesService) { }

    @Post('generate')
    @UseGuards(OptionalFirebaseAuthGuard)
    generate(@Body() dto: GenerateQuizDto, @Req() request: AuthRequest) {
        return this.quizzesService.generate(dto, request.user?.uid);
    }

    @Post(':id/submit')
    @UseGuards(OptionalFirebaseAuthGuard)
    submit(@Param('id') id: string, @Body() dto: SubmitQuizDto, @Req() request: AuthRequest) {
        return this.quizzesService.submit(id, dto, request.user?.uid);
    }
}
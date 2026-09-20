import { Injectable } from '@nestjs/common';
import { GenerateQuizDto } from './dto/generate-quiz.dto';

@Injectable()
export class QuizzesService {
    generate(dto: GenerateQuizDto, uid?: string) {
        return {
            success: true,
            data: {
                id: `quiz-${Date.now()}`,
                authenticated: Boolean(uid),
                ownerUid: uid ?? null,
                config: dto,
            },
        };
    }
}
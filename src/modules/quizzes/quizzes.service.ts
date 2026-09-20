import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AiService } from '../ai/ai.service';
import type { GeneratedQuiz } from '../ai/schemas/quiz.schema';
import { GenerateQuizDto } from './dto/generate-quiz.dto';

type StoredQuiz = {
    quiz: GeneratedQuiz;
    config: GenerateQuizDto;
    ownerUid?: string;
};

@Injectable()
export class QuizzesService {
    private readonly quizzes = new Map<string, StoredQuiz>();

    constructor(private readonly aiService: AiService) { }

    async generate(dto: GenerateQuizDto, uid?: string) {
        const quiz = await this.aiService.generateQuiz({
            prompt: dto.prompt,
            questionCount: dto.questionCount,
            difficulty: dto.difficulty,
        });

        const id = randomUUID();

        this.quizzes.set(id, { quiz, config: dto, ownerUid: uid });

        return {
            success: true,
            data: {
                id,
                title: quiz.title,
                authenticated: Boolean(uid),
                config: dto,

                questions: quiz.questions.map((question) => ({
                    id: question.id,
                    question: question.question,
                    options: question.options,
                })),
            },
        };
    }
}
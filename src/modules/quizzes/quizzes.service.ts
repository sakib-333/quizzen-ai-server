import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { AiService } from '../ai/ai.service';
import type { GeneratedQuiz } from '../ai/schemas/quiz.schema';

import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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

        this.quizzes.set(id, {
            quiz,
            config: dto,
            ownerUid: uid,
        });

        return {
            success: true,
            data: {
                id,
                title: quiz.title,
                authenticated: Boolean(uid),
                config: dto,

                // Never send correct answers during an active quiz.
                questions: quiz.questions.map((question) => ({
                    id: question.id,
                    question: question.question,
                    options: question.options,
                })),
            },
        };
    }

    submit(id: string, dto: SubmitQuizDto, uid?: string) {
        const stored = this.quizzes.get(id);

        if (!stored) throw new NotFoundException('Quiz not found.');

        if (stored.ownerUid && stored.ownerUid !== uid) {
            throw new ForbiddenException('You do not have access to this quiz.');
        }

        const validQuestionIds = new Set(stored.quiz.questions.map((question) => question.id));

        const answerMap = new Map<string, 'A' | 'B' | 'C' | 'D'>();

        for (const answer of dto.answers) {
            if (!validQuestionIds.has(answer.questionId)) {
                throw new BadRequestException(`Invalid question ID: ${answer.questionId}`);
            }

            if (answerMap.has(answer.questionId)) {
                throw new BadRequestException(`Duplicate answer for question: ${answer.questionId}`);
            }

            answerMap.set(answer.questionId, answer.optionId);
        }

        let score = 0;

        for (const question of stored.quiz.questions) {
            const selectedOption = answerMap.get(question.id);

            if (selectedOption === question.correctOptionId) score++;
        }

        const totalQuestions = stored.quiz.questions.length;
        const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;

        return {
            success: true,
            data: {
                quizId: id,
                title: stored.quiz.title,
                config: stored.config,
                questions: stored.quiz.questions,
                answers: Object.fromEntries(answerMap),
                score,
                totalQuestions,
                percentage,
                timedOut: dto.timedOut ?? false,
                completedAt: Date.now(),
            },
        };
    }
}
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import { AiService } from '../ai/ai.service';
import { ConvexService } from '../../database/convex/convex.service';

import type { GeneratedQuiz } from '../ai/schemas/quiz.schema';

import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

type GuestStoredQuiz = {
    quiz: GeneratedQuiz;
    config: GenerateQuizDto;
};

@Injectable()
export class QuizzesService {
    private readonly guestQuizzes = new Map<string, GuestStoredQuiz>();

    constructor(
        private readonly aiService: AiService,
        private readonly convexService: ConvexService,
    ) { }

    async generate(dto: GenerateQuizDto, uid?: string) {
        const quiz = await this.aiService.generateQuiz({
            prompt: dto.prompt,
            questionCount: dto.questionCount,
            difficulty: dto.difficulty,
        });

        const id = randomUUID();

        if (uid) {
            await this.convexService.createQuiz({
                quizId: id,
                ownerUid: uid,

                title: quiz.title,
                prompt: dto.prompt,
                questionCount: dto.questionCount,
                difficulty: dto.difficulty,
                durationMinutes: dto.durationMinutes,

                questions: quiz.questions,

                createdAt: Date.now(),
            });
        } else {
            this.guestQuizzes.set(id, {
                quiz,
                config: dto,
            });
        }

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

    async submit(id: string, dto: SubmitQuizDto, uid?: string) {
        let quiz: GeneratedQuiz;
        let config: GenerateQuizDto;
        let ownerUid: string | undefined;

        const guestQuiz = this.guestQuizzes.get(id);

        if (guestQuiz) {
            quiz = guestQuiz.quiz;
            config = guestQuiz.config;
        } else {
            const storedQuiz = await this.convexService.getQuiz(id);

            if (!storedQuiz) {
                throw new NotFoundException('Quiz not found.');
            }

            if (!uid || storedQuiz.ownerUid !== uid) {
                throw new ForbiddenException('You do not have access to this quiz.');
            }

            ownerUid = storedQuiz.ownerUid;

            quiz = {
                title: storedQuiz.title,
                questions: storedQuiz.questions,
            };

            config = {
                prompt: storedQuiz.prompt,
                questionCount: storedQuiz.questionCount,
                difficulty: storedQuiz.difficulty,
                durationMinutes: storedQuiz.durationMinutes,
            };
        }

        const validQuestionIds = new Set(quiz.questions.map((question) => question.id));

        const answerMap = new Map<string, 'A' | 'B' | 'C' | 'D'>();

        for (const answer of dto.answers) {
            if (!validQuestionIds.has(answer.questionId)) {
                throw new BadRequestException(`Invalid question ID: ${answer.questionId}`);
            }

            if (answerMap.has(answer.questionId)) {
                throw new BadRequestException(`Duplicate answer: ${answer.questionId}`);
            }

            answerMap.set(answer.questionId, answer.optionId);
        }

        let score = 0;

        for (const question of quiz.questions) {
            if (answerMap.get(question.id) === question.correctOptionId) {
                score++;
            }
        }

        const totalQuestions = quiz.questions.length;
        const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
        const completedAt = Date.now();
        const answers = Object.fromEntries(answerMap);

        if (ownerUid) {
            await this.convexService.createAttempt({
                quizId: id,
                ownerUid,

                title: quiz.title,
                prompt: config.prompt,
                difficulty: config.difficulty,
                durationMinutes: config.durationMinutes,
                questionCount: config.questionCount,

                answers,
                score,
                totalQuestions,
                percentage,

                timedOut: dto.timedOut ?? false,
                completedAt,
            });
        }

        return {
            success: true,

            data: {
                quizId: id,
                title: quiz.title,
                config,

                questions: quiz.questions,
                answers,

                score,
                totalQuestions,
                percentage,

                timedOut: dto.timedOut ?? false,
                completedAt,
            },
        };
    }
}
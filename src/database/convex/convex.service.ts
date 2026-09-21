import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import type { Doc, Id } from '../../../convex/_generated/dataModel';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';
type OptionId = 'A' | 'B' | 'C' | 'D';

type QuizQuestion = {
    id: string;
    question: string;
    options: Array<{ id: OptionId; text: string }>;
    correctOptionId: OptionId;
    explanation: string;
};

export type CreateQuizArgs = {
    quizId: string;
    ownerUid: string;
    title: string;
    prompt: string;
    questionCount: number;
    difficulty: Difficulty;
    durationMinutes: number;
    questions: QuizQuestion[];
    createdAt: number;
};

export type CreateAttemptArgs = {
    quizId: string;
    ownerUid: string;
    title: string;
    prompt: string;
    difficulty: Difficulty;
    durationMinutes: number;
    questionCount: number;
    answers: Record<string, OptionId>;
    score: number;
    totalQuestions: number;
    percentage: number;
    timedOut: boolean;
    completedAt: number;
};

const createQuiz = makeFunctionReference<'mutation', CreateQuizArgs, Id<'quizzes'>>(
    'quizzes:create',
);
const getQuizByQuizId = makeFunctionReference<
    'query',
    { quizId: string },
    Doc<'quizzes'> | null
>('quizzes:getByQuizId');
const createAttempt = makeFunctionReference<'mutation', CreateAttemptArgs, Id<'attempts'>>(
    'attempts:create',
);
const getAttemptsByOwner = makeFunctionReference<
    'query',
    { ownerUid: string },
    Array<Doc<'attempts'>>
>('attempts:getByOwner');

@Injectable()
export class ConvexService {
    private readonly client: ConvexHttpClient;

    constructor(config: ConfigService) {
        this.client = new ConvexHttpClient(config.getOrThrow<string>('CONVEX_URL'));
    }

    createQuiz(data: CreateQuizArgs) {
        return this.client.mutation(createQuiz, data);
    }

    getQuiz(quizId: string) {
        return this.client.query(getQuizByQuizId, { quizId });
    }

    createAttempt(data: CreateAttemptArgs) {
        return this.client.mutation(createAttempt, data);
    }

    getAttemptsByOwner(ownerUid: string) {
        return this.client.query(getAttemptsByOwner, { ownerUid });
    }
}

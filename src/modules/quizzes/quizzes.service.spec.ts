jest.mock('../ai/ai.service', () => ({ AiService: class AiService {} }));
jest.mock('../../database/convex/convex.service', () => ({
    ConvexService: class ConvexService {},
}));

import type { AiService } from '../ai/ai.service';
import type { ConvexService } from '../../database/convex/convex.service';
import { QuizzesService } from './quizzes.service';

describe('QuizzesService', () => {
    const config = {
        prompt: 'Test prompt',
        questionCount: 5,
        difficulty: 'beginner' as const,
        durationMinutes: 10,
    };
    const quiz = {
        title: 'Test quiz',
        questions: [
            {
                id: 'question-1',
                question: 'Question?',
                options: [
                    { id: 'A' as const, text: 'A' },
                    { id: 'B' as const, text: 'B' },
                    { id: 'C' as const, text: 'C' },
                    { id: 'D' as const, text: 'D' },
                ],
                correctOptionId: 'A' as const,
                explanation: 'Because A is correct.',
            },
        ],
    };

    const aiService = {
        generateQuiz: jest.fn(),
    };
    const convexService = {
        createQuiz: jest.fn(),
        getQuiz: jest.fn(),
        createAttempt: jest.fn(),
        getAttemptsByOwner: jest.fn(),
    };

    let service: QuizzesService;

    beforeEach(() => {
        jest.clearAllMocks();
        aiService.generateQuiz.mockResolvedValue(quiz);
        convexService.createQuiz.mockResolvedValue('convex-quiz-id');
        service = new QuizzesService(
            aiService as unknown as AiService,
            convexService as unknown as ConvexService,
        );
    });

    it('persists a generated quiz for an authenticated user', async () => {
        const result = await service.generate(config, 'firebase-user-id');

        expect(convexService.createQuiz).toHaveBeenCalledTimes(1);
        expect(convexService.createQuiz).toHaveBeenCalledWith(
            expect.objectContaining({
                quizId: result.data.id,
                ownerUid: 'firebase-user-id',
                title: quiz.title,
                prompt: config.prompt,
                questionCount: config.questionCount,
                difficulty: config.difficulty,
                durationMinutes: config.durationMinutes,
                questions: quiz.questions,
            }),
        );
        expect(result.data.authenticated).toBe(true);
    });

    it('keeps a guest quiz in memory without writing to Convex', async () => {
        const result = await service.generate(config);

        expect(convexService.createQuiz).not.toHaveBeenCalled();
        expect(result.data.authenticated).toBe(false);
    });

    it('does not return success when authenticated persistence fails', async () => {
        const persistenceError = new Error('Convex unavailable');
        convexService.createQuiz.mockRejectedValue(persistenceError);

        await expect(service.generate(config, 'firebase-user-id')).rejects.toBe(persistenceError);
    });
});

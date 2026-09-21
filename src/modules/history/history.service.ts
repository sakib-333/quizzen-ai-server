import { Injectable } from '@nestjs/common';

import { ConvexService } from '../../database/convex/convex.service';

@Injectable()
export class HistoryService {
    constructor(private readonly convexService: ConvexService) { }

    async getHistory(uid: string) {
        const attempts = await this.convexService.getAttemptsByOwner(uid);

        return attempts.map((attempt) => ({
            id: attempt._id,
            quizId: attempt.quizId,

            title: attempt.title,
            prompt: attempt.prompt,

            difficulty: attempt.difficulty,
            durationMinutes: attempt.durationMinutes,

            score: attempt.score,
            totalQuestions: attempt.totalQuestions,
            percentage: attempt.percentage,

            timedOut: attempt.timedOut,
            completedAt: attempt.completedAt,
        }));
    }
}
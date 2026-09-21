import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';


@Injectable()
export class ConvexService {
    private readonly client: ConvexHttpClient;

    constructor(config: ConfigService) {
        this.client = new ConvexHttpClient(config.getOrThrow<string>('CONVEX_URL'));
    }

    createQuiz(data: any) {
        return this.client.mutation(api.quizzes.create, data);
    }

    getQuiz(quizId: string) {
        return this.client.query(api.quizzes.getByQuizId, { quizId });
    }

    createAttempt(data: any) {
        return this.client.mutation(api.attempts.create, data);
    }

    getAttemptsByOwner(ownerUid: string) {
        return this.client.query(api.attempts.getByOwner, { ownerUid });
    }
}
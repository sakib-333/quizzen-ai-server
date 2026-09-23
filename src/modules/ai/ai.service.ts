import {
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import Groq from 'groq-sdk';

import {
    createQuizJsonSchema,
    createQuizValidationSchema,
} from './schemas/quiz.schema';

type GenerateQuizInput = {
    prompt: string;
    questionCount: number;
    difficulty: string;
};

@Injectable()
export class AiService {
    private readonly groq: Groq;
    private readonly model: string;

    constructor(private readonly config: ConfigService) {
        this.groq = new Groq({
            apiKey: this.config.getOrThrow<string>('GROQ_API_KEY'),
        });

        this.model = this.config.get<string>(
            'GROQ_MODEL',
            'openai/gpt-oss-20b',
        );
    }

    async generateQuiz(input: GenerateQuizInput) {
        try {
            const completion = await this.groq.chat.completions.create({
                model: this.model,

                messages: [
                    {
                        role: 'system',
                        content:
                            'You are an educational quiz generator. Create accurate multiple-choice questions. Every question must have exactly four options A, B, C and D, exactly one correct answer, and a short educational explanation. Avoid ambiguous questions.',
                    },

                    {
                        role: 'user',
                        content: `
                            Create a quiz.

                            Topic/request:
                            ${input.prompt}

                            Difficulty:
                            ${input.difficulty}

                            Number of questions:
                            ${input.questionCount}

                            Requirements:
                            - Create exactly ${input.questionCount} questions.
                            - Each question must have exactly four options.
                            - Option IDs must be A, B, C and D.
                            - Exactly one answer must be correct.
                            - Questions must match the requested difficulty.
                            - Do not repeat questions.
                            - Avoid ambiguous questions.
                            - Give each question a unique ID: q1, q2, q3, etc.
                            - Keep explanations concise and educational.
            `.trim(),
                    },
                ],

                response_format: {
                    type: 'json_schema',

                    json_schema: {
                        name: 'quiz',
                        strict: true,
                        schema: createQuizJsonSchema(input.questionCount),
                    },
                },
            });

            const content =
                completion.choices[0]?.message?.content;

            if (!content) {
                throw new Error(
                    'Groq returned an empty response.',
                );
            }

            const parsed: unknown =
                JSON.parse(content);

            return createQuizValidationSchema(
                input.questionCount,
            ).parse(parsed);
        } catch (error) {
            console.error(
                'Groq quiz generation failed:',
                error,
            );

            throw new ServiceUnavailableException(
                'Unable to generate quiz right now.',
            );
        }
    }
}
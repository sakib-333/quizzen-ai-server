import { z } from 'zod';

const optionSchema = z.object({ id: z.enum(['A', 'B', 'C', 'D']), text: z.string().min(1) });

export const createQuizValidationSchema = (count: number) =>
    z.object({
        title: z.string().min(1),
        questions: z.array(
            z.object({
                id: z.string().min(1),
                question: z.string().min(1),
                options: z.tuple([optionSchema, optionSchema, optionSchema, optionSchema]),
                correctOptionId: z.enum(['A', 'B', 'C', 'D']),
                explanation: z.string().min(1),
            }),
        ).length(count),
    });

export type GeneratedQuiz = z.infer<ReturnType<typeof createQuizValidationSchema>>;

const optionJsonSchema = (id: 'A' | 'B' | 'C' | 'D') => ({
    type: 'object',
    properties: { id: { type: 'string', enum: [id] }, text: { type: 'string' } },
    required: ['id', 'text'],
    additionalProperties: false,
} as const);

export const createQuizJsonSchema = (count: number) => ({
    type: 'object',
    properties: {
        title: { type: 'string' },
        questions: {
            type: 'array',
            minItems: count,
            maxItems: count,
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    question: { type: 'string' },
                    options: {
                        type: 'array',
                        minItems: 4,
                        maxItems: 4,
                        prefixItems: [
                            optionJsonSchema('A'),
                            optionJsonSchema('B'),
                            optionJsonSchema('C'),
                            optionJsonSchema('D'),
                        ],
                    },
                    correctOptionId: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                    explanation: { type: 'string' },
                },
                required: ['id', 'question', 'options', 'correctOptionId', 'explanation'],
                additionalProperties: false,
            },
        },
    },
    required: ['title', 'questions'],
    additionalProperties: false,
} as const);
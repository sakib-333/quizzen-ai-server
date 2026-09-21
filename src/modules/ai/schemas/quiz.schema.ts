import { z } from 'zod';

const optionSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1),
});

const questionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(optionSchema).length(4),
  correctOptionId: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().min(1),
});

export const createQuizValidationSchema = (questionCount: number) =>
  z.object({
    title: z.string().min(1),
    questions: z.array(questionSchema).length(questionCount),
  });

export type GeneratedQuiz = z.infer<ReturnType<typeof createQuizValidationSchema>>;

export const createQuizJsonSchema = (questionCount: number) => ({
  type: 'object',
  properties: {
    title: {
      type: 'string',
    },

    questions: {
      type: 'array',
      minItems: questionCount,
      maxItems: questionCount,

      items: {
        type: 'object',

        properties: {
          id: {
            type: 'string',
          },

          question: {
            type: 'string',
          },

          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,

            items: {
              type: 'object',

              properties: {
                id: {
                  type: 'string',
                  enum: ['A', 'B', 'C', 'D'],
                },

                text: {
                  type: 'string',
                },
              },

              required: ['id', 'text'],
              additionalProperties: false,
            },
          },

          correctOptionId: {
            type: 'string',
            enum: ['A', 'B', 'C', 'D'],
          },

          explanation: {
            type: 'string',
          },
        },

        required: [
          'id',
          'question',
          'options',
          'correctOptionId',
          'explanation',
        ],

        additionalProperties: false,
      },
    },
  },

  required: ['title', 'questions'],
  additionalProperties: false,
});
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { createQuizJsonSchema, createQuizValidationSchema } from './schemas/quiz.schema';

type GenerateQuizInput = {
    prompt: string;
    questionCount: number;
    difficulty: string;
};

@Injectable()
export class AiService {
    private readonly ai: GoogleGenAI;
    private readonly model: string;

    constructor(private readonly config: ConfigService) {
        this.ai = new GoogleGenAI({ apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY') });
        this.model = this.config.get<string>('GEMINI_MODEL', 'gemini-3.1-flash-lite');
    }

    async generateQuiz(input: GenerateQuizInput) {
        try {
            const interaction = await this.ai.interactions.create({
                model: this.model,

                input: `
                    Create a multiple-choice quiz.

                    User request: ${input.prompt}
                    Difficulty: ${input.difficulty}
                    Number of questions: ${input.questionCount}

                    Rules:
                    - Create exactly ${input.questionCount} questions.
                    - Every question must have exactly four options: A, B, C and D.
                    - Exactly one option must be correct.
                    - Questions must match the requested difficulty.
                    - Avoid ambiguous questions.
                    - Explanations should be short and educational.
                    - Give every question a unique id such as q1, q2, q3.
                `,

                response_format: {
                    type: 'text',
                    mime_type: 'application/json',
                    schema: createQuizJsonSchema(input.questionCount),
                },
            });


            const parsed: unknown = JSON.parse(interaction.output_text ?? '{}');

            return createQuizValidationSchema(input.questionCount).parse(parsed);
        } catch (error) {
            console.error('Gemini quiz generation failed:', error);
            throw new ServiceUnavailableException('Unable to generate quiz right now.');
        }
    }
}
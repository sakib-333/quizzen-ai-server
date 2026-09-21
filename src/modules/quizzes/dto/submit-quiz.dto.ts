import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuizAnswerDto {
    @IsString()
    questionId!: string;

    @IsIn(['A', 'B', 'C', 'D'])
    optionId!: 'A' | 'B' | 'C' | 'D';
}

export class SubmitQuizDto {
    @IsArray()
    @ArrayMaxSize(20)
    @ValidateNested({ each: true })
    @Type(() => QuizAnswerDto)
    answers!: QuizAnswerDto[];

    @IsOptional()
    @IsBoolean()
    timedOut?: boolean;
}
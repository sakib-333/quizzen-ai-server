import {
    IsIn,
    IsInt,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class GenerateQuizDto {
    @IsString()
    @MinLength(5)
    @MaxLength(500)
    prompt!: string;

    @IsInt()
    @Min(5)
    @Max(20)
    questionCount!: number;

    @IsIn([
        'beginner',
        'intermediate',
        'advanced',
    ])
    difficulty!:
        | 'beginner'
        | 'intermediate'
        | 'advanced';

    @IsInt()
    @Min(5)
    @Max(60)
    durationMinutes!: number;
}
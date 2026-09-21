import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const option = v.object({
    id: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    text: v.string(),
});

const question = v.object({
    id: v.string(),
    question: v.string(),
    options: v.array(option),
    correctOptionId: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D")),
    explanation: v.string(),
});

export default defineSchema({
    quizzes: defineTable({
        quizId: v.string(),
        ownerUid: v.string(),
        title: v.string(),
        prompt: v.string(),
        questionCount: v.number(),
        difficulty: v.union(
            v.literal("beginner"),
            v.literal("intermediate"),
            v.literal("advanced"),
        ),
        durationMinutes: v.number(),
        questions: v.array(question),
        createdAt: v.number(),
    })
        .index("by_quiz_id", ["quizId"])
        .index("by_owner", ["ownerUid"]),

    attempts: defineTable({
        quizId: v.string(),
        ownerUid: v.string(),

        title: v.string(),
        prompt: v.string(),
        difficulty: v.union(
            v.literal("beginner"),
            v.literal("intermediate"),
            v.literal("advanced"),
        ),
        durationMinutes: v.number(),
        questionCount: v.number(),

        answers: v.any(),

        score: v.number(),
        totalQuestions: v.number(),
        percentage: v.number(),

        timedOut: v.boolean(),
        completedAt: v.number(),
    })
        .index("by_quiz_id", ["quizId"])
        .index("by_owner", ["ownerUid"]),
});
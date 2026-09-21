import { mutation, query } from "./_generated/server";
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

export const create = mutation({
    args: {
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
    },

    handler: async (ctx, args) => {
        return ctx.db.insert("quizzes", args);
    },
});

export const getByQuizId = query({
    args: { quizId: v.string() },

    handler: async (ctx, args) => {
        return ctx.db
            .query("quizzes")
            .withIndex("by_quiz_id", (q) => q.eq("quizId", args.quizId))
            .unique();
    },
});
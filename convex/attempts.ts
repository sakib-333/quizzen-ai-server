import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
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
    },

    handler: async (ctx, args) => {
        return ctx.db.insert("attempts", args);
    },
});

export const getByOwner = query({
    args: { ownerUid: v.string() },

    handler: async (ctx, args) => {
        return ctx.db
            .query("attempts")
            .withIndex("by_owner", (q) => q.eq("ownerUid", args.ownerUid))
            .order("desc")
            .take(50);
    },
});
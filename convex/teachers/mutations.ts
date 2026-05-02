import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const syncFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("teachers")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("teachers", {
        clerkUserId: args.clerkUserId,
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        createdAt: Date.now(),
        subscriptionStatus: "free",
        yearLevels: [],
        freeMessagesUsed: 0,
      });
    }
  },
});

export const updateSubscription = mutation({
  args: {
    teacherClerkUserId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due")
    ),
  },
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.teacherClerkUserId))
      .first();

    if (!teacher) {
      console.error(`Teacher not found for Clerk userId: ${args.teacherClerkUserId}`);
      return;
    }

    await ctx.db.patch(teacher._id, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: args.subscriptionStatus,
    });

    console.log(`Updated subscription for teacher ${args.teacherClerkUserId}: ${args.subscriptionStatus}`);
  },
});

export const cancelSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.stripeCustomerId))
      .first();

    if (teacher) {
      await ctx.db.patch(teacher._id, {
        subscriptionStatus: "cancelled",
        stripeSubscriptionId: undefined,
      });
      console.log(`Cancelled subscription for customer ${args.stripeCustomerId}`);
    }
  },
});

export const updateSubscriptionStatus = mutation({
  args: {
    stripeCustomerId: v.string(),
    subscriptionStatus: v.union(
      v.literal("free"),
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due")
    ),
  },
  handler: async (ctx, args) => {
    const teacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.stripeCustomerId))
      .first();

    if (teacher) {
      await ctx.db.patch(teacher._id, {
        subscriptionStatus: args.subscriptionStatus,
      });
      console.log(`Updated status for customer ${args.stripeCustomerId}: ${args.subscriptionStatus}`);
    }
  },
});
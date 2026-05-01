import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Teachers — one per teacher account
  teachers: defineTable({
    clerkUserId: v.string(),           // Clerk auth ID
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),              // Unix timestamp
    subscriptionStatus: v.union(        // free | active | cancelled | past_due
      v.literal("free"),
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due")
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    yearLevels: v.array(v.string()),    // ["F", "1", "2"] etc.
    freeMessagesUsed: v.number(),        // Count toward 3 free messages
    avatarUrl: v.optional(v.string()),
  }).index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // Chat sessions — each conversation thread
  sessions: defineTable({
    teacherId: v.id("teachers"),
    createdAt: v.number(),
    updatedAt: v.number(),
    title: v.optional(v.string()),      // Auto-generated or teacher-set
    messageCount: v.number(),
    lastMessageAt: v.number(),
    context: v.optional(v.string()),    // Year level, subject, etc.
  }).index("by_teacher", ["teacherId"])
    .index("by_updated", ["updatedAt"]),

  // Individual messages within a session
  messages: defineTable({
    sessionId: v.id("sessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
    attachments: v.optional(v.array(v.object({
      type: v.union(v.literal("image"), v.literal("pdf"), v.literal("doc")),
      url: v.string(),
      name: v.string(),
    }))),
  }).index("by_session", ["sessionId"]),

  // Lesson plans and generated content
  lessonHistory: defineTable({
    teacherId: v.id("teachers"),
    sessionId: v.optional(v.id("sessions")),
    type: v.union(
      v.literal("lesson_plan"),
      v.literal("rubric"),
      v.literal("assessment"),
      v.literal("feedback"),
      v.literal("report_comment"),
      v.literal("other")
    ),
    title: v.string(),
    content: v.string(),                // The generated output
    createdAt: v.number(),
    yearLevel: v.optional(v.string()),
    subject: v.optional(v.string()),
    exportedFormat: v.optional(v.union(
      v.literal("pdf"),
      v.literal("docx"),
      v.literal("pptx")
    )),
  }).index("by_teacher", ["teacherId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // Monthly usage tracking
  usage: defineTable({
    teacherId: v.id("teachers"),
    month: v.string(),                  // "2026-05" format
    messageCount: v.number(),
    lessonGenerations: v.number(),
    exports: v.number(),
    lastActivityAt: v.number(),
  }).index("by_teacher_month", ["teacherId", "month"]),

  // Exported files record
  exports: defineTable({
    teacherId: v.id("teachers"),
    lessonHistoryId: v.optional(v.id("lessonHistory")),
    format: v.union(v.literal("pdf"), v.literal("docx"), v.literal("pptx")),
    filename: v.string(),
    createdAt: v.number(),
  }).index("by_teacher", ["teacherId"]),
});
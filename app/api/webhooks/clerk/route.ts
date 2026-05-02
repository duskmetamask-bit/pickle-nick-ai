/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const primaryEmail = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(" ") || "Teacher";

        if (!primaryEmail) {
          return new Response("No email found", { status: 400 });
        }

        // Sync teacher to Convex
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teacherId = await (convex as any).mutation((api as any).teachers.syncFromClerk, {
          clerkUserId: id,
          email: primaryEmail,
          name,
          avatarUrl: image_url,
        });

        console.log(`Clerk user ${id} synced to Convex as teacher ${teacherId}`);

        // Send welcome email on first signup (fire-and-forget)
        if (type === "user.created") {
          fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/email/welcome`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: primaryEmail, name, teacherId }),
          }).catch(err => console.error("Failed to trigger welcome email:", err));
        }

        break;
      }

      case "session.created": {
        // Could track active sessions here if needed
        break;
      }

      default:
        console.log(`Unhandled Clerk webhook type: ${type}`);
    }
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
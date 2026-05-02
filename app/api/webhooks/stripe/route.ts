/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StripeMod = require("stripe") as typeof Stripe;
  return new StripeMod(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Map Stripe subscription statuses to our enum
function mapSubscriptionStatus(status: string): "free" | "active" | "cancelled" | "past_due" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "cancelled";
    case "past_due":
      return "past_due";
    default:
      return "free";
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();
  if (!stripe) {
    return new Response("Stripe not configured", { status: 500 });
  }
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const teacherClerkUserId = session.metadata?.teacherClerkUserId;

        if (!teacherClerkUserId) {
          console.error("No teacherClerkUserId in checkout session metadata");
          return new Response("Missing teacherClerkUserId in metadata", { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (convex as any).mutation((api as any).teachers.updateSubscription, {
          teacherClerkUserId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionStatus: mapSubscriptionStatus(subscription.status),
        });

        console.log(`Activated subscription for teacher ${teacherClerkUserId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (convex as any).mutation((api as any).teachers.cancelSubscription, {
          stripeCustomerId: customerId,
        });

        console.log(`Cancelled subscription for customer ${customerId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (convex as any).mutation((api as any).teachers.updateSubscriptionStatus, {
          stripeCustomerId: customerId,
          subscriptionStatus: mapSubscriptionStatus(subscription.status),
        });

        console.log(`Updated subscription status for customer ${customerId} to ${subscription.status}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
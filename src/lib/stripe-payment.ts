"use server";

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeCustomer(email: string, clerkId: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      // Optional: associate with your user ID
      userId: clerkId,
    },
  });

  return customer.id; // store this in your database as `stripeId`
}

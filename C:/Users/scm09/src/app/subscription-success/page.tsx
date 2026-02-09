
'use client';

// This page is now purely presentational.
// The user's subscription status is updated via the Razorpay webhook.

export default function SubscriptionSuccessPage() {
  return (
    <div className="text-center p-20">
      <h1 className="text-3xl font-bold">Subscription Successful!</h1>
      <p className="mt-4">Thank you for upgrading. Your Pro membership is now being activated.</p>
      <p className="text-sm text-muted-foreground mt-2">You can now access all Pro features across the site.</p>
    </div>
  );
}

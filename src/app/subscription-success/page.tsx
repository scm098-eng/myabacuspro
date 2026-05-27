'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const subscriptionId = searchParams.get("subscription_id");

    if (!user || !subscriptionId) return;

    // Save subscription → user mapping
    const saveSubscription = async () => {
      await fetch("/api/save-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId,
          userId: user.uid,
        }),
      });
    };

    saveSubscription();
  }, [searchParams, user]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold">Subscription Successful 🎉</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We’re updating your Pro access. You can close this page safely.
      </p>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">Loading success page...</p>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}

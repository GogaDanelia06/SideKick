import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "ახალი პაროლი", robots: { index: false, follow: false } };

export default function ResetPage() {
  // ResetForm reads ?token via useSearchParams, which needs a Suspense boundary.
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

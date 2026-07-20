import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "პაროლის აღდგენა" };

export default function ForgotPage() {
  return <ForgotForm />;
}

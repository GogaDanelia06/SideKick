import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ChatWidget } from "@/components/chat/ChatWidget";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="grid min-h-[calc(100vh-64px)] place-items-center px-6 py-12">
        {children}
      </main>
      <ChatWidget />
    </>
  );
}

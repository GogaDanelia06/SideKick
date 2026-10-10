import type { ComponentType } from "react";
import { ChatMock } from "./ChatMock";
import { DashboardMock } from "./DashboardMock";
import { TesterMock } from "./TesterMock";
import type { HeroMock } from "@/lib/content/hero";

export const MOCKS: Record<HeroMock, ComponentType> = {
  chat: ChatMock,
  dashboard: DashboardMock,
  tester: TesterMock,
};

export const MOCK_FRAME = "w-full cursor-default";

export function mockKey(value: string | null): HeroMock | undefined {
  return value && value in MOCKS ? (value as HeroMock) : undefined;
}

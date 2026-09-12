import type { ComponentType } from "react";
import { ChatMock } from "./ChatMock";
import { DashboardMock } from "./DashboardMock";
import { TesterMock } from "./TesterMock";
import type { HeroMock } from "@/lib/content/hero";

/** Built-in hero panels by key, shared by shipped and admin-created slides. */
export const MOCKS: Record<HeroMock, ComponentType> = {
  chat: ChatMock,
  dashboard: DashboardMock,
  tester: TesterMock,
};

/** Wrapper class for mocks: `cursor-default`, so a picture of a control never looks editable. */
export const MOCK_FRAME = "w-full cursor-default";

/** Narrows a stored value to a renderable mock key; unknown values render no mock. */
export function mockKey(value: string | null): HeroMock | undefined {
  return value && value in MOCKS ? (value as HeroMock) : undefined;
}

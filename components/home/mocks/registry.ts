import type { ComponentType } from "react";
import { ChatMock } from "./ChatMock";
import { DashboardMock } from "./DashboardMock";
import { TesterMock } from "./TesterMock";
import type { HeroMock } from "@/lib/content/hero";

/**
 * The built-in hero panels, by the key an admin picks in the dropdown.
 *
 * Shared between the shipped slides and the ones an admin creates, because both
 * offer the same three choices — and when they lived only in `Hero.tsx`, the
 * admin's choice was saved to the database and then silently ignored on the way
 * back out.
 */
export const MOCKS: Record<HeroMock, ComponentType> = {
  chat: ChatMock,
  dashboard: DashboardMock,
  tester: TesterMock,
};

/**
 * Wrapper class for a mounted mock. Apply it wherever one is rendered.
 *
 * A mock is a *picture* of the product, drawn in real markup so it inherits the
 * theme. That is worth keeping, but it costs the one thing a screenshot gets
 * right for free: a screenshot cannot be mistaken for the real control.
 *
 * `cursor-default` is what buys that back. Without it these panels inherit
 * `cursor: auto`, and over text a browser resolves that to the I-beam — so the
 * tester panel's search box grew a text caret on hover and read as a field you
 * could type a question into. It is a div. Nothing happens, and the visitor is
 * left thinking the demo is broken rather than that it was never a demo.
 *
 * Set on the wrapper rather than inside each mock so a fourth one cannot ship
 * without it.
 */
export const MOCK_FRAME = "w-full cursor-default";

/**
 * Narrows whatever is stored on the slide to a key we can actually render.
 *
 * The column is a plain string, so a value from an older build — or a hand-run
 * SQL update — must degrade to "no mock" rather than crash the landing page on
 * an undefined component. Returns the key rather than the component so callers
 * index `MOCKS` themselves, which is what keeps the reference statically
 * traceable for the linter.
 */
export function mockKey(value: string | null): HeroMock | undefined {
  return value && value in MOCKS ? (value as HeroMock) : undefined;
}

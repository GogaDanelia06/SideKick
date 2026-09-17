export type Theme = "dark" | "light";

/** Used when the system gives no answer, and while the server renders. */
export const DEFAULT_THEME: Theme = "light";

/** A theme the visitor picked on purpose. Without one, the site follows the system setting. */
export const THEME_STORAGE_KEY = "sidekick.theme-choice";

/**
 * The previous key, which every toggle wrote to. It is cleared once, so every visitor
 * starts again from their system setting.
 */
export const LEGACY_THEME_STORAGE_KEY = "sidekick.theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

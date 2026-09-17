import { useSyncExternalStore } from "react";

/**
 * The AI tester's chat. It lives in this browser until the user logs out, so a reload
 * or another page does not lose it. It belongs to one login (`loginId`), and each chat
 * is its own AI thread, so the model remembers exactly what the transcript shows.
 */

export type TesterTurn = { from: "you" | "ai"; text: string; handoff?: boolean };

type Chat = { loginId: string; thread: string; turns: TesterTurn[] };
type State = { chat: Chat | null; waitingOn: string | null };

const STORAGE_KEY = "sidekick.tester";
/** Older turns are dropped past this, so the stored chat stays small. */
const MAX_TURNS = 100;
const SERVER_STATE: State = { chat: null, waitingOn: null };
const NO_TURNS: TesterTurn[] = [];

let state: State | null = null;
const listeners = new Set<() => void>();

function isTurn(value: unknown): value is TesterTurn {
  const turn = value as TesterTurn | null;
  return (turn?.from === "you" || turn?.from === "ai") && typeof turn.text === "string";
}

function load(): Chat | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    const valid = typeof saved?.loginId === "string" && typeof saved.thread === "string" && Array.isArray(saved.turns);
    return valid ? { loginId: saved.loginId, thread: saved.thread, turns: saved.turns.filter(isTurn) } : null;
  } catch {
    return null;
  }
}

function current(): State {
  state ??= { chat: load(), waitingOn: null };
  return state;
}

function commit(next: State) {
  const saved = current().chat;
  state = next;
  if (next.chat !== saved) {
    try {
      if (next.chat) localStorage.setItem(STORAGE_KEY, JSON.stringify(next.chat));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage may be full or blocked; the chat then lasts until the page reloads.
    }
  }
  listeners.forEach((notify) => notify());
}

function subscribe(onChange: () => void) {
  // Keeps tabs in step: a question asked or a logout in one shows in the others.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    state = { ...current(), chat: load() };
    onChange();
  };
  listeners.add(onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const newThread = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, "0")).join("");

/** Records a question and returns the AI thread to ask it in, or null while an answer is pending. */
export function askTester(loginId: string, text: string): string | null {
  const { chat, waitingOn } = current();
  if (waitingOn) return null;

  // A chat left by an earlier login is replaced, never continued.
  const mine = chat?.loginId === loginId ? chat : null;
  const thread = mine?.thread ?? newThread();
  const turns = [...(mine?.turns ?? []), { from: "you" as const, text }].slice(-MAX_TURNS);
  commit({ chat: { loginId, thread, turns }, waitingOn: thread });
  return thread;
}

/**
 * Records the answer (or, with null, just stops waiting). Returns false when the chat
 * was cleared or replaced while the answer was on its way; the answer is then dropped.
 */
export function answerTester(thread: string, turn: TesterTurn | null): boolean {
  const { chat, waitingOn } = current();
  const stillWaiting = waitingOn === thread ? null : waitingOn;
  if (chat?.thread !== thread) {
    commit({ chat, waitingOn: stillWaiting });
    return false;
  }

  const turns = turn ? [...chat.turns, turn].slice(-MAX_TURNS) : chat.turns;
  commit({ chat: turn ? { ...chat, turns } : chat, waitingOn: stillWaiting });
  return true;
}

/** Empties the chat and starts a new AI thread; also run on logout. */
export function clearTesterChat() {
  commit({ chat: null, waitingOn: null });
}

export function useTesterChat(loginId: string) {
  const snapshot = useSyncExternalStore(subscribe, current, () => SERVER_STATE);
  const chat = snapshot.chat?.loginId === loginId ? snapshot.chat : null;
  return {
    turns: chat?.turns ?? NO_TURNS,
    waiting: snapshot.waitingOn !== null && snapshot.waitingOn === chat?.thread,
    /** False until the browser's copy has been read, so an empty chat is not shown too early. */
    loaded: snapshot !== SERVER_STATE,
  };
}

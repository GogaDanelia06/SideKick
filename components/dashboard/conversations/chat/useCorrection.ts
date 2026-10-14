import { useState } from "react";

type State = { chatId: string | null; selected: string[]; dialog: boolean };

const IDLE: State = { chatId: null, selected: [], dialog: false };

export function useCorrection(chatId: string | null) {
  const [state, setState] = useState<State>(IDLE);
  const active = chatId !== null && state.chatId === chatId;

  return {
    active,
    selected: active ? state.selected : [],
    dialog: active && state.dialog,
    start: () => setState({ chatId, selected: [], dialog: false }),
    stop: () => setState(IDLE),
    toggle: (id: string) =>
      setState((s) => ({
        ...s,
        selected: s.selected.includes(id) ? s.selected.filter((x) => x !== id) : [...s.selected, id],
      })),
    openDialog: () => setState((s) => ({ ...s, dialog: true })),
    closeDialog: () => setState((s) => ({ ...s, dialog: false })),
  };
}

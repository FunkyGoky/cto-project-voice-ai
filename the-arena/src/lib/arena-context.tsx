"use client";

// ============================================================
// ArenaContext — React context provider for global state
// Wrap the app in <ArenaProvider> to access state everywhere.
// ============================================================

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { arenaReducer, initialState, type ArenaState, type ArenaAction } from "./store";

interface ArenaContextValue {
  state: ArenaState;
  dispatch: Dispatch<ArenaAction>;
}

const ArenaContext = createContext<ArenaContextValue | null>(null);

export function ArenaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(arenaReducer, initialState);
  return (
    <ArenaContext.Provider value={{ state, dispatch }}>
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena(): ArenaContextValue {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error("useArena must be used within <ArenaProvider>");
  return ctx;
}

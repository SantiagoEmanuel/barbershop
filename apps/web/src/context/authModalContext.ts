import { createContext } from "react";

interface AuthModalCtx {
  openAuth: (tab?: "login" | "register") => void;
  closeAuth: () => void;
}

export const AuthModalContext = createContext<AuthModalCtx>({
  openAuth: () => {},
  closeAuth: () => {},
});

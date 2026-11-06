import { createContext, type ReactNode, useContext, useMemo } from "react";

import { useProgress } from "../progress/ProgressContext";
import { authenticateDirectoryAccount, restoreDirectorySession } from "./authenticationService";
import type { DirectorySession } from "./accessService";

interface AuthContextValue {
  session: DirectorySession | null;
  login(username: string, passphrase: string): Promise<boolean>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { progress, signIn, signOut } = useProgress();
  const session = useMemo(
    () =>
      progress.sessionAccountId
        ? restoreDirectorySession(progress.sessionAccountId, progress.grantIds)
        : null,
    [progress.grantIds, progress.sessionAccountId],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(username, passphrase) {
        const nextSession = await authenticateDirectoryAccount(username, passphrase);
        if (nextSession) signIn(nextSession.accountId, nextSession.grants);
        return Boolean(nextSession);
      },
      logout() {
        signOut();
      },
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}

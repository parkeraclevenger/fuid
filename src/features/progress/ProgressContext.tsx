import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { catalog } from "../../content/catalog";
import {
  createDefaultProgressService,
  type PlayerProgress,
  type ProgressService,
} from "./progressService";

interface ProgressContextValue {
  progress: PlayerProgress;
  signIn(accountId: string, grantIds: readonly string[]): void;
  signOut(): void;
  markDocumentReviewed(documentId: string): void;
  solvePuzzle(puzzleId: string): void;
  exportProgress(): string;
  importProgress(text: string): void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  service: providedService,
}: {
  children: ReactNode;
  service?: ProgressService;
}) {
  const serviceRef = useRef<ProgressService>(providedService ?? createDefaultProgressService());
  const [progress, setProgress] = useState(() => serviceRef.current.load());

  const signIn = useCallback((accountId: string, grantIds: readonly string[]) => {
    setProgress((current) => serviceRef.current.signIn(current, accountId, grantIds));
  }, []);

  const signOut = useCallback(() => {
    setProgress((current) => serviceRef.current.signOut(current));
  }, []);

  const markDocumentReviewed = useCallback((documentId: string) => {
    setProgress((current) => serviceRef.current.reviewDocument(current, documentId));
  }, []);

  const solvePuzzle = useCallback((puzzleId: string) => {
    const puzzle = catalog.getPuzzle(puzzleId);
    if (!puzzle) return;
    setProgress((current) => serviceRef.current.solvePuzzle(current, puzzle));
  }, []);

  const exportProgress = useCallback(() => serviceRef.current.export(progress), [progress]);

  const importProgress = useCallback((text: string) => {
    setProgress(serviceRef.current.import(text));
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      signIn,
      signOut,
      markDocumentReviewed,
      solvePuzzle,
      exportProgress,
      importProgress,
    }),
    [exportProgress, importProgress, markDocumentReviewed, progress, signIn, signOut, solvePuzzle],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used within ProgressProvider.");
  return value;
}

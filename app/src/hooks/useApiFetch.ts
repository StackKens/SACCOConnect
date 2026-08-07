import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getApiErrorMessage } from "../services/auth.service";

interface ApiFetchResult {
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

// Runs `fetcher` on every focus and surfaces errors with a refresh handle.
// Screens keep their own data setters; the fetcher is responsible for
// populating them. Errors are captured and exposed instead of swallowed.
export function useApiFetch(
  fetcher: () => Promise<void>,
  deps: unknown[] = [],
): ApiFetchResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetcher();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run]),
  );

  return { loading, error, refresh: run };
}

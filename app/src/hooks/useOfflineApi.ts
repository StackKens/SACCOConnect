import { useState, useEffect } from "react";
import { api } from "../services/api";
import { getCached, getCacheAge, setCached } from "../services/cache";

const FRESH_TTL_MS = 60 * 1000;

interface UseOfflineApiResult<T> {
  data: T | null;
  loading: boolean;
  isStale: boolean; // true when showing cached data while refreshing
  refresh: () => void;
}

export function useOfflineApi<T>(endpoint: string): UseOfflineApiResult<T> {
  const cached = getCached<T>(endpoint);
  const [data, setData] = useState<T | null>(cached);
  const [loading, setLoading] = useState(cached === null); // only show spinner if no cache
  const [isStale, setIsStale] = useState(cached !== null); // stale if we have cache but haven't refreshed yet

  const fetchFresh = async () => {
    try {
      const NetInfo = require("@react-native-community/netinfo").default;
      const net = await NetInfo.fetch();
      if (!net.isConnected) return;
      const res = await api.get(endpoint);
      setData(res.data.data);
      setCached(endpoint, res.data.data);
      setIsStale(false);
    } catch {
      // silently fail — cached data remains shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip the network round-trip when the cached copy is fresh enough,
    // avoiding duplicate API calls on every tab focus.
    const age = getCacheAge(endpoint);
    if (age !== null && age < FRESH_TTL_MS) {
      setIsStale(false);
      setLoading(false);
      return;
    }
    fetchFresh();
  }, [endpoint]);

  return { data, loading, isStale, refresh: fetchFresh };
}

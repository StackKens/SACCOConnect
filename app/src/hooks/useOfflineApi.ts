import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { api } from "../services/api";
import { getCached, setCached } from "../services/cache";

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
      const net = await NetInfo.fetch();
      if (!net.isConnected) return; // offline — keep showing cache
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
    fetchFresh();
  }, [endpoint]);

  return { data, loading, isStale, refresh: fetchFresh };
}

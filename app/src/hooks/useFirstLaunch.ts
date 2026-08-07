import { useEffect, useState } from "react";
import { getSecureStorage } from "../services/secureStorage";

const storage = getSecureStorage("app");

export function useFirstLaunch() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  useEffect(() => {
    const hasLaunched = storage.getBoolean("hasLaunched");
    if (!hasLaunched) {
      setIsFirstLaunch(true);
      storage.set("hasLaunched", true);
    } else {
      setIsFirstLaunch(false);
    }
  }, []);
  return isFirstLaunch;
}

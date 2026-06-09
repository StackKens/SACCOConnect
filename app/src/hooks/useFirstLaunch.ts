import { useEffect, useState } from "react";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "app" });

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

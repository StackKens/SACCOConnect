import { useEffect, useState } from "react";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "app" });

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

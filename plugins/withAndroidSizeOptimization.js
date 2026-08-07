const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Persists Android build settings that `expo prebuild` would otherwise reset.
 *
 * 1. `expo.useLegacyPackaging=true` — compresses native libraries in the APK.
 *    Without it a 2-ABI universal release APK can exceed 100MB.
 * 2. Gradle memory tuning — this machine has 7GB RAM shared with an Android
 *    emulator, so the template's 2GB daemon heap forces Gradle to swap and
 *    stalls builds. Capped heap + fewer parallel workers keep it responsive.
 */
module.exports = function withAndroidSizeOptimization(config) {
  const setProperty = (key, value) => ({
    type: "property",
    key,
    value,
  });

  return withGradleProperties(config, (config) => {
    const entries = [
      setProperty("expo.useLegacyPackaging", "true"),
      setProperty("org.gradle.jvmargs", "-Xmx1536m -XX:MaxMetaspaceSize=384m -XX:+UseParallelGC"),
      setProperty("org.gradle.workers.max", "3"),
      setProperty("kotlin.daemon.jvmargs", "-Xmx1024m"),
    ];
    const keys = new Set(entries.map((e) => e.key));
    config.modResults = config.modResults.filter(
      (item) => !item.key || !keys.has(item.key),
    );
    config.modResults.push(...entries);
    return config;
  });
};

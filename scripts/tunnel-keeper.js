#!/usr/bin/env node
const { execSync } = require("child_process");

const PORTS = [8081, 3000];

function tunnel() {
  try {
    PORTS.forEach((p) => execSync(`adb reverse tcp:${p} tcp:${p}`, { stdio: "ignore" }));
  } catch {}
}

tunnel();
console.log("ADB tunnel keeper running (ports 8081, 3000)...");
setInterval(tunnel, 3000);

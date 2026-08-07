import { prisma } from "./config/database";
import { createApp } from "./app";

const app = createApp();
const PORT = Number(process.env.PORT || 3000);

async function start() {
  // Wake Neon from sleep before accepting requests
  await prisma.$connect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SACCOConnect API listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((e) => {
  console.error("Failed to connect to database:", e.message);
  process.exit(1);
});

export default app;

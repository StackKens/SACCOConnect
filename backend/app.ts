import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import loanRoutes from "./routes/loan.routes";
import contributionRoutes from "./routes/contribution.routes";
import memberRoutes from "./routes/member.routes";
import guarantorRoutes from "./routes/guarantor.routes";
import announcementRoutes from "./routes/announcement.routes";
import { errorHandler } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "SACCOConnect API is running" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/loans", loanRoutes);
  app.use("/api/contributions", contributionRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/guarantors", guarantorRoutes);
  app.use("/api/announcements", announcementRoutes);

  app.use(errorHandler);

  return app;
}

import { execSync } from "child_process";

const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://postgres@127.0.0.1:5432/saccoconnect_test";

export default function globalSetup() {
  execSync(
    `npx prisma db push --accept-data-loss --url "${TEST_DB_URL}"`,
    {
      cwd: __dirname + "/..",
      stdio: "inherit",
    },
  );
}

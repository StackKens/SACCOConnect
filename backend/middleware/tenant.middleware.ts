import { AppError } from "./error.middleware";

/**
 * Fails closed: requires the authenticated user to have a SACCO and that the
 * resource being accessed belongs to the same SACCO.
 */
export function assertSameSacco(
  resourceSaccoId: string | null | undefined,
  tokenSaccoId: string | null | undefined,
) {
  if (!tokenSaccoId) throw new AppError("No SACCO assigned", 403);
  if (resourceSaccoId !== tokenSaccoId)
    throw new AppError("Forbidden", 403);
}

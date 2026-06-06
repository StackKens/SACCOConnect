import { useAuthStore } from "@/store/auth.store";

/** Clears session; root layout redirects to login when user becomes null. */
export function useLogout() {
  return useAuthStore((state) => state.logout);
}

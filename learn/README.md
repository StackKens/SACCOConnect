# Complete Learning Index — SACCOConnect

All files in the `learn/` folder and what they cover.

---

## Navigation & Structure
| File | What it teaches |
|------|----------------|
| `00-HOW-NAVIGATION-WORKS.md` | How tabs were created, role-based routing, hidden screens, useFocusEffect |
| `01-root-layout.md` | The auth guard, GestureHandlerRootView, Stack navigator, ThemeUpdater |
| `02-index.md` | Why index.tsx is a dumb redirect |

## Auth Screens — `app/(auth)/`
| File | Screen |
|------|--------|
| `03-auth-screens.md` | onboarding, login, register-admin (wizard pattern), join, group-rules |

## Member Screens — `app/(member)/`
| File | Screen |
|------|--------|
| `04-member-layout.md` | Tab bar setup, useFocusEffect on layout |
| `05-member-dashboard.md` | useOfflineApi, skeleton loading, null safety |
| `06-member-contributions.md` | Promise.all, active flag cleanup, status badges |
| `07-member-loans.md` | Empty state, status variant function, FAB |
| `08-member-notifications.md` | useMemo, Set for read status, FlatList, NOTIF_META strategy pattern |
| `09-member-profile.md` | Linked toggles, bottom sheet modal, Linking |
| `10-member-apply-loan.md` | Eligibility gate, guarantor multi-select, updater state form |
| `11-member-contribute.md` | Dynamic payment method UI, offline queue, local store update |
| `12-member-repay-loan.md` | Outstanding balance, max amount validation, offline repayment |
| `13-member-statement.md` | Unified transaction list, flatMap, colour-coded amounts |
| `14-member-group-rules.md` | Reading from store (no API), list keys |

## Admin Screens — `app/(admin)/`
| File | Screen |
|------|--------|
| `15-admin-layout.md` | Admin tab bar, `as const` TypeScript pattern |
| `16-admin-dashboard.md` | Three parallel API calls, atomic stats state |
| `17-admin-members.md` | Client-side search, two-state modal, query params |
| `18-admin-loan-queue.md` | Search bar, two empty state messages |
| `19-admin-loan-review.md` | Two-step rejection, already-actioned guard, data table pattern |
| `20-admin-treasury.md` | SVG line chart from scratch, EMPTY typed initial state |
| `21-admin-settings.md` | Export CSV, clear cache confirmation, static data |
| `22-admin-member-detail.md` | Extracted fetch, functional state update, smart buttons |
| `23-admin-announcements.md` | Named callback reuse, optimistic delete |
| `24-admin-active-loans.md` | Progress bar, division-by-zero guard |
| `25-admin-contributions.md` | Per-item loading state, optimistic confirm |

## Architecture
| File | What it teaches |
|------|----------------|
| `26-stores.md` | Zustand, MMKV persistence, adapter pattern, cross-store calls |
| `27-services-and-hooks.md` | Axios interceptor, error handling, offline queue, useOfflineApi |

---

## Top Patterns Used Across the App

| Pattern | Where you'll see it |
|---------|-------------------|
| `useFocusEffect` + active flag | Every list screen |
| `Promise.all` for parallel fetches | Dashboard, apply loan, contributions |
| Skeleton loading | Every screen with API data |
| Wizard / multi-step form | register-admin, join |
| Offline queue | contribute, repay_loan |
| Data-driven rendering (NOTIF_META, METHODS arrays) | notifications, contribute, repay |
| Functional state update `(prev) => ...` | apply_loan guarantors, contributions confirm |
| Adapter / mapper functions | auth.store mapUser, mapSacco |
| Early return for blocked states | apply_loan eligibility, loan-review loading |

---

## Things to Improve (Senior Notes)

1. **Extract `GroupAvatar`** — defined identically in 2+ files
2. **Extract `ThemeSettings`** — dark mode toggles duplicated in member profile and admin settings
3. **Remove `contribution.store.ts`** — dead mock store
4. **Implement refresh token** — `refreshToken` is returned but never used
5. **Replace `isOverdue` string check** — `dueDateLabel` should return `{ label, isOverdue }` object
6. **Add pagination** to statement and contributions for long-term members
7. **Server-side search** for members list at scale
8. **Soft delete** for members in a financial system
9. **`date-fns`** for accurate month arithmetic in loan due date calculation
10. **Typed route constants** to replace `as any` casts in navigation calls

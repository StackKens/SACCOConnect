# SACCOConnect — Production Engineering Review

**Review date:** August 7, 2026  
**Scope:** Mobile app (`app/`), shared client services, and backend API (`backend/`)  
**Status:** Findings only — no code changes applied yet

---

## Executive Summary

SACCOConnect has a solid feature foundation — Expo Router with role-based navigation, Zustand + MMKV persistence, a reasonable backend with Prisma/Zod/Helmet, and partial offline support. **It is not production-ready as-is.**

The highest-risk gaps are **authentication bypass paths left over from development**, **missing token lifecycle on the client**, **backend authorization boundary bugs (IDOR)**, and a **hybrid mock/API architecture** that can show incorrect financial data. There are also **no crash reporting** and **no E2E tests**.

Since the original review: the mock login/OTP bypasses are flag-gated and unreachable in production (SEC-01/02), backend tenant-isolation gaps are closed with integration tests (SEC-03), JWT secrets fail fast (SEC-05), and a structured flag-gated mock layer with fixtures/handlers/delays/scenarios replaces ad-hoc mocks (§7). **Phase 0 is complete.** Phase 1 auth hardening is underway: refresh-token lifecycle with deduped 401 interceptor and logout revocation (SEC-04/13), server-validated session restore with deactivated-member enforcement and persisted rules acceptance (SEC-11/12), per-phone brute-force protection with DB lockout (SEC-06), encrypted MMKV storage keyed from SecureStore (SEC-09), and API-backed CSV export plus single-source-of-truth contribution writes (ARCH-01). **Phase 1 is complete — SEC-04, SEC-06, SEC-09, SEC-11, SEC-12, SEC-13, ARCH-01 all resolved.**

**Estimated effort to reach production confidence:** 2–3 weeks (1 senior engineer), starting from Phase 2 production ops.

---

## 1. Security Findings

### SEC-01 — Mock login fallback bypasses real authentication

**Status:** ✅ Resolved (`b1bee52`, `89e5375`, `131411a`)

**Issue:** When the login API fails for any reason (network error, server down, wrong credentials returning network error), the app falls back to `mockLogin()` with hardcoded credentials in `app/src/store/auth.store.ts`.

**Risk:** An attacker (or accidental misconfiguration) can authenticate as admin/member using known mock phones (`0700000001`–`0700000004`) and PIN `1234` whenever the API is unreachable — including production outages or MITM blocking.

**Severity:** Critical

**Recommendation:** Remove the fallback entirely from production builds. Gate mocks behind `EXPO_PUBLIC_USE_MOCK_API=true` (dev only), never on catch blocks for auth.

**Implementation Steps:**
1. Add `USE_MOCK_API` config flag in `config.ts`.
2. Remove `mockLogin` from `auth.store.ts` login catch path.
3. Move mock auth into `/mocks` module invoked only when flag is true.
4. Add a release build check that fails CI if mock code is reachable without the flag.

**Priority:** P0  
**Estimated Development Time:** 4–6 hours

---

### SEC-02 — Client-side OTP bypass (hardcoded `123456`)

**Status:** ✅ Resolved (`b1bee52`, `fd56c14`)

**Issue:** `OtpVerification.tsx` auto-fills OTP `123456`, accepts it without server verification, and shows "Dev Mode" alerts — with no `__DEV__` guard.

**Risk:** Anyone can register admin/member accounts without phone verification in any build, including production.

**Severity:** Critical

**Recommendation:** Remove client-side OTP bypass. In dev, rely on backend `dev_otp` response only when `NODE_ENV !== 'production'`.

**Implementation Steps:**
1. Delete hardcoded OTP bypass in `OtpVerification.tsx`.
2. Surface `dev_otp` from API response only in dev builds.
3. Ensure backend never returns `dev_otp` in production (already partially done).

**Priority:** P0  
**Estimated Development Time:** 2–3 hours

---

### SEC-03 — Backend IDOR: cross-SACCO data access on admin/member endpoints

**Status:** ✅ Resolved (`e4db6fc`, `8cdef0c`, `ecfd68f`, `adde5b3`, `0821eb6`)

**Issue:** Several endpoints authenticate but do not verify the resource belongs to the caller's `saccoId`:

| Endpoint | Problem |
|---|---|
| `GET /api/loans/:id` | Any authenticated user can read any loan by ID |
| `GET /api/members/:id` | Admin can read any member across SACCOs |
| `PATCH /api/members/:id/status` | Admin can modify any member |
| `DELETE /api/members/:id` | Admin can delete any member |
| `POST /api/contributions/cash` | Admin can credit any `memberId` without sacco check |
| `DELETE /api/announcements/:id` | Admin can delete any announcement |

**Risk:** Multi-tenant data breach — one SACCO admin accesses or mutates another SACCO's financial records.

**Severity:** Critical

**Recommendation:** Add a reusable `assertSameSacco(resourceSaccoId, req.user.saccoId)` guard on every resource-scoped handler.

**Implementation Steps:**
1. Create `backend/middleware/tenant.middleware.ts`.
2. Update controllers to fetch resource + verify `member.saccoId === req.user.saccoId`.
3. Add integration tests for cross-tenant denial (403).

**Priority:** P0  
**Estimated Development Time:** 1–2 days

---

### SEC-04 — No refresh token flow on mobile; long-lived access token in plain MMKV

**Issue:** Backend issues `refreshToken` but the client never stores or uses it. Only `accessToken` is persisted in MMKV (unencrypted). Access tokens expire in **7 days**.

**Risk:** Stolen device backup or rooted phone exposes long-lived bearer tokens. No silent refresh; expired tokens fail silently across the app with no forced re-auth.

**Severity:** High

**Recommendation:** Store refresh token in `expo-secure-store` (or MMKV with encryption key from SecureStore). Implement axios response interceptor: on 401 → refresh → retry once → logout.

**Implementation Steps:**
1. Add `refreshToken` storage in SecureStore.
2. Implement `authApi.refresh()` + interceptor in `api.ts`.
3. Shorten access token TTL to 15–60 minutes on backend.
4. On logout, call server to revoke refresh token.

**Priority:** P0  
**Estimated Development Time:** 2–3 days

---

### SEC-05 — JWT secrets have insecure defaults

**Status:** ✅ Resolved (`4a11fc4`)

**Issue:** `backend/config/jwt.ts` falls back to `"dev-access-secret-change-me"` and `"dev-refresh-secret-change-me"` when env vars are missing.

**Risk:** If env vars are missing in production, tokens can be forged by anyone who reads the source.

**Severity:** Critical (if deployed without env) / High (code smell)

**Recommendation:** Fail fast at startup if secrets are missing in production. Use distinct 256-bit random secrets.

**Implementation Steps:**
1. Add startup validation in `backend/index.ts`.
2. Remove default fallback strings for production.
3. Document required env vars in `.env.example`.

**Priority:** P0  
**Estimated Development Time:** 2 hours

---

### SEC-06 — 4-digit PIN only; no lockout or rate limiting on auth

**Status:** ✅ Resolved (`260952d`)

**Issue:** PIN is 4 digits (~10,000 combinations). Login/OTP endpoints share a global 200 req/15 min limit with no per-phone throttling. No failed-attempt counter or account lockout.

**Risk:** Online brute-force of PINs, especially combined with SEC-01 mock fallback.

**Severity:** High

**Recommendation:** Add stricter rate limits on `/api/auth/login`, `/api/auth/otp/*` (e.g. 5 attempts per phone per 15 min). Track failed attempts in DB; lock account after N failures.

**Implementation Steps:**
1. Add `express-rate-limit` per-route on auth endpoints.
2. Add `failedLoginAttempts` + `lockedUntil` on User model.
3. Consider 6-digit PIN or PIN + biometric.

**Priority:** P1  
**Estimated Development Time:** 1–2 days

---

### SEC-07 — CORS allows any origin with credentials

**Issue:** `cors({ origin: true, credentials: true })` in `backend/index.ts`.

**Risk:** If a web admin panel is added later, any origin could make credentialed requests. Lower risk for pure mobile Bearer-token clients today.

**Severity:** Medium

**Recommendation:** Restrict to known origins in production.

**Priority:** P2  
**Estimated Development Time:** 1 hour

---

### SEC-08 — OTP stored in plaintext in database

**Issue:** `OtpCode.code` is stored as plain text in PostgreSQL.

**Risk:** DB breach exposes active OTPs.

**Severity:** Medium

**Recommendation:** Hash OTPs (bcrypt/sha256 + salt) like passwords; compare on verify.

**Priority:** P2  
**Estimated Development Time:** 4 hours

---

### SEC-09 — Sensitive PII in unencrypted local storage

**Status:** ✅ Resolved (`1778279`)

**Issue:** MMKV stores `user` (name, phone, nationalId), `sacco`, tokens, financial cache — no encryption at rest.

**Risk:** Device compromise exposes member identity and session.

**Severity:** High

**Recommendation:** Encrypt MMKV with a key from `expo-secure-store`, or store tokens exclusively in SecureStore. Minimize PII cached locally.

**Priority:** P1  
**Estimated Development Time:** 1–2 days

---

### SEC-10 — No certificate pinning

**Issue:** App trusts system CAs; production API URL is HTTPS (`app.json` → Railway) but no pinning.

**Risk:** MITM on compromised networks (corporate proxies, rogue Wi‑Fi) can intercept tokens and financial data.

**Severity:** Medium (High for financial apps in hostile networks)

**Recommendation:** Implement SSL pinning via `expo-dev-client` + native module (e.g. `react-native-ssl-pinning`) for production builds.

**Priority:** P2  
**Estimated Development Time:** 2–3 days

---

### SEC-11 — Client route protection is UI-only; session not validated server-side on restore

**Status:** ✅ Resolved (`17ea23a`)

**Issue:** `checkAuth()` restores session from local MMKV if `user` + `token` exist — no `/me` validation, no expiry check.

**Risk:** Revoked/deactivated users retain app access until token expires. Role changes not reflected.

**Severity:** High

**Recommendation:** On app launch, call `/api/members/me` (or `/auth/me`); logout on 401/403.

**Priority:** P1  
**Estimated Development Time:** 4–6 hours

---

### SEC-12 — Rules acceptance bypass on session restore

**Status:** ✅ Resolved (`17ea23a`)

**Issue:** `rules_accepted_${userId}` is written in `acceptRules()` but **never read** in `checkAuth()`, which always sets `rulesAccepted: true`.

**Risk:** Legal/compliance gap — members skip mandatory rules acceptance after first login.

**Severity:** Medium

**Recommendation:** Read `rules_accepted_${user.id}` from MMKV in `checkAuth()` and route to group-rules if false.

**Priority:** P2  
**Estimated Development Time:** 2 hours

---

### SEC-13 — No 401 response interceptor / automatic logout

**Status:** ✅ Resolved (`c38dfbb`, included in SEC-04)

**Issue:** `api.ts` only attaches Bearer token on request; no response handling for expired tokens.

**Risk:** Stale sessions, silent API failures, confusing UX; offline queue may replay with expired tokens.

**Severity:** High

**Recommendation:** Add axios response interceptor tied to refresh flow (SEC-04).

**Priority:** P1  
**Estimated Development Time:** Included in SEC-04

---

### SEC-14 — Offline queue lacks idempotency and auth refresh

**Issue:** `offlineQueue.ts` replays POSTs on reconnect without idempotency keys or token refresh.

**Risk:** Duplicate contributions/repayments; failed replays after token expiry.

**Severity:** Medium

**Recommendation:** Add client-generated idempotency key header; backend deduplicates. Refresh token before flush.

**Priority:** P2  
**Estimated Development Time:** 2–3 days

---

### SEC-15 — Dev OTP logged to console server-side

**Issue:** `[DEV OTP]` logs phone + code when Twilio is unconfigured.

**Risk:** OTP exposure in production logs if Twilio misconfigured.

**Severity:** Medium

**Recommendation:** Only log in development; alert/metric if Twilio missing in production.

**Priority:** P2  
**Estimated Development Time:** 1 hour

---

### SEC-16 — `announcement.author` accepted from request body

**Issue:** `postAnnouncement` uses `author` from `req.body` — spoofable.

**Severity:** Low

**Recommendation:** Derive author from authenticated admin's member profile.

**Priority:** P3  
**Estimated Development Time:** 30 minutes

---

### SEC-17 — Additional security recommendations

| Topic | Severity | Recommendation |
|---|---|---|
| Biometric login | Medium opportunity | `expo-local-authentication` after PIN setup |
| Root/jailbreak detection | Low–Medium | Flag high-risk devices; optional block for admin |
| Logout server-side | Medium | Revoke refresh token on logout |
| `LOAN_OFFICER` role | Low | Defined in schema but unused — implement or remove |

---

## 2. Architecture Review

### Strengths

- Clear Expo Router groups: `(auth)`, `(member)`, `(admin)`.
- Shared UI component library under `app/src/components/ui/`.
- Backend separation: routes → controllers → services → Prisma.
- Zod validation on backend; MMKV for fast local reads.
- `useOfflineApi` hook is a good cache-first pattern (used on dashboard).

### ARCH-01 — Hybrid mock/API architecture causes data inconsistency

**Status:** ✅ Resolved (`590c56f`)

**Issue:** Some flows hit the API (`contributions.tsx`, admin screens); others use local Zustand stores (`member.store.ts`, `loan.store.ts`); `contribute.tsx` writes to **both** API and local store; `exportData.ts` reads **local mock helpers only**; notifications merge local loan store + API announcements.

**Risk:** Users and admins see different numbers for the same account. CSV export may be wrong in production.

**Severity:** High (functional correctness)

**Recommendation:** Single source of truth: API → store hydration. Remove duplicate local mutation paths. Keep mocks behind one flag.

**Priority:** P0  
**Estimated Development Time:** 3–5 days

---

### ARCH-02 — No unified API service layer

**Issue:** Screens call `api.get/post` directly; auth is split across `auth.service.ts`, `api.ts`, stores.

**Recommendation:** Introduce `services/*.service.ts` per domain (loans, members, contributions) consumed by stores. Enables clean mock swap.

**Priority:** P1  
**Estimated Development Time:** 2–3 days

---

### ARCH-03 — Dead/legacy code

**Issue:** `contribution.store.ts` (dummy data), `helpers/members.ts` (MMKV scan for demo members), `createSACCO` in auth store (local-only) appear unused or legacy.

**Recommendation:** Delete or quarantine under `/mocks` to reduce confusion.

**Priority:** P2  
**Estimated Development Time:** 4 hours

---

### ARCH-04 — No error boundaries

**Status:** ✅ Resolved (`e69f11e`)

**Issue:** Unhandled render errors crash the entire app.

**Recommendation:** Add root `ErrorBoundary` with recovery UI in `_layout.tsx`.

**Priority:** P2  
**Estimated Development Time:** 3–4 hours

---

### ARCH-05 — Backend in monorepo but mobile README still says "replace mock data"

**Issue:** Documentation doesn't match current partial integration state.

**Priority:** P3  
**Estimated Development Time:** 2 hours

---

## 3. Performance Review

| ID | Issue | Severity | Recommendation | Est. Time |
|---|---|---|---|---|
| PERF-01 | Admin `members.tsx` renders list with `.map()` not `FlatList` | Medium | Use `FlatList` with `keyExtractor`, `getItemLayout` for 100+ members | 3 hrs |
| PERF-02 | `notifications.tsx` rebuilds merged list on every focus | Low | Memoize; paginate announcements | 4 hrs |
| PERF-03 | No `React.memo` on list item components | Low | Memoize row components | 2 hrs |
| PERF-04 | `apply_loan` FlatList inside Modal lacks perf props | Low | Add `initialNumToRender` / windowing tuning | 1 hr |
| PERF-05 | Duplicate API calls on tab focus across screens | Medium | Centralize data in stores with TTL cache | 1 day |
| PERF-06 | No image optimization (avatars are initials — OK) | N/A | — | — |
| PERF-07 | Bundle — no analysis configured | Low | Add `expo-atlas` or bundle analyzer in CI | 4 hrs |

**Measurable target:** Member list scroll at 60fps with 500 members; dashboard load < 300ms with warm cache.

---

## 4. UX Review

### Strengths

- Consistent `ScreenWrapper`, `PageHeader`, theme support (light/dark/system).
- Skeleton loaders on several screens.
- Confirmation dialogs on destructive admin actions.
- Offline contribute/repay with user feedback.

### Gaps

| ID | Issue | Severity | Recommendation | Priority | Est. Time |
|---|---|---|---|---|---|
| UX-01 | Silent failures: widespread `.catch(() => {})` | High | Show error state + retry button | P1 | 1 day |
| UX-02 | `EmptyState` component exists but rarely used | Medium | Use consistently on empty lists | P2 | 4 hrs |
| UX-03 | No pull-to-refresh | Medium | Add `RefreshControl` on list screens | P2 | 4 hrs |
| UX-04 | No accessibility labels anywhere | High | Add `accessibilityLabel`/`Role` to buttons, inputs, tabs | P1 | 2 days |
| UX-05 | PIN input lacks visibility toggle / haptic feedback | Low | Optional show-PIN, haptic on error | P3 | 2 hrs |
| UX-06 | Login phone validation inconsistent (backend normalizes; client doesn't) | Medium | Share phone normalizer with backend | P2 | 2 hrs |
| UX-07 | Repay/contribute offline queue doesn't update UI optimistically | Medium | Optimistic update + sync indicator | P2 | 1 day |

---

## 5. Missing Features (Genuinely Valuable Only)

### Security & Trust

| Feature | Why | Priority | Est. Time |
|---|---|---|---|
| Biometric unlock | Reduces PIN exposure; standard for finance apps | P1 | 2–3 days |
| Account lockout + login alerts (SMS) | Fraud detection for SACCO accounts | P1 | 2 days |
| Admin audit log | Who approved/rejected loans, recorded cash | P1 | 3–4 days |
| PIN change / reset flow | Required for production support | P1 | 2 days |

### Member

| Feature | Why | Priority | Est. Time |
|---|---|---|---|
| Push notifications | Loan approval, due dates (backend has SMS stubs) | P1 | 3–5 days |
| PDF / shareable statements | README claims PDF-ready; not implemented | P2 | 2–3 days |
| Transaction search/filter | Usability at scale | P2 | 1–2 days |
| Loan eligibility calculator (in-app) | Backend has `calculateEligibility`; surface before apply | P2 | 1 day |

### Admin

| Feature | Why | Priority | Est. Time |
|---|---|---|---|
| Approval history | Compliance and dispute resolution | P2 | 2 days |
| Granular roles (`LOAN_OFFICER` exists in schema) | Separation of duties | P2 | 3 days |
| Server-backed CSV export | Current export uses local mock data | P1 | 1 day |

### Operational

| Feature | Why | Priority | Est. Time |
|---|---|---|---|
| Structured mock API layer | Flag-gated adapter + handlers ✅ (see §7) | P0 | Done |
| Crash reporting (Sentry/Bugsnag) | Production visibility | P0 | 1 day |
| In-app support / feedback | Reduce support friction | P3 | 1–2 days |

**Not recommended now:** QR payments, multi-language, fraud ML, device management — add after core security and data consistency are fixed.

---

## 6. Production Readiness Checklist

| Area | Status | Notes |
|---|---|---|
| Authentication | ❌ Missing | Mock bypass, OTP bypass, no refresh flow |
| Authorization | ❌ Missing | Client UI-only; backend IDOR |
| Validation | ⚠ Needs improvement | Backend Zod good; client inconsistent; rules acceptance broken |
| Performance | ⚠ Needs improvement | OK for small SACCOs; list rendering needs work |
| Offline support | ⚠ Needs improvement | Partial queue; no idempotency; data split |
| Testing | ⚠ Needs improvement | App + backend vitest harnesses added; no E2E |
| Logging | ⚠ Needs improvement | `console.error` only; OTP dev logs |
| Crash reporting | ❌ Missing | No Sentry/Crashlytics |
| Monitoring | ❌ Missing | No APM, no health check alerting |
| Backups | ⚠ Needs improvement | Depends on Railway/Neon config (not in repo) |
| Accessibility | ❌ Missing | No a11y props |
| Error handling | ⚠ Needs improvement | Silent catches; no error boundaries |
| Security | ⚠ Needs improvement | SEC-01/02/03/05 resolved; SEC-04/06/09/11/13 remain |
| Code quality | ⚠ Needs improvement | TypeScript strict ✅; dead code; hybrid architecture |
| Deployment readiness | ⚠ Needs improvement | No `eas.json`; production API URL in `app.json`; no CI |

---

## 7. Testing Mode Requirements

### Current State

- ✅ `mockAuth.ts` replaced by a flag-gated mock layer (`EXPO_PUBLIC_USE_MOCK_API=true`), never reachable in production (config throws if the flag is set in a release build).
- ✅ Mock login/OTP/register/join/invite flows live in `app/src/mocks/` and are only invoked when the flag is on; `auth.store.ts` no longer falls back to mocks on API errors.
- ✅ Dedicated `USE_MOCK_API` flag in `config.ts`; the `api` axios instance swaps in a mock adapter (`api.mock.ts`) when set.
- ✅ Simulated delays, error/empty scenarios, and per-member fixtures in the mock handlers.
- ✅ `.env.example` points to local backend.

### Required Architecture (Implemented)

```
app/src/
  config.ts          → USE_MOCK_API flag ✅
  services/
    api.ts           → real axios client ✅
    api.mock.ts      → mock axios adapter ✅
  mocks/
    data.ts          → typed fixtures (members, loans, contributions, announcements) ✅
    handlers.ts      → auth, loans, contributions, members, announcements ✅
    delays.ts        → simulated network latency ✅
    scenarios.ts     → expired token, 401, 500, empty data ✅
    auth.mock.ts     → mock logins/OTP (flag-gated) ✅
```

Backend: tenant-isolation integration tests with two-tenant fixtures (`backend/test/*.tenant.test.ts`), app-side vitest harness for mock modules.

**Issue:** Mocks are embedded in auth flow instead of isolated.  
**Risk:** Production security breach + unreliable testing.  
**Severity:** Critical  
**Recommendation:** Implement flag-gated mock layer; never fall back to mocks on API error.  
**Priority:** P0  
**Estimated Development Time:** 3–5 days

---

## 8. Prioritized Remediation Roadmap

| Phase | Items | Duration |
|---|---|---|
| **Phase 0 — Block release** | SEC-01, SEC-02, SEC-03, SEC-05, mock layer (§7) | 1 week — ✅ Done |
| **Phase 1 — Auth hardening** | SEC-04, SEC-06, SEC-09, SEC-11, SEC-12, SEC-13, ARCH-01 | 1–2 weeks — ✅ Done |
| **Phase 2 — Production ops** | Tests, Sentry, EAS config, CI, error boundaries, a11y basics | 1–2 weeks — error boundaries ✅ |
| **Phase 3 — UX & features** | Push notifications, audit log, PDF statements, biometrics | Ongoing |

---

## Summary Verdict

| Dimension | Grade | Production Ready? |
|---|---|---|
| Security | C+ | No |
| Architecture | B | Partially |
| Performance | B- | Yes for MVP scale |
| UX | B- | Mostly |
| Testing | D | No |
| **Overall** | **Not ready** | Phase 0 and Phase 1 complete; Phase 2 production ops next |

---

## Implementation Log

| Date | Item | Status |
|---|---|---|
| 2026-08-07 | SEC-01 | Done |
| 2026-08-07 | SEC-02 | Done |
| — | SEC-03 | Pending |
| — | SEC-05 | Pending |
| — | Mock layer (§7) | Pending |

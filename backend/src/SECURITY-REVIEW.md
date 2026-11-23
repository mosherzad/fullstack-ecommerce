# Backend Security Review

## Scope and method

Read-only review of the backend authentication flow and common web attack surfaces, including routes, controllers, middleware, Prisma access, token handling, cookies, validation, and error handling. No application files were changed as part of the review.

The worktree already contained uncommitted edits in `backend/src/controllers/authController.ts`, `backend/src/app.ts`, and the backend package manifests. In particular, the current `authController.ts` edit removes `accessToken` from the login JSON response. Findings below are based on the reviewed implementation; the refresh endpoint still returns an access token in its JSON response.

## Confirmed findings

| # | Severity | File | Lines | Finding | Confidence |
|---|----------|------|-------|---------|------------|
| 1 | HIGH | `backend/src/controllers/passwordController.ts` | 82 | Password-reset URL is built from request protocol/Host data. If an attacker-controlled Host is accepted by the deployment, a victim's reset email can send the reset token to an attacker-controlled domain, enabling account takeover. The verification-resend flow uses the same URL construction pattern in `emailValidationController.ts:40`. | 9/10 |
| 2 | HIGH | `backend/src/routes/orderRoute.ts`; `backend/src/controllers/orderController.ts` | 27; 48-52 | The order-by-ID route does not apply authentication middleware, and its handler returns an order without checking ownership. Anyone who obtains an order ID can retrieve that order's data, including its shipping address. | 9/10 |
| 3 | MEDIUM | `backend/src/controllers/authController.ts` | 61-67, 125-149 | Email verification is not enforced at login or in `protect`; new accounts default to unverified. A registrant can authenticate without proving control of the supplied email address. | 9/10 |
| 4 | MEDIUM | `backend/src/controllers/tokenController.ts` | 130-133 | The refresh endpoint includes the access token in its JSON response in addition to setting an HttpOnly cookie. JavaScript can read and exfiltrate that token if a script-injection vulnerability exists. | 8/10 |
| 5 | LOW | `backend/src/controllers/globalErrorHandler.ts`; `backend/src/controllers/authController.ts`; `backend/prisma/schema.prisma` | 20-24; 40-45; 19 | Duplicate registration returns a distinct conflict response for an existing unique email, while new registration returns success. This permits unauthenticated email-account enumeration. | 10/10 |

## Additional weaknesses and edge cases

- **Inconsistent cookie paths:** Login cookie setters omit `Path` (`backend/src/controllers/authController.ts:90-102`), so browsers default the cookie path based on the login route. Refresh explicitly sets `Path=/` (`backend/src/controllers/tokenController.ts:114-128`), while logout clears cookies without an explicit path (`backend/src/controllers/authController.ts:214-224`). This can cause duplicate cookies or prevent the intended cookie from being cleared/sent consistently.
- **Reset password validation differs from the stated password policy:** the reset schema requires a string but does not apply the minimum length enforced by registration/change-password validation (`backend/src/schemas/userSchema.ts:28-31`).
- **Password-reset token consumption is not atomic:** the reset flow checks the token and then updates the user in separate operations (`backend/src/controllers/passwordController.ts:127-158`). Concurrent requests holding the same valid token may both pass the initial check. Exploitation requires prior possession of the reset token.
- **Account activity state is not checked:** authentication does not enforce `isActive` (`backend/src/controllers/authController.ts:49-57, 125-149`). The reviewed admin routes did not establish a current API path for disabling accounts, so an exploitable bypass could not be confirmed.

## Other attack classes reviewed

- No use of Prisma raw-query APIs or unsafe raw SQL was found. Inspected database access uses Prisma query APIs; no SQL injection was confirmed.
- No backend HTML rendering or unsafe HTML sink was found, and no confirmed stored/reflected XSS issue was identified in the backend. Client-side DOM XSS is outside this backend-only review.
- No CORS middleware, redirect flow, or relevant NoSQL database/query layer was found in the inspected backend. No confirmed open redirect, NoSQL injection, or HTTP header injection was identified.
- Profile update validation does not permit privileged fields such as role, and signup explicitly selects returned user fields. No confirmed mass-assignment issue was identified.
- Rate limiting is present in the application, but deployment-specific behavior and resistance to distributed credential stuffing or proxy/IP spoofing could not be verified from repository code alone.
- The `SameSite=Strict`, `HttpOnly`, and production `Secure` cookie settings reduce browser-based cross-site credential exposure. No separate CSRF token mechanism was identified; the effect of `SameSite=Strict` depends on deployment/browser context and does not address the Host-header issue.

## Risk ranking and recommendations

1. **High — Reset-link Host-header poisoning:** generate reset and verification links from a configured canonical origin and reject unexpected Host values at the application or trusted ingress.
2. **High — Unprotected order lookup:** require authentication and enforce owner-or-admin access before returning an order; return only necessary fields.
3. **Medium — Unverified accounts:** if mailbox ownership is required, prevent token issuance and protected access until verification succeeds.
4. **Medium — Access token in refresh response:** keep access credentials out of JSON responses when using HttpOnly cookie authentication.
5. **Low — Email enumeration:** use a generic registration response if revealing account existence is not intended.
6. Make cookie path and clearing behavior consistent, enforce password policy on reset, and consume reset tokens atomically.
7. Decide whether `isActive` is an authorization control and enforce it consistently if it is.
8. Validate rate limiting, Host handling, proxy trust, TLS termination, and cookie behavior in the actual deployment environment.

## Overall assessment

The backend has useful security foundations, including bcrypt password hashing, short-lived access tokens, hashed refresh/reset/verification tokens, refresh rotation, and token-version invalidation. The unauthenticated order lookup is a direct access-control flaw, and reset-link construction can enable account takeover where untrusted Host values are accepted. Email verification enforcement and token exposure from the refresh response also need attention. Deployment controls that could mitigate some risks were not available for verification.

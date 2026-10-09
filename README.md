# FinConsent

**Enterprise Statutory Trade Authorization, Capital Gains Tax Transparency & Tamper-Evident Consent Infrastructure for SEBI-Registered Investment Advisers (RIAs)**

[![Tests](https://img.shields.io/badge/Vitest-200%2F200%20Passing%20(15%20Suites)-brightgreen)](#testing--security-validation-evidence)
[![ESLint](https://img.shields.io/badge/ESLint-0%20errors%20%7C%200%20warnings-brightgreen)](#testing--security-validation-evidence)
[![SEBI](https://img.shields.io/badge/SEBI-Regulation%2019%20Compliant-blue)](#sebi-regulatory-and-legal-compliance)
[![Evidence Act](https://img.shields.io/badge/Indian%20Evidence%20Act-Section%2065B%20Certified-indigo)](#sebi-regulatory-and-legal-compliance)
[![Encryption](https://img.shields.io/badge/Cryptography-AES--256--GCM%20%7C%20PBKDF2-darkblue)](#security--cryptographic-architecture)
[![Data Residency](https://img.shields.io/badge/Data%20Residency-AWS%20Mumbai%20(ap--south--1)-orange)](#deployment--hosting-architecture)

---

## Executive Overview

**FinConsent** is an institutional-grade B2B WealthTech platform engineered specifically for Indian SEBI-Registered Investment Advisers (RIAs), compliance directors, and High-Net-Worth Individuals (HNIs). Operating strictly under **Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013**, FinConsent provides an immutable, auditable digital rail for non-discretionary investment advisory workflows.

In India's fee-only advisory landscape, non-discretionary advisers cannot execute securities transactions on behalf of clients without **prior, informed, explicit client authorization**. Traditionally, advisers and clients coordinate rebalancing recommendations across fragmented, non-compliant channels such as WhatsApp chats, email threads, SMS messages, or recorded phone calls. This legacy operational approach exposes advisory firms to severe regulatory penalties, client dispute liabilities, and zero statutory evidentiary protection. Furthermore, following the **Finance Act 2024 (Union Budget 2024)** capital gains tax overhauls, executing portfolio rebalancing without transparent pre-trade tax calculations frequently results in unexpected Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) tax shocks for clients.

FinConsent resolves this systemic friction by coupling an automated **Indian Capital Gains & Advance Tax Engine** with a **dual-envelope AES-256-GCM encrypted trade mandate lifecycle**, a scoped in-app mandate clarification chat rail, mandatory client-side password protection, 6-digit Mobile OTP verification, and an append-only **SHA-256 forward-hash chained audit ledger** that satisfies **Section 65B of the Indian Evidence Act, 1872 / Information Technology Act, 2000**.

---

## The FinConsent Problem & Regulatory Imperative

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               THE LEGACY ADVISORY RISK                                 │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ Legacy Operational Reality               │ Regulatory & Business Consequence            │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ • Informal approvals over WhatsApp      │ • Disallowed under SEBI Reg 19; fails        │
│   or unauthenticated email threads.     │   electronic evidence admissibility.         │
│ • No pre-trade tax visibility; clients  │ • Post-trade tax shock (STCG 20%, LTCG       │
│   surprised by advance tax penalties.   │   12.5% post-Budget 2024); client churn.     │
│ • Dispersed documentation across PDFs,  │ • Inability to produce tamper-evident audit  │
│   spreadsheets, and phone recordings.   │   trails during SEBI regulatory inspections. │
│ • Discretionary execution risk; advisor │ • Personal liability for advisory directors  │
│   accused of unauthorized trading.      │   under SEBI inspection scrutiny.            │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### Statutory Regulatory Pillars:
1. **SEBI (Investment Advisers) Regulations, 2013 — Regulation 19:** Mandates that every non-discretionary RIA maintain comprehensive, time-stamped client records, explicit suitability rationale, investment advice dispatched, and unambiguous client consent preserved for a statutory minimum of **5 years (1,825 days)**.
2. **Indian Evidence Act, 1872 & IT Act, 2000 — Section 65B:** Electronic consent records are inadmissible in Indian courts and arbitration tribunals unless accompanied by a cryptographically verified electronic certificate identifying device IP, user-agent, server timestamp (IST), and hash integrity.
3. **Finance Act 2024 Capital Gains Regime:** Immediate statutory tax visibility is vital: Short-Term Capital Gains (STCG) taxed at **20.0%** (Section 111A) and Long-Term Capital Gains (LTCG) taxed at **12.5%** above the statutory ₹1,25,000 exemption (Section 112A).
4. **Income Tax Act, 1961 — Sections 234B & 234C:** Mandates quarterly advance tax installments when net tax liability exceeds ₹10,000, imposing 1% monthly penal interest for delayed compliance.

---

## Core Personas & Role Taxonomy

FinConsent supports five distinct system roles, each bounded by strict Role-Based Access Control (RBAC) and multi-tenant isolation:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ACTOR & ROLE MATRIX                                │
├─────────────────────┬──────────────────────┬──────────────────────┬────────────────────┤
│ Role ID             │ Real Synthetic Actor │ Primary Interface    │ Key Responsibilities│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ sebi-ria            │ Suresh Narayanan     │ Desktop Advisory Hub │ • Portfolio drift  │
│                     │ Prudent Wealth       │ `/dashboard`         │   formulation      │
│                     │ INA000018421         │ `/mandates/new`      │ • Tax engine calc  │
│                     │ ria@example.in       │ `/clients`           │ • Mandate dispatch │
│                     │                      │                      │ • Clarification chat│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ hni-client          │ Rohan Mehta          │ Mobile Smartphone    │ • Zero-login link  │
│                     │ Client # cli_1       │ `/m/:token`          │ • PAN+DOB password │
│                     │ client@example.in    │ `/m/:token/verify`   │ • Proposal review  │
│                     │ PAN: ABCDE1234F      │ `/m/:token/receipt`  │ • Mandate chat     │
│                     │ DOB: 14/08/1978      │ Authenticated Portal │ • OTP authorization│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ compliance_officer  │ Vikramaditya Roy     │ Compliance Hub       │ • Pre-trade review │
│                     │ Chief Compliance     │ `/requests`          │ • Reg 19 scrutiny  │
│                     │ compliance@example.in│ `/mandates/:id`      │ • Hash chain audit │
│                     │                      │ Modal Dossier        │ • Section 65B cert │
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ admin               │ Neha Singhania       │ Operations Command   │ • Platform health  │
│                     │ Super Administrator  │ `/dashboard`         │ • Cross-tenant obs │
│                     │ admin@example.in     │ User Administration  │ • Quota governance │
│                     │                      │ System Audits        │ • Disaster recovery│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ guest               │ Public Evaluator     │ Public Showcase      │ • DPDP disclosures │
│                     │ Anonymous Visitor    │ `/`                  │ • 1-Click test-drives│
│                     │                      │ `/legal/*`           │ • Practice signup  │
└─────────────────────┴──────────────────────┴──────────────────────┴────────────────────┘
```

---

## Core Workflow & Mandate Lifecycle

The FinConsent end-to-end statutory trade consent workflow executes across nine deterministic phases:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 END-TO-END WORKFLOW SEQUENCE                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   [ 1. FORMULATION ]  RIA Suresh Narayanan drafts portfolio rebalance (Equities -> Debt & Gold)
            │
            ▼
   [ 2. TAX VISIBILITY] Real-time Union Budget 2024 Engine computes STCG (20%) & LTCG (12.5%)
            │
            ▼
   [ 3. SECURE DISPATCH] Dual-envelope encryption generates 256-bit magic token with 48h cutoff
            │
            ▼
   [ 4. CLIENT DELIVERY] Delivered via WhatsApp / Email; token stored as SHA-256 hash in DB
            │
            ▼
   [ 5. PASSWORD UNLOCK] Client Rohan Mehta inputs PAN Last 4 + DOB (DDMMYYYY) on mobile
            │
            ▼
   [ 6. ADVISORY CHAT  ] Rohan asks clarification; Suresh replies in-app (Chat != Consent)
            │
            ▼
   [ 7. EXPLICIT CONSENT] Rohan checks statutory declarations; requests 6-digit Mobile OTP
            │
            ▼
   [ 8. OTP VERIFICATION] Distributed rate limiter validates OTP; burns token atomically
            │
            ▼
   [ 9. LOCKED EVIDENCE] Mandate locked; Section 65B Certificate & SHA-256 hash ledger committed
```

### Mandate State Machine

```
              ┌──────────────────────────────────────────────┐
              │                                              │
              ▼                                              │
         ┌─────────┐      RIA Dispatches Link       ┌──────────┐
         │  DRAFT  │ ─────────────────────────────> │   SENT   │
         └─────────┘                                └──────────┘
              │                                          │
              │                                          │ Client Inputs
              │                                          │ PAN + DOB Password
              │                                          ▼
              │                                     ┌──────────┐
              │                                     │  VIEWED  │ (In Review)
              │                                     └──────────┘
              │                                          │
              │                                          │ 1. Accept Declarations
              │ 48-Hour Cutoff                           │ 2. Verify 6-Digit OTP
              │ Elapsed                                  ▼
              │                                     ┌───────────┐
              └───────────────────────────────────> │ CONSENTED │ (Immutable Lock)
                                                    └───────────┘
                                                         │
                                                         ▼
                                                    ┌───────────┐
                                                    │  REVOKED  │ (Manual RIA Revoke
                                                    └───────────┘  or Expired Link)
```

---

## Security & Cryptographic Architecture

FinConsent implements a multi-layered defense-in-depth security model to safeguard sensitive investor portfolios, PAN data, and statutory records:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DUAL-ENVELOPE ENCRYPTION ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   SENSITIVE FINANCIAL PAYLOAD                                                          │
│   (Trade quantities, ISINs, sale values, tax calculations, rebalancing rationale)     │
│                              │                                                         │
│                              ▼  Encrypted with 256-bit random Data Encryption Key (DEK)│
│                     ┌──────────────────┐                                               │
│                     │   AES-256-GCM    │                                               │
│                     │ (Auth Tag 16-byte│                                               │
│                     └────────┬─────────┘                                               │
│                              │                                                         │
│         ┌────────────────────┴────────────────────┐                                    │
│         ▼                                         ▼                                    │
│   SERVER WRAPPING (RIA Access)              CLIENT WRAPPING (Investor Access)          │
│   Wrapped with Server Master Key            Wrapped with Derived Client Key            │
│   via AES-256-GCM                           via PBKDF2 (100,000 rounds, SHA-256)       │
│   (Derived from JWT_SECRET + salt)          Key: PBKDF2(PAN_last_4 + DOB, salt)        │
│                                                                                        │
│   * Result: Neither plaintext DEK nor client password is ever persisted in database.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Mandate Password Protection
- Unauthenticated visitors presenting a valid magic link URL (`/m/:token`) receive strictly minimal, non-sensitive metadata (RIA firm name, advisor name, and client name).
- All security names, ISIN codes, transaction amounts, asset allocations, capital gains figures, and advisory rationale remain encrypted until client inputs their password.
- Client password is systematically formatted from standard Indian KYC attributes: `Last 4 digits of PAN` + `Date of Birth in DDMMYYYY` (e.g., PAN `ABCDE1234F` + DOB `14-08-1978` = `123414081978`).
- Upon successful password validation, the server emits a short-lived, signed client unlock JWT (`x-unlock-token`) valid for **2 hours**, allowing decrypted viewing and access to the scoped mandate chat.

### 2. Magic Link Token Security & Single-Use Hashing
- Magic tokens are generated using high-entropy CSPRNG: `crypto.randomBytes(32).toString('hex')` (256 bits of entropy).
- **Zero Raw Tokens in Database:** Raw tokens are one-way hashed with SHA-256 (`magicTokenHash`) prior to MongoDB persistence. The raw token exists in memory solely during active dispatch.
- **Single-Use Revocation:** The instant the client authorizes the mandate via OTP, the token is permanently revoked and burned. Re-visiting the link returns `410 Gone / 404 Not Found`.

### 3. Distributed OTP Protection & Anti-Brute-Force Lockout
- **6-Digit Dynamic OTP:** Generated with a 5-minute Time-To-Live (TTL).
- **Strict Attempt Counter:** Maximum of **3 failed verification attempts**. Upon the 3rd consecutive incorrect OTP entry, the mandate token is permanently locked, triggering an `OTP_LOCKOUT` audit event and returning `HTTP 429 Too Many Requests`.
- **Distributed State Synchronization:** Backed by `SharedStateStore` to synchronize rate-limit counters and lockout state across distributed server worker instances.

### 4. Tenant Isolation & IDOR Defense
- Every API endpoint strictly validates tenancy: an RIA can access only clients, mandates, and requests belonging to their verified organization (`req.user.firmName` / `req.user.id`).
- Attempted cross-tenant queries (e.g., RIA 1 querying Client 201 or Mandate 101 of RIA 2) are immediately intercepted and rejected with `HTTP 403 Forbidden`.
- Client role accounts attempting advisor actions (`/mandates/new`, `/settings/billing`) are blocked at both React Router (`ProtectedRoute.jsx`) and Express middleware (`requireRole(['ria', 'admin'])`).

### 5. Multi-Factor Authentication (MFA)
- Advisory and compliance staff accounts support RFC 6238 TOTP Two-Factor Authentication (Google Authenticator, Microsoft Authenticator).
- Primary credentials return `mfaRequired: true` and a temporary session token. Access to protected API endpoints requires completing the TOTP challenge.

---

## Tamper-Evident Audit Trail & Legal Admissibility

FinConsent maintains an append-only cryptographic ledger where every lifecycle event is immutably recorded:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        APPEND-ONLY SHA-256 HASH CHAINING                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   AUDIT RECORD N-1                      AUDIT RECORD N                                 │
│   ┌───────────────────────────────┐     ┌───────────────────────────────┐              │
│   │ event: MANDATE_DISPATCHED     │     │ event: PASSWORD_UNLOCKED      │              │
│   │ timestamp: 2026-10-08T10:15   │     │ timestamp: 2026-10-08T10:22   │              │
│   │ ipAddress: 103.21.12.44       │     │ ipAddress: 49.36.110.12       │              │
│   │ payloadHash: c4b8f0...        │────►│ prevHash:    c4b8f0...        │              │
│   │ prevHash:    a10e82...        │     │ payloadHash: e92a71...        │              │
│   └───────────────────────────────┘     └──────────────┬────────────────┘              │
│                                                        │                               │
│                                                        ▼                               │
│                                         AUDIT RECORD N+1 (CONSENTED)                   │
│                                         ┌───────────────────────────────┐              │
│                                         │ event: CONSENT_GRANTED        │              │
│                                         │ timestamp: 2026-10-08T10:28   │              │
│                                         │ prevHash:    e92a71...        │              │
│                                         │ payloadHash: 7f3d99...        │              │
│                                         └───────────────────────────────┘              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Auditable Event Catalog
- `MANDATE_CREATED`: Portfolio parameters, target allocation, and rationale drafted.
- `MANDATE_DISPATCHED`: 256-bit magic link generated; 48-hour cutoff timer initiated.
- `MANDATE_VIEWED`: Client accesses the link; device IP and User-Agent recorded.
- `PASSWORD_UNLOCKED`: Client successfully authenticates with PAN+DOB password.
- `PASSWORD_FAILED`: Incorrect password entered; failed attempt counter incremented.
- `CHAT_MESSAGE_SENT`: Advisory clarification message posted by client or advisor.
- `OTP_GENERATED`: 6-digit statutory verification OTP dispatched.
- `OTP_LOCKOUT`: Brute-force attempt threshold breached (3 failures); access locked.
- `CONSENTED`: Explicit statutory declarations accepted and OTP verified; mandate sealed.
- `LINK_REVOKED`: Advisor revokes active proposal due to market volatility.

### Section 65B Compliance Certificate
Upon consent, the platform compiles an official electronic certificate containing:
- Unique Verification Receipt ID (`REC-MAN-XXXX-YYYY`)
- Client Legal Name & Masked PAN (`AB*****4F`)
- RIA SEBI Registration Number (`INA000018421`) & Firm Details
- Execution Timestamp (Indian Standard Time - IST)
- Electronic Channel Verification (`EMAIL_IN_APP_OTP`)
- Pre-Computed Capital Gains & Tax Liabilities
- Overall SHA-256 Ledger Hash Seal

---

## Mandate Chat Rail vs. Statutory Consent

FinConsent includes a mandate-specific discussion rail allowing clients and advisers to clarify trade recommendations in real time:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      MANDATE CHAT VS. STATUTORY CONSENT BOUNDARY                       │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ Scoped Mandate Chat                     │ Statutory Trade Consent (OTP)                │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ • Clarifies execution rationale, debt   │ • Unambiguous, legally binding authorization │
│   yields, or capital gains questions.   │   under SEBI Regulation 19.                  │
│ • Requires password-unlocked session.   │ • Requires explicit declaration checkboxes.  │
│ • Preserved in audit trail history.     │ • Requires 6-digit Mobile OTP verification.  │
│ • ⚠️ DOES NOT CONSTITUTE TRADE CONSENT. │ • Formally commits immutable Section 65B     │
│   Cannot authorize rebalancing trades.  │   Compliance Receipt and locks mandate.      │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## Indian Capital Gains Tax Engine (Union Budget 2024)

The built-in tax engine calculates tax liabilities dynamically across trade baskets:

| Capital Gain Category | Statutory Rate | Exemption Threshold | Applicable Legal Section |
|---|---|---|---|
| **Short-Term Capital Gains (STCG)** | **20.0%** (revised from 15%) | None | Section 111A, Income Tax Act, 1961 |
| **Long-Term Capital Gains (LTCG)** | **12.5%** (revised from 10%) | **₹1,25,000** per FY | Section 112A, Income Tax Act, 1961 |
| **Health & Education Cess** | **4.0%** surcharge | Applicable on base tax | Finance Act |

### Quarterly Advance Tax Calendar (Sections 234B & 234C)
When estimated net capital gains tax exceeds **₹1,00,000**, the client review portal automatically displays an **Advance Tax Alert Banner** detailing mandatory statutory deadlines:
- **1st Installment (15%):** On or before **15th June**
- **2nd Installment (45%):** On or before **15th September**
- **3rd Installment (75%):** On or before **15th December**
- **4th Installment (100%):** On or before **15th March**

---

## Localization & Multilingual Architecture

FinConsent provides native localization across **8 Indian languages** plus English:

- **Supported Languages:** English (`en`), Hindi (`hi`), Marathi (`mr`), Gujarati (`gu`), Tamil (`ta`), Telugu (`te`), Kannada (`kn`), Bengali (`bn`).
- **Standard Financial Numbering:** Under regulatory standards, all monetary figures (₹), trade quantities, percentages, and ISIN codes use standard ASCII English numerals across all language selections to eliminate ambiguities in legal dispute resolution.
- **Language Switcher:** Accessible across the application header and user profile settings.

---

## Client-Facing API Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                            API ROUTE & AUTHORIZATION MATRIX                            │
├─────────────────────────┬─────────┬───────────────────┬────────────────────────────────┤
│ Endpoint                │ Method  │ Authorization     │ Description                    │
├─────────────────────────┼─────────┼───────────────────┼────────────────────────────────┤
│ `/api/auth/login`       │ POST    │ Public / Anon     │ Authenticate with credentials   │
│ `/api/auth/mfa/verify`  │ POST    │ Temp Auth Token   │ Verify RFC 6238 TOTP challenge │
│ `/api/mandates`         │ GET     │ Bearer JWT (RIA)  │ List tenant-scoped mandates    │
│ `/api/mandates`         │ POST    │ Bearer JWT (RIA)  │ Create rebalance recommendation│
│ `/api/mandates/:id`     │ GET     │ Bearer JWT (RIA)  │ Get decrypted mandate details  │
│ `/api/mandates/:id/disp`│ POST    │ Bearer JWT (RIA)  │ Dispatch mandate magic link    │
│ `/api/mandates/:id/rev` │ POST    │ Bearer JWT (RIA)  │ Revoke active mandate link     │
│ `/api/clients`          │ GET/POST│ Bearer JWT (RIA)  │ Manage advisory client roster  │
│ `/api/public/mandates/:t`│ GET    │ Bearer Token / PW │ Public review / metadata view  │
│ `/api/public/.../unlock`│ POST    │ Public / PW       │ Verify PAN+DOB; issue unlockTok│
│ `/api/public/.../chat`  │ GET/POST│ Unlock Token      │ Mandate clarification chat     │
│ `/api/public/.../req-otp`│ POST   │ Unlock Token      │ Request 6-digit consent OTP    │
│ `/api/public/.../ver-otp`│ POST   │ Unlock Token      │ Verify OTP & commit consent    │
│ `/api/requests`         │ GET/POST│ Bearer JWT        │ Advisory & compliance hub      │
│ `/api/billing/*`        │ ALL     │ Bearer JWT (RIA)  │ Razorpay Pro Tier subscription │
│ `/api/health`           │ GET     │ Public            │ System & DB health checks      │
└─────────────────────────┴─────────┴───────────────────┴────────────────────────────────┘
```

---

## Deployment & Hosting Architecture

- **Data Sovereignty:** In strict compliance with SEBI Cybersecurity Framework and RBI Data Localization circulars, all databases, audit logs, cryptographic hashes, and server infrastructure reside in **AWS Asia Pacific (Mumbai) region (`ap-south-1`) (AWS Mumbai)**.
- **Frontend Container:** Vite 6 React single-page application compiled to static production chunks served over HTTPS.
- **Backend Container:** Node.js Express service running behind TLS termination reverse proxy (AWS ALB / Cloudflare) with Helmet HSTS enforcement (`maxAge: 31536000`).
- **Storage Layer:** MongoDB Atlas (M0/Dedicated) with point-in-time recovery (PITR) and shared Redis state store for distributed rate limiting.
- **Docker Compose:** Multi-container orchestration defined in `docker-compose.yml`.

---

## Testing & Security Validation Evidence

All platform invariants and security boundaries have been verified in automated test suites:

- **Vitest Automated Test Suites:** **15 / 15 test suites passing (200 / 200 tests passing, 100%)**:
  1. `taxCalculator.test.js` (8 tests) — Budget 2024 STCG 20%, LTCG 12.5%, Cess, Advance Tax.
  2. `api.test.js` (2 tests) — Health checks & JWT auth guards.
  3. `roles_guest_workflow.test.js` (6 tests) — Guest navigation & role switcher.
  4. `security_audit_remediation.test.js` (24 tests) — SHA-256 token hashing, HSTS, MFA, rate limits.
  5. `acceptance.test.js` (4 tests) — Magic link generation, 48h expiry, instant revocation.
  6. `rbac_requests_sms.test.js` (6 tests) — SMS deprecation policy & RBAC request permissions.
  7. `role_experience_and_access_control.test.js` (16 tests) — Role boundaries & views.
  8. `security_hardening.test.js` (15 tests) — Tenant isolation, IDOR barriers, OTP lockout.
  9. `mandate_createdat_date.test.js` (1 test) — Date serialization integrity.
  10. `b2b_ria_client_hierarchy.test.js` (12 tests) — B2B organizational hierarchy.
  11. `dispatch_print_testing.test.js` (14 tests) — Dispatch password & testing unlock rail.
  12. `multilingual_i18n_localization.test.js` (26 tests) — 8-language localization & ASCII numbers.
  13. `production_localization_audit.test.js` (21 tests) — Locale domain completeness.
  14. `api_regressions_and_contract_audit.test.js` (44 tests) — End-to-end API regression suite.
  15. `ui_revamp_styling_audit.test.js` (1 test) — Visual design system & token integrity.
- **Browser Automation Verification:**
  - `docs/visual-audit/`: 42 baseline screenshots across desktop and mobile viewports.
  - `docs/visual-audit/workflow/`: 12 end-to-end B2B workflow screenshots + video recording.
  - `docs/visual-audit/security/`: 25 security scenario screenshots (IDOR, MFA, rate limiting).
  - `docs/visual-audit/mandate-security/`: 14 mandate lifecycle screenshots (password unlock, chat, locked dossier).
- **Synthetic Backup Restoration Drill:** Non-destructive point-in-time restore simulation verifying 1,460 audit logs with 0 broken hash chains.

---

## Current Operational Limitations & Roadmap

### Current Implemented State:
- Full non-discretionary trade recommendation formulation and tax engine.
- AES-256-GCM dual-envelope encryption and PBKDF2 password derivation.
- Single-use 256-bit magic tokens with SHA-256 database hashing and 48-hour cutoff.
- In-app mandate clarification chat with explicit non-consent separation.
- Section 65B electronic compliance receipts with SHA-256 forward-hash chaining.
- Multi-tenant isolation, RBAC, TOTP MFA, and distributed rate limiting.
- 8 Indian languages localization with English numerals.

### Documented Limitations & Operational Recommendations:
1. **SMS Gateway Aggregator:** In current development and evaluation configurations, SMS is simulated/disabled by architectural policy, with OTPs delivered via registered email and secure in-app displays. Commercial production deployment requires onboarding a TRAI DLT-registered SMS aggregator (e.g., Twilio, Gupshup, or Karix) with pre-approved statutory DLT message templates.
2. **Hardware Security Module (HSM) Key Management:** The Server Master Key is derived from `JWT_SECRET`. For institutional Tier-1 banking deployments, integrating AWS CloudHSM or AWS KMS for automated Master Key rotation is recommended.
3. **Automated Broker Order Execution:** FinConsent intentionally halts at the generation of locked Section 65B consent dossiers. Direct execution via broker APIs (Zerodha Kite Connect, Angel One SmartAPI) represents future roadmap development.
4. **Third-Party Time Stamping Authority (TSA):** Audit records currently use synchronized server IST timestamps. Anchoring SHA-256 ledger roots to an RFC 3161 compliant external Time Stamping Authority is a recommended enhancement.

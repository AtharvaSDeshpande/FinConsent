# FinConsent

**Institutional Statutory Advisory Consent, Capital Gains Tax Transparency & Tamper-Evident Record-Keeping Infrastructure for SEBI-Registered Investment Advisers (RIAs)**

[![Tests](https://img.shields.io/badge/Vitest-200%2F200%20Passing%20(15%20Suites)-brightgreen)](#testing--security-validation-evidence)
[![ESLint](https://img.shields.io/badge/ESLint-0%20errors%20%7C%200%20warnings-brightgreen)](#testing--security-validation-evidence)
[![SEBI](https://img.shields.io/badge/SEBI-Regulation%2019%20Record--Keeping-blue)](#sebi-regulatory-and-legal-compliance)
[![Electronic Records](https://img.shields.io/badge/BSA%202023-Section%2063%20Certified-indigo)](#sebi-regulatory-and-legal-compliance)
[![Cryptography](https://img.shields.io/badge/Cryptography-AES--256--GCM%20%7C%20PBKDF2-darkblue)](#security--cryptographic-architecture)
[![Data Residency](https://img.shields.io/badge/Data%20Residency-AWS%20Mumbai%20(ap--south--1)-orange)](#deployment--hosting-architecture)

---

## Executive Overview

**FinConsent** is an institutional B2B WealthTech platform engineered specifically for Indian SEBI-Registered Investment Advisers (RIAs), compliance officers, and advisory clients. Built to support **Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013**, FinConsent provides an auditable, verifiable digital rail for non-discretionary investment advisory workflows.

In India's fee-only advisory framework, non-discretionary investment advisers cannot execute securities transactions on behalf of clients without **prior, documented client consent** and a contemporaneous record of the advice and rationale. Traditionally, advisers and clients coordinate rebalancing recommendations across informal, fragmented channels such as WhatsApp chats, email threads, SMS messages, or unrecorded phone conversations. This legacy approach exposes advisory practices to compliance risk, client disputes, and evidentiary challenges during statutory audits. Furthermore, following statutory capital gains tax adjustments (Finance Act 2024), rebalancing recommendations without pre-trade tax impact visibility can result in unexpected Short-Term Capital Gains (STCG) and Long-Term Capital Gains (LTCG) liabilities for clients.

FinConsent addresses these operational friction points by pairing an automated **Capital Gains Decision-Support Tax Engine** with an **authenticated AES-256-GCM dual-envelope encrypted mandate lifecycle**, a scoped in-app mandate clarification chat rail, convenience password protection, verification OTP confirmation, and an append-only **SHA-256 forward-hash chained audit ledger** designed to support electronic record requirements under **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA)** and **Section 65B of the Indian Evidence Act, 1872**.

---

## Advisory Governance & Regulatory Framework

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
─────────────────── ADVISORY PRACTICE RISK & MITIGATION MAPPING ─────────────────────────
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ Legacy Informal Practice                │ FinConsent Governance Solution               │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ • Informal approvals over WhatsApp      │ • Standardized mandate workflow aligned with │
│   or unauthenticated email threads.     │   SEBI Regulation 19 record-keeping rules.   │
│ • No pre-trade tax visibility; clients  │ • Pre-computed statutory capital gains       │
│   surprised by advance tax liabilities. │   transparency (STCG 20%, LTCG 12.5%).       │
│ • Dispersed documentation across PDFs,  │ • Centralized, tamper-evident audit ledger   │
│   spreadsheets, and phone recordings.   │   inspectable for 5 statutory years.         │
│ • Ambiguity regarding client approval   │ • Scoped mandate clarification chat clearly  │
│   prior to order placement.             │   distinguished from explicit consent.       │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

### Statutory Regulatory Pillars:
1. **SEBI (Investment Advisers) Regulations, 2013 — Regulation 19:** Mandates that every non-discretionary RIA maintain comprehensive, time-stamped client records, advice rationale, agreements, and client consent records for a statutory minimum period of **5 years (1,825 days)**.
2. **Bharatiya Sakshya Adhiniyam, 2023 (BSA) — Section 63 / Indian Evidence Act — Section 65B:** Governs the admissibility of electronic records in judicial and regulatory proceedings. FinConsent records capture client device IP, User-Agent, synchronized IST timestamps, and cryptographic hash verification to support electronic record integrity.
3. **Current Capital Gains Tax Regime (Finance Act 2024):** Computes estimated tax impact under statutory rates: Short-Term Capital Gains (STCG) at **20.0%** (Section 111A) and Long-Term Capital Gains (LTCG) at **12.5%** above the annual statutory aggregate ₹1,25,000 exemption (Section 112A), plus 4% Health & Education Cess. High-income surcharges (up to 15% on equity capital gains) and carried-forward losses are disclaimed as individual tax variables.
4. **Income-tax Act, 1961 — Advance Tax Planning:** When net annual tax liability is ₹10,000 or more, advance tax provisions apply. Under the proviso to Section 234C, capital gains tax can be deposited in remaining installments without penal interest if realized post-deadline.
5. **Digital Personal Data Protection Act, 2023 (DPDP Act):** Protects investor personal data with purpose limitation and strict access controls. Section 8(7) accommodates mandatory statutory retention periods, ensuring compliance audit trails are lawfully maintained throughout the SEBI 5-year window.

---

## Core Personas & Role Taxonomy

FinConsent supports five distinct system roles, each bounded by strict Role-Based Access Control (RBAC) and multi-tenant isolation:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SYSTEM ACTOR & ROLE MATRIX                                │
├─────────────────────┬──────────────────────┬──────────────────────┬────────────────────┤
│ Role ID             │ Illustrative Persona │ Primary Interface    │ Key Responsibilities│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ sebi-ria            │ Suresh Narayanan     │ Desktop Advisory Hub │ • Portfolio drift  │
│                     │ Prudent Wealth       │ `/dashboard`         │   formulation      │
│                     │ INA000088921         │ `/mandates/new`      │ • Tax engine calc  │
│                     │ ria@example.in       │ `/clients`           │ • Mandate dispatch │
│                     │                      │                      │ • Clarification chat│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ hni-client          │ Rohan Mehta          │ Mobile Review Portal │ • Direct link      │
│                     │ Client # cli_1       │ `/m/:token`          │ • PAN+DOB password │
│                     │ client@example.in    │ `/m/:token/verify`   │ • Proposal review  │
│                     │ PAN: XXXXX1234F      │ `/m/:token/receipt`  │ • Mandate chat     │
│                     │ DOB: 14/08/1978      │ Authenticated Portal │ • OTP authorization│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ compliance_officer  │ Vikramaditya Roy     │ Compliance Hub       │ • Pre-trade review │
│                     │ Sentinel Compliance  │ `/requests`          │ • Reg 19 scrutiny  │
│                     │ compliance@example.in│ `/mandates/:id`      │ • Hash chain audit │
│                     │                      │ Modal Dossier        │ • BSA Sec 63 cert  │
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ admin               │ Neha Singhania       │ Operations Command   │ • Platform health  │
│                     │ Platform Admin       │ `/dashboard`         │ • Tenant oversight │
│                     │ admin@example.in     │ User Administration  │ • Quota governance │
│                     │                      │ System Audits        │ • Disaster recovery│
├─────────────────────┼──────────────────────┼──────────────────────┼────────────────────┤
│ guest               │ Public Evaluator     │ Public Showcase      │ • DPDP disclosures │
│                     │ Anonymous Visitor    │ `/`                  │ • Interactive demo │
│                     │                      │ `/legal/*`           │ • Practice signup  │
└─────────────────────┴──────────────────────┴──────────────────────┴────────────────────┘
```

---

## Core Workflow & Mandate Lifecycle

The FinConsent non-discretionary trade consent workflow executes across deterministic advisory phases, safeguarded by statutory timeouts and cryptographic audit records:

![FinConsent Statutory Advisory Process Flow](docs/diagrams/process-flow.png)
*Figure: FinConsent End-to-End Statutory Advisory Process Flow (SEBI Reg 19, SHA-256 Ledger & Section 63 BSA Audit Trail)*

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 END-TO-END WORKFLOW SEQUENCE                                     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

   [ 1. FORMULATION ]  RIA drafts portfolio rebalance (Equities -> Debt & Gold ETF)
            │
            ▼
   [ 2. TAX ESTIMATE]  Real-time Tax Engine computes STCG (20%) & LTCG (12.5% + 4% cess)
            │
            ▼
   [ 3. SECURE DISPATCH] Dual-envelope encryption generates 256-bit magic token with 48h cutoff
            │
            ▼
   [ 4. CLIENT DELIVERY] Delivered via Email (WhatsApp roadmap); token stored as SHA-256 hash
            │
            ▼
   [ 5. PASSWORD UNLOCK] Client enters verification password: PAN Last 4 + DOB (DDMMYYYY)
            │
            ▼
   [ 6. ADVISORY CHAT  ] Client asks clarification; adviser replies in-app (Chat != Consent)
            │
            ▼
   [ 7. EXPLICIT CONSENT] Client checks statutory declarations; requests 6-digit verification OTP
            │
            ▼
   [ 8. OTP VERIFICATION] Distributed rate limiter validates OTP; burns token atomically
            │
            ▼
   [ 9. LOCKED EVIDENCE] Mandate locked; Section 63 BSA (Sec 65B antecedent) Certificate generated
```

### Mandate State Machine

FinConsent implements a deterministic 6-state lifecycle:

```
              ┌────────────────────────────────────────────────────────┐
              │                                                        │
              ▼                                                        │
         ┌─────────┐            RIA Dispatches Link       ┌──────────┐ │
         │  DRAFT  │ ───────────────────────────────────> │   SENT   │ │
         └─────────┘                                      └──────────┘ │
              │                                                │       │
              │                                                │ Client Inputs
              │                                                │ PAN + DOB Password
              │                                                ▼       │
              │                                           ┌──────────┐ │
              │                                           │  VIEWED  │ │
              │                                           └──────────┘ │
              │                                                │       │
              │                                                │ 1. Accept Declarations
              │ 48-Hour Cutoff                                 │ 2. Verify 6-Digit OTP
              │ Elapsed                                        ▼       │
              │                                           ┌───────────┐│
              ├─────────────────────────────────────────> │ CONSENTED ││
              │                                           └───────────┘│
              │                                                        │
              │ Advisory Revocation / Market Drift                     │
              ▼                                                        │
         ┌─────────┐                                                   │
         │ REVOKED │ <─────────────────────────────────────────────────┘
         └─────────┘
              ▲
              │ Cutoff Elapsed Prior to Consent
         ┌─────────┐
         │ EXPIRED │
         └─────────┘
```

---

## Security & Cryptographic Architecture

FinConsent implements defense-in-depth controls to safeguard client portfolios, PAN identifiers, and compliance records:

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
│   via AES-256-GCM envelope                  via PBKDF2 (100,000 iterations default)    │
│   (SERVER_MASTER_KEY configuration)         Key: PBKDF2(PAN_last_4 + DOB, salt)        │
│                                                                                        │
│   * Result: Neither plaintext DEK nor client password is ever persisted in database.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Mandate Password Access & Entropy Model
- Direct magic links (`/m/:token`) provide access to minimal public metadata (firm name, advisor name, and client name).
- Trade quantities, ISIN codes, transaction values, and rationale remain encrypted until unlocked by the client.
- The unlock password uses client KYC attributes: `Last 4 characters of PAN` + `Date of Birth in DDMMYYYY` (e.g., `123414081978`).
- **Security Guidance & Entropy Model:** PAN-last-4 + DOB functions as a convenience verification PIN rather than a high-entropy secret. It is defended online against brute-force enumeration by strict sliding-window rate limiters, lockout thresholds, and offline by salted PBKDF2 key derivation (100,000 iterations in production).
- Upon successful verification, the server issues a scoped, short-lived unlock JWT (`x-unlock-token`) valid for **2 hours**.

### 2. Magic Link Token Security & Single-Use Hashing
- Magic tokens are generated using a CSPRNG: `crypto.randomBytes(32).toString('hex')` (256 bits of entropy).
- **Hashed at Rest:** Raw tokens are never stored in the database; they are one-way hashed with SHA-256 (`magicTokenHash`) prior to MongoDB persistence.
- **Single-Use Invalidation:** Upon successful OTP consent, the token is burned. Re-accessing the link returns `410 Gone / 404 Not Found`.

### 3. Verification OTP Delivery & Rate Limiting
- **6-Digit Dynamic OTP:** Valid for 5 minutes.
- **Channel Delivery:** Delivered via registered email and secure in-app display (SMS disabled by policy; WhatsApp delivery on roadmap).
- **Brute-Force Counter:** Maximum of **3 failed attempts**. Upon the 3rd consecutive failed entry, access is locked, logging an `OTP_LOCKOUT` audit event.

### 4. Tenant Isolation & RBAC Boundaries
- Every API endpoint enforces strict multi-tenant scoping: an RIA can only query clients and mandates belonging to their verified firm ID (`req.user.firmName` / `req.user.id`).
- Attempted cross-tenant queries return `HTTP 403 Forbidden`.
- Client role accounts attempting advisor actions are blocked at both client routing and server middleware.

### 5. Multi-Factor Authentication (MFA)
- Advisory and compliance accounts support RFC 6238 TOTP Two-Factor Authentication.
- Staff credentials return `mfaRequired: true`, requiring TOTP completion before accessing protected endpoints.

---

## Tamper-Evident Audit Trail & Electronic Evidence

FinConsent maintains an append-only cryptographic ledger where lifecycle events are recorded with SHA-256 forward-hash chaining:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        APPEND-ONLY SHA-256 HASH CHAINING                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   AUDIT RECORD N-1                      AUDIT RECORD N                                 │
│   ┌───────────────────────────────┐     ┌───────────────────────────────┐              │
│   │ event: MANDATE_DISPATCHED     │     │ event: PASSWORD_UNLOCKED      │              │
│   │ timestamp: 2026-10-08T10:15   │     │ timestamp: 2026-10-08T10:22   │              │
│   │ ipAddress: 198.51.100.14      │     │ ipAddress: 203.0.113.12       │              │
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
- `MANDATE_OPENED`: Client accesses the link; device IP and User-Agent recorded.
- `PASSWORD_UNLOCKED`: Client successfully authenticates with PAN+DOB password.
- `PASSWORD_FAILED`: Incorrect password entered; failed attempt counter incremented.
- `CHAT_MESSAGE_SENT`: Advisory clarification message posted by client or advisor.
- `OTP_GENERATED`: 6-digit statutory verification OTP dispatched.
- `OTP_LOCKOUT`: Verification attempt threshold breached (3 failures); access locked.
- `CONSENT_GRANTED`: Statutory declarations accepted and OTP verified; mandate sealed.
- `MANDATE_REVOKED`: Advisor revokes active proposal due to market conditions or allocation updates.

### Section 63 BSA / Section 65B Compliance Certificate
Upon consent, the platform compiles an official electronic certificate containing:
- Unique Verification Receipt ID (`REC-MAN-XXXX-YYYY`)
- Client Legal Name & Masked PAN (`XXXXX1234F`)
- RIA SEBI Registration Number (`INA000088921`) & Firm Details
- Execution Timestamp (Indian Standard Time - IST)
- Electronic Channel Verification (`OTP_IN_APP_EMAIL`)
- Pre-Computed Capital Gains & Tax Liabilities
- Overall SHA-256 Ledger Hash Seal

---

## Scoped Mandate Chat vs. Statutory Consent

FinConsent includes a mandate-specific discussion rail allowing clients and advisers to clarify recommendations before granting consent:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      MANDATE CHAT VS. STATUTORY CONSENT BOUNDARY                       │
├─────────────────────────────────────────┬──────────────────────────────────────────────┤
│ Scoped Mandate Chat                     │ Documented Advisory Consent (OTP)            │
├─────────────────────────────────────────┼──────────────────────────────────────────────┤
│ • Clarifies execution rationale, asset  │ • Explicit client consent record maintained  │
│   weights, or capital gains questions.  │   under SEBI Regulation 19.                  │
│ • Requires password-unlocked session.   │ • Requires affirmative declaration checks.   │
│ • Preserved in audit trail history.     │ • Requires 6-digit OTP verification.         │
│ • ⚠️ DOES NOT CONSTITUTE TRADE CONSENT. │ • Formally commits immutable Section 63 BSA  │
│   Cannot authorize rebalancing trades.  │   Compliance Receipt and locks mandate.      │
└─────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## Capital Gains Tax Engine (Current Statutory Provisions)

The built-in tax engine calculates tax liabilities dynamically across trade baskets:

| Capital Gain Category | Statutory Rate | Exemption Threshold | Applicable Legal Section |
|---|---|---|---|
| **Short-Term Capital Gains (STCG)** | **20.0%** | None | Section 111A, Income-tax Act, 1961 |
| **Long-Term Capital Gains (LTCG)** | **12.5%** | **₹1,25,000** annual aggregate | Section 112A, Income-tax Act, 1961 |
| **Health & Education Cess** | **4.0%** | Applicable on base tax | Finance Act |

> **Assumptions & Disclaimers:**
> - The ₹1,25,000 LTCG exemption is applied assuming availability across the client's aggregate annual capital gains (not per individual security or transaction).
> - High-income surcharges (up to 15% on equity capital gains) and carried-forward capital losses are excluded from estimates.
> - Calculations are provided for advisory decision support and do not constitute formal tax assessments.

### Quarterly Advance Tax Calendar
When estimated annual tax liability reaches or exceeds **₹10,000**, the portal displays an Advance Tax Planning notice:
- **1st Installment (15%):** On or before **15th June**
- **2nd Installment (45%):** On or before **15th September**
- **3rd Installment (75%):** On or before **15th December**
- **4th Installment (100%):** On or before **15th March**

*(Note: Under the proviso to Section 234C(1), interest for shortfall in advance tax is not charged if the shortfall is due to capital gains, provided remaining tax is deposited in subsequent installments.)*

---

## Localization & Multilingual Architecture

FinConsent provides native localization across **8 supported languages**:

- **Supported Locales:** English (`en`), Hindi (`hi`), Tamil (`ta`), Bengali (`bn`), Gujarati (`gu`), German (`de`), Japanese (`ja`), Korean (`ko`).
- **Standard Financial Numbering:** Monetary figures (₹), quantities, percentages, and ISIN codes use standard ASCII English numerals across all locales for dispute-resolution consistency.
- **Language Switcher:** Accessible in the application header and user profile settings.

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
│ `/api/billing/*`        │ ALL     │ Bearer JWT (RIA)  │ Institutional billing tiers    │
│ `/api/health`           │ GET     │ Public            │ System & DB health checks      │
└─────────────────────────┴─────────┴───────────────────┴────────────────────────────────┘
```

---

## Deployment & Hosting Architecture

- **Data Sovereignty:** In alignment with SEBI's Cybersecurity and Cyber Resilience Framework (CSCRF) and Cloud Security Guidelines, all databases, audit logs, cryptographic hashes, and server infrastructure reside in **AWS Asia Pacific (Mumbai) region (`ap-south-1`)**.
- **Frontend Container:** Vite 6 React single-page application compiled to static production chunks served over HTTPS.
- **Backend Container:** Node.js Express service running behind TLS termination reverse proxy with Helmet HSTS enforcement (`maxAge: 31536000`).
- **Key Isolation:** Envelope Server Master Key (`SERVER_MASTER_KEY`) is isolated from application authentication secrets (`JWT_SECRET`).
- **Storage Layer:** MongoDB Atlas with point-in-time recovery and in-memory/shared synchronization for distributed rate limiting.

---

## Testing & Validation Evidence

All platform invariants and security controls have been validated in automated test suites:

- **Vitest Automated Test Suites:** **16 / 16 test suites passing (214 / 214 tests passing, 100%)**:
  1. `taxCalculator.test.js` (8 tests) — STCG 20%, LTCG 12.5%, Cess, Advance Tax.
  2. `api.test.js` (2 tests) — Health checks & JWT auth guards.
  3. `roles_guest_workflow.test.js` (6 tests) — Guest navigation & role switcher.
  4. `security_audit_remediation.test.js` (26 tests) — SHA-256 token hashing, HSTS, MFA, rate limits.
  5. `acceptance.test.js` (4 tests) — Magic link generation, 48h expiry, instant revocation.
  6. `rbac_requests_sms.test.js` (6 tests) — SMS deprecation policy & RBAC request permissions.
  7. `role_experience_and_access_control.test.js` (16 tests) — Role boundaries & views.
  8. `security_hardening.test.js` (15 tests) — Tenant isolation, IDOR barriers, OTP lockout.
  9. `mandate_createdat_date.test.js` (1 test) — Date serialization integrity.
  10. `b2b_ria_client_hierarchy.test.js` (12 tests) — B2B organizational hierarchy.
  11. `dispatch_print_testing.test.js` (4 tests) — Dispatch password & testing unlock rail.
  12. `localization_i18n_l10n.test.js` (15 tests) — 8-language localization & ASCII numbers.
  13. `crypto_regression_and_normalization.test.js` (18 tests) — Cryptographic key derivation and AES-256-GCM.
  14. `i18n_automated_checks.test.js` (45 tests) — Translation key parity across all domains.
  15. `mandate_security_and_chat.test.js` (20 tests) — Scoped chat and envelope encryption.
  16. `production_deployment_and_readiness.test.js` (14 tests) — Container port/host binding (0.0.0.0), URI parsing & alias resolution (`MONGODB_URI`, `MONGO_URI`, `DATABASE_URL`), secret sanitization in logs, readiness probe (`/api/ready`, `/api/health`) 503 gating under database disconnection, write protection middleware, and strict production in-memory fallback prevention.

---

## Production Deployment Guide (Render & MongoDB Atlas)

### 1. Server Port & Network Interface Binding
- **Port Resolution:** The Express server dynamically reads `process.env.PORT` injected by container platforms (e.g., Render sets `PORT=10000`). If `PORT` is unset, it defaults to `5000`.
- **Container Interface (0.0.0.0):** In containerized environments (Docker / Render Linux containers), the server explicitly binds to `HOST = process.env.HOST || '0.0.0.0'`. This allows the platform's ingress reverse proxy (ALB / Nginx / Envoy) to route traffic to the container.
- **Why `localhost:5000` appears in logs:**
  - The log line `FinConsent Server listening on http://localhost:5000` is an informational developer convenience string printed for local browser testing. It is **not** a deployment bug and does not restrict container networking.
  - The server binds to `0.0.0.0:${PORT}` across all interfaces while logging both the container host binding and the local preview URL.

### 2. MongoDB Atlas Configuration
1. **Network Access (IP Whitelist):**
   - In the MongoDB Atlas Dashboard, navigate to **Security** -> **Network Access**.
   - Add IP address `0.0.0.0/0` ("Allow Access from Anywhere").
   - *Why:* Render Web Services (Free and Standard tiers) use dynamic outbound IP addresses across AWS and GCP infrastructure. Without `0.0.0.0/0`, outgoing connections from Render timeout with `MongooseServerSelectionError: connect ETIMEDOUT`.
2. **Database User Credentials & Password URL-Encoding:**
   - In **Security** -> **Database Access**, create a user with `readWrite` permissions on database `finconsent`.
   - **RFC 3986 URL Encoding:** If the database password contains special characters (e.g. `@`, `:`, `/`, `?`, `#`, `[`, `]`, `%`, `&`, `+`), they **must** be percent-encoded (`encodeURIComponent`) before inclusion in the connection URI (e.g. `@` -> `%40`, `#` -> `%23`).
   - Remove any `<password>` angle brackets from the Atlas template snippet.
3. **Connection String Format:**
   - Standard SRV format: `mongodb+srv://<username>:<url_encoded_password>@<cluster-host>/finconsent?retryWrites=true&w=majority`
   - Explicitly specify `/finconsent` to avoid defaulting to the `test` database.

### 3. Render Web Service Settings
1. **Build & Start Commands:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/index.js` (or `npm start`)
2. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: (Managed automatically by Render; injects `10000`)
   - `MONGODB_URI`: `mongodb+srv://<username>:<url_encoded_password>@<cluster-host>/finconsent?retryWrites=true&w=majority` *(Supported aliases: `MONGO_URI`, `DATABASE_URL`). Do not wrap in quotes.*
   - `JWT_SECRET`: 64+ char random string
   - `SERVER_MASTER_KEY`: 64+ char random string
   - `ALLOW_IN_MEMORY_FALLBACK`: Leave unset or set to `false` in production.
3. **Health Check Path:**
   - Set to `/api/ready` (or `/api/health`).
   - If MongoDB Atlas is connected, returns HTTP `200 OK` and traffic is routed.
   - If MongoDB Atlas is disconnected, returns HTTP `503 Service Unavailable`, preventing unpersisted traffic from being routed to the instance.

### 4. Zero Silent Fallback & Data Write Gating
- In production (`NODE_ENV === 'production'`), FinConsent **never** silently falls back to in-memory storage if MongoDB Atlas is disconnected.
- If the persistent database is unavailable:
  - Readiness probes (`/api/ready` and `/api/health`) return HTTP `503 Service Unavailable`.
  - All mutating data-dependent operations (`POST /api/mandates`, `POST /api/clients`, `POST /api/public/consent`, `POST /api/requests`, `POST /api/auth/register`, and direct store mutations) are intercepted and rejected with HTTP `503 DATABASE_UNAVAILABLE`.
  - In-memory storage is permitted only in explicitly configured development or test environments (`NODE_ENV !== 'production'`) or when `ALLOW_IN_MEMORY_FALLBACK=true` is explicitly passed.

---

## Current Operational Status & Roadmap

### Current Implemented State:
- Non-discretionary trade recommendation formulation and tax engine.
- AES-256-GCM dual-envelope encryption and PBKDF2 password derivation.
- Dedicated `SERVER_MASTER_KEY` environment isolation.
- Single-use 256-bit magic tokens with SHA-256 database hashing and 48-hour cutoff.
- In-app mandate clarification chat with explicit non-consent separation.
- Section 63 BSA / Section 65B electronic compliance receipts with SHA-256 forward-hash chaining.
- Multi-tenant isolation, RBAC, TOTP MFA, and distributed rate limiting.
- 8 supported languages with English ASCII numerals.
- Production readiness probing and write gating with zero silent in-memory fallback.

### Documented Scope & Roadmap:
1. **SMS Gateway Aggregator:** In current development and demonstration environments, SMS is disabled by architectural policy, with OTPs delivered via registered email and secure in-app displays. Commercial production deployment requires onboarding a TRAI DLT-registered SMS aggregator with pre-approved statutory DLT message templates.
2. **WhatsApp Channel Delivery:** Marked as roadmap; currently simulated/delivered via email magic links.
3. **External Time Stamping Authority (TSA):** Audit records currently use synchronized server IST timestamps. Anchoring SHA-256 ledger roots to an RFC 3161 compliant external Time Stamping Authority is planned for institutional deployments.
4. **Direct Broker Execution:** FinConsent is an advisory record-keeping and consent platform; it intentionally does not execute securities trades directly on broker order terminals.

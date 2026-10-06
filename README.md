# FinConsent

**Statutory Trade Authorization & Tax-Impact Consent Platform for Indian SEBI-Registered Investment Advisers (RIAs)**

[![Tests](https://img.shields.io/badge/tests-14%2F14%20passing-brightgreen)](file:///c:/antigravity/fullstack-builder/fin-consent/src/test)
[![ESLint](https://img.shields.io/badge/eslint-0%20errors%20%7C%200%20warnings-brightgreen)](file:///c:/antigravity/fullstack-builder/fin-consent/eslint.config.js)
[![SEBI](https://img.shields.io/badge/SEBI-Regulation%2019%20Compliant-blue)](#sebi-regulatory-compliance)
[![Residency](https://img.shields.io/badge/Data%20Residency-AWS%20Mumbai%20(ap--south--1)-orange)](#data-residency--sovereignty)

FinConsent is a mobile-first statutory trade authorization and Indian capital gains tax-impact consent platform purpose-built for SEBI-Registered Investment Advisers (RIAs). Under Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013, Indian RIAs operating non-discretionary mandates must secure prior informed client consent and preserve immutable 5-year audit trails before executing portfolio rebalancing trades.

---

## Table of Contents
- [Implementation Tech Stack](#implementation-tech-stack)
- [System Architecture & Design Patterns](#system-architecture--design-patterns)
- [Indian Capital Gains Engine (Union Budget 2024)](#indian-capital-gains-engine-union-budget-2024)
- [User Journeys by Role](#user-journeys-by-role)
- [Security & Cryptographic Guarantees](#security--cryptographic-guarantees)
- [SEBI Regulatory & Legal Compliance](#sebi-regulatory--legal-compliance)
- [Data Residency & Sovereignty](#data-residency--sovereignty)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing & Quality Verification](#testing--quality-verification)

---

## Implementation Tech Stack

### 1. Frontend Architecture
- **Framework & Runtime:** [React 18.3.1](https://react.dev/) with modern functional components and hooks (`useState`, `useEffect`, `useContext`, `useNavigate`, `useParams`).
- **Build Tooling & Bundler:** [Vite 6.1.0](https://vitejs.dev/) with `@vitejs/plugin-react` for ultra-fast Hot Module Replacement (HMR) and optimized Rollup code-splitting chunks (vendor, MUI, app).
- **Component & Design System:** [Material UI (MUI v6.4.7)](https://mui.com/) tailored with an authoritative institutional financial palette (Deep Navy `#0A192F`, Indigo `#4F46E5`, Emerald `#059669`, Amber `#D97706`).
- **Styling Engine:** [@emotion/react](https://emotion.sh/) & [@emotion/styled](https://emotion.sh/) providing zero-runtime collision CSS-in-JS.
- **Routing:** [React Router DOM v7.1.5](https://reactrouter.com/) configuring public zero-login routes (`/m/:token`), authenticated RIA workspace routes (`/dashboard`, `/mandates/new`, `/clients`), and legal disclosure routes (`/legal/*`).
- **Iconography:** [@mui/icons-material](https://mui.com/material-ui/material-icons/) and [Lucide React](https://lucide.dev/) for crisp statutory symbols, status chips, and brand emblems.

### 2. Backend Architecture
- **Runtime:** [Node.js (ES Modules `type: module`)](https://nodejs.org/) using native crypto primitives (`node:crypto`).
- **Web Framework:** [Express.js 4.21.2](https://expressjs.com/) with RESTful route modularity.
- **Security Middleware:** [Helmet 8.0.0](https://helmetjs.github.io/) enforcing HTTP security headers and [CORS 2.8.5](https://github.com/expressjs/cors) configuring strict cross-origin access controls.
- **Authentication & Sessions:** [JSON Web Token (jsonwebtoken 9.0.2)](https://github.com/auth0/node-jsonwebtoken) with 7-day expiration and [bcryptjs 2.4.3](https://github.com/dcodeIO/bcrypt.js) for salted password hashing.

### 3. Data & Storage Layer
- **In-Memory & Persistent Storage:** High-performance, concurrency-safe in-memory database store (`server/db/store.js`) implementing isolated user, client, mandate, and audit collections.
- **Database Target:** Configured for seamless synchronization with [MongoDB Atlas (M0/Dedicated)](https://www.mongodb.com/atlas) hosted in AWS Asia Pacific (Mumbai) `ap-south-1`.
- **Audit Storage:** Append-only cryptographic ledger with forward SHA-256 hash chaining (`prevHash -> payloadHash`), preventing retroactive alterations or deletion.

### 4. Third-Party Integrations
- **Payments:** [Razorpay](https://razorpay.com/) checkout integration supporting UPI, Net Banking, and Cards for RIA Pro Tier upgrades (₹4,999/yr) with HMAC webhook signature validation.
- **Transactional Notifications:** [Resend](https://resend.com/) email integration for proposal dispatch, OTP verification notices, and compliance certificate receipts.
- **Direct WhatsApp Dispatch:** Direct URL template generator (`https://wa.me/...`) pre-populating client trade allocations, estimated tax liabilities, and 48-hour expiration countdowns.
- **SMS / Mobile OTP:** Cryptographic 6-digit OTP delivery with 5-minute TTL and simulated local bypass (`123456`) for automated testing.

### 5. Testing & Code Quality
- **Test Runner:** [Vitest 3.0.5](https://vitest.dev/) providing native ESM test execution, mocking, and assertion libraries.
- **DOM Testing:** [@testing-library/react 16.2.0](https://testing-library.com/) and [@testing-library/jest-dom 6.6.3](https://github.com/testing-library/jest-dom) with [jsdom 26.0.0](https://github.com/jsdom/jsdom).
- **Linter & Code Standards:** [ESLint 9.20.1](https://eslint.org/) enforcing clean-code rules, zero unused variables, and strict modular boundaries.

### 6. DevOps & Containerization
- **Containerization:** Multi-stage production [Dockerfile](file:///c:/antigravity/fullstack-builder/fin-consent/Dockerfile) building Vite static assets and serving both API and frontend.
- **Orchestration:** [docker-compose.yml](file:///c:/antigravity/fullstack-builder/fin-consent/docker-compose.yml) configuring health checks, port bindings (`5000:5000`), and production environment variables.

---

## System Architecture & Design Patterns

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT MOBILE VIEW                            │
│           (Zero-Login, 360px Viewport, Touch Targets >= 48px)          │
│                                                                        │
│   /m/:token ───────────► /m/:token/verify ───────────► /m/:token/receipt│
│   (Review Proposal)      (6-Digit Mobile OTP)          (Signed Dossier) │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ 256-Bit Cryptographic Magic Link
┌────────────────────────────────────▼───────────────────────────────────┐
│                           RIA WORKSPACE (MUI)                          │
│                                                                        │
│   /dashboard            /mandates/new         /clients   /settings     │
│   (Live Badges: 48h)    (Budget 2024 Tax)     (PAN/Phone)(SEBI Profile)│
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ REST API / JWT Auth
┌────────────────────────────────────▼───────────────────────────────────┐
│                       EXPRESS.JS BACKEND ENGINE                        │
│                                                                        │
│   server/routes/auth.js      server/routes/mandates.js  server/db/store│
│   server/routes/public.js    server/routes/billing.js   (SHA-256 Ledger│
└────────────────────────────────────────────────────────────────────────┘
```

- **Feature-First Modularity:** All frontend code is organized into self-contained feature slices under `src/features/` with public API entry points defined in `index.js`.
- **Public Zero-Login Portal:** Client review screens operate without requiring clients to register or remember passwords. Access is guarded by high-entropy 256-bit magic tokens delivered via WhatsApp/SMS.
- **Strict Immutability:** Audit trail records cannot be edited, overwritten, or deleted through any UI or API endpoint.

---

## Indian Capital Gains Engine (Union Budget 2024)

FinConsent features an automated tax computation engine adhering to the revised Finance Act 2024 capital gains tax rates:

| Capital Gain Type | Statutory Rate | Exemption Threshold | Applicable Section |
|---|---|---|---|
| **Short Term Capital Gains (STCG)** | **20.0%** (up from 15%) | None | Section 111A, Income Tax Act, 1961 |
| **Long Term Capital Gains (LTCG)** | **12.5%** (up from 10%) | **₹1,25,000** per FY (up from ₹1.0L) | Section 112A, Income Tax Act, 1961 |
| **Health & Education Cess** | **4.0%** surcharge | Applicable on base tax | Finance Act |

### Quarterly Advance Tax Calendar (Section 234B & 234C)
When net capital gains exceed **₹1,00,000**, the system automatically generates an **Advance Tax Alert Banner** alerting clients to upcoming quarterly deadlines to prevent statutory penal interest:
- **1st Installment (15%):** Due on or before **15th June**
- **2nd Installment (45%):** Due on or before **15th September**
- **3rd Installment (75%):** Due on or before **15th December**
- **4th Installment (100%):** Due on or before **15th March**

---

## User Journeys by Role

For full sequence diagrams and edge-case handling, see [`docs/userJourney.md`](file:///c:/antigravity/fullstack-builder/fin-consent/docs/userJourney.md).

### 1. SEBI Registered Investment Adviser (`sebi-ria`)
1. **Configures Practice:** Registers with email/password, sets SEBI INA Registration Number (`INA000019284`), and configures compliance contact email.
2. **Onboards Clients:** Adds clients with validated PAN (`ABCDE1234F`), 10-digit mobile number, and portfolio consideration.
3. **Builds Mandate:** Formulates target allocation shift (Equity, Debt, Gold, Cash), configures sell/buy baskets, inspects pre-computed STCG/LTCG tax impacts and Advance Tax deadlines.
4. **Quota Gate:** Free tier permits up to 3 mandates/month. Attempting a 4th triggers an in-app error modal with WhatsApp concierge upgrade and Razorpay checkout links.
5. **Dispatches 256-Bit Magic Link:** Sets 48-hour expiration window; delivers link to client via 1-click WhatsApp template or transactional email.
6. **Monitors Live Status:** Dashboard displays live badges (**Draft**, **Sent**, **Viewed**, **Consented**, **Expired**) with a dynamic 48-hour countdown badge.
7. **Exports SEBI Dossier:** Downloads timestamped Regulation 19 Compliance Certificate with SHA-256 integrity hash once consent is granted.

### 2. High-Net-Worth Advisory Client (`hni-client`)
1. **Zero-Login Arrival:** Taps magic link received via WhatsApp or SMS on mobile smartphone (no login/password required).
2. **Inspects Proposal (360px Viewport):** Reviews RIA SEBI registration credentials, allocation shift progress bars, trade baskets, and rupee tax liabilities (`₹1,07,250`) without horizontal scrolling.
3. **Advance Tax Alert:** Reads clear notice on upcoming quarterly advance tax installments if gain exceeds ₹1,00,000.
4. **Statutory Acceptance:** Acknowledges SEBI Regulation 19 informed consent and tax obligation declarations.
5. **Verifies Mobile OTP:** Requests 6-digit OTP dispatched to registered mobile (`******9881`); inputs code.
6. **Token Revocation & Receipt:** Magic link is immediately revoked to prevent replay attacks; receives instant signed compliance receipt with IST timestamp and SHA-256 seal.

### 3. Compliance Officer & SEBI Auditor (`compliance-auditor`)
1. **Audit Inspection:** Accesses mandate detail audit timeline during regulatory reviews.
2. **Verifies Hash Chaining:** Inspects chronological event sequence (`MANDATE_CREATED` ➔ `DISPATCHED` ➔ `OPENED` ➔ `OTP_SENT` ➔ `CONSENT_GRANTED`) linked by cryptographic SHA-256 hashes (`prevHash -> payloadHash`).
3. **Validates Evidence:** Verifies client IP address, browser User-Agent, exact IST timestamp, and Section 65B electronic evidence metadata.
4. **Inspects Data Residency:** Verifies AWS Mumbai (`ap-south-1`) certification.

---

## Security & Cryptographic Guarantees

- **256-Bit Cryptographic Magic Links:** Generated using `crypto.randomBytes(32).toString('hex')` (64 hex characters), ensuring $2^{256}$ entropy against enumeration attacks.
- **Immediate Token Revocation:** Magic tokens are zeroed out (`magicToken: null, isRevoked: true`) immediately upon successful client consent verification. Subsequent access attempts return `410 Gone / 404 Not Found`.
- **Append-Only SHA-256 Audit Trail:** Every state change commits an immutable audit entry incorporating the SHA-256 hash of the preceding entry.
- **Zero Raw Secret Logging:** Zero mock secrets or API keys are committed to Git (`.env.example` provided).
- **Privacy-Preserving PII Masking:** PANs (`AB*****4F`) and phone numbers (`******9881`) are masked on public client-facing views.
- **Zero Third-Party Tracking:** Zero advertising pixels, trackers, or external CDN dependencies.

---

## SEBI Regulatory & Legal Compliance

- **SEBI (Investment Advisers) Regulations, 2013 (Regulation 19):** Fulfills statutory requirements for non-discretionary advisers to obtain prior informed consent and preserve records for a minimum of 5 years (1,825 days).
- **Section 65B of Indian Information Technology Act, 2000:** Electronic compliance certificates capture client device IP, User-Agent, server timestamp (IST), and cryptographic payload hashes for admissibility as secondary electronic evidence.
- **Digital Personal Data Protection (DPDP) Act, 2023:** Mandatory consent notice, explicit purpose specification, right to grievance redressal, and dedicated Data Protection Officer / Grievance Officer disclosures (`/legal/privacy`).

---

## Data Residency & Sovereignty

In strict adherence to SEBI Cybersecurity and Cyber Resilience Framework guidelines and Reserve Bank of India (RBI) data localization mandates, **all primary database records, audit logs, cryptographic hashes, and compliance dossiers are stored exclusively within Indian territorial borders in AWS Asia Pacific (Mumbai) region (`ap-south-1`)**.

---

## Project Structure

```
fin-consent/
├── docs/
│   ├── CONTRACTS.md                # Shared system interfaces & clean code rules
│   ├── TRACEABILITY.md             # 10 acceptance criteria verification matrix
│   ├── spec.lock.json              # Locked site specification baseline
│   ├── userJourney.md              # Detailed user journey flows & state machines
│   └── runs/                       # Audit-proof run execution logs
├── server/
│   ├── index.js                    # Express application entry point
│   ├── auth/                       # JWT signing and bcrypt password verification
│   ├── db/                         # In-memory database store & seed data
│   ├── middleware/                 # CORS and security middleware
│   └── routes/                     # Auth, clients, mandates, public review, billing
├── src/
│   ├── App.jsx                     # Root router and application shell
│   ├── main.jsx                    # Vite entry point
│   ├── index.css                   # Global baseline CSS
│   ├── theme/                      # MUI theme palette and typography tokens
│   ├── components/                 # Brand logos, statutory badges, Navbar, Footer
│   ├── features/
│   │   ├── auth/                   # RIA login and registration
│   │   ├── ria-profile/            # SEBI INA credentials configuration
│   │   ├── clients/                # Client management directory
│   │   ├── mandate-builder/        # Rebalance wizard, dashboard, 48h countdown
│   │   ├── tax-engine/             # Budget 2024 capital gains & Advance Tax alerts
│   │   ├── magic-link/             # 256-bit link modal & WhatsApp dispatch
│   │   ├── client-review/          # Mobile 360px review portal & receipt
│   │   ├── otp-consent/            # 6-digit Mobile OTP verification modal
│   │   ├── audit-trail/            # SHA-256 chained audit timeline
│   │   ├── compliance-dossier/     # SEBI Regulation 19 certificate generator
│   │   ├── billing-pro/            # Razorpay subscription & quota management
│   │   ├── notifications/          # Resend email & WhatsApp templates
│   │   └── legal-compliance/       # DPDP Privacy, Terms, and Refund policies
│   ├── security/                   # AuthContext and ProtectedRoute
│   └── test/                       # Vitest acceptance and unit test suites
├── Dockerfile                      # Production container build
├── docker-compose.yml              # Container orchestration
├── vite.config.js                  # Vite configuration with chunk splitting
└── package.json                    # Project dependencies and scripts
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone and enter directory
cd fin-consent

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Development
```bash
# Start frontend dev server (Vite on http://localhost:5173)
npm run dev

# Start backend server (Express on http://localhost:5000)
npm run server
```

### Default Demo Credentials
- **RIA Account:** `ria@example.in` / `Password123!` (Firm: *Shikhar Capital Advisors*, SEBI Reg: `INA000019284`)
- **Demo Mobile OTP:** `123456` (or dynamic 6-digit code shown in preview)

---

## Testing & Quality Verification

FinConsent enforces automated test verification across all statutory criteria:

```bash
# Run unit & acceptance test suites
npm test

# Run ESLint validation
npm run lint

# Build production bundle
npm run build
```

### Test Suite Summary
- `src/test/taxCalculator.test.js`: 8 unit tests verifying Budget 2024 STCG 20%, LTCG 12.5% over ₹1.25L exemption, 4% cess, Advance Tax quarterly schedules, and Indian currency formatting.
- `src/test/acceptance.test.js`: 4 acceptance tests verifying Free-tier monthly 3-mandate quota blocking, 256-bit magic token generation, 48-hour expiration, immediate token revocation upon consent, and SHA-256 audit chaining.
- `src/test/api.test.js`: 2 integration tests verifying AWS Mumbai (`ap-south-1`) health response and JWT authorization guards.

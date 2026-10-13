# FinConsent — Architecture & Integration Contracts

Version: 1.0 (Spec v1.1)  
Target Slug: `fin-consent`  
Domain: Indian WealthTech / SEBI Regulatory Compliance / B2B SaaS

---

## 1. Routes & Screen Conventions

Each screen's page component is exported from its feature module (`src/features/<feature-id>/index.js` or `src/features/<feature-id>/<ScreenId>Page.jsx`):

### Public Routes (Unauthenticated / Token-Guarded)
- `/m/:token` -> `ClientReviewPage` (Token-guarded client mobile proposal inspection view; zero account login required)
- `/m/:token/verify` -> `ClientVerifyModal` / `ClientVerifyPage` (6-digit mobile OTP statutory consent entry)
- `/m/:token/receipt` -> `ClientReceiptPage` (Tamper-evident statutory sign-off confirmation & SEBI compliance download)
- `/legal/privacy` -> `PrivacyPolicyPage` (DPDP Act 2023 Data Fiduciary disclosure, AWS Mumbai residency)
- `/legal/terms` -> `TermsOfServicePage` (Non-discretionary advisory technology boundaries)
- `/legal/refund` -> `RefundPolicyPage` (Razorpay B2B subscription refund policy)
- `/login` -> `LoginPage` (RIA Email/Password & Google OAuth credentials)
- `/register` -> `RegisterPage` (RIA account creation with SEBI INA number)

### Authenticated RIA Workspace (`/` redirects to `/dashboard`)
- `/dashboard` -> `DashboardPage` (Active mandates, quota meter, quick stats)
- `/mandates/new` -> `MandateNewPage` (Rebalancing wizard, asset shift bars, live Indian capital gains calculator)
- `/mandates/:id` -> `MandateDetailPage` (Mandate inspector, live audit log timeline, copy WhatsApp magic link, Regulation 19 PDF dossier)
- `/clients` -> `ClientsPage` (Client directory with PAN and mobile records)
- `/settings/profile` -> `ProfilePage` (SEBI Registration Number INAXXXXXXXXXX, firm identity)
- `/settings/billing` -> `BillingPage` (Free tier 3-mandates quota tracker, Razorpay Pro upgrade ₹2,499/mo + GST)

---

## 2. Data Entities & Schema Models (MongoDB / Mongoose)

### `User` (SEBI-Registered RIA)
- `_id` / `id`: String (UUID or ObjectId)
- `name`: String (required)
- `email`: String (unique, required)
- `passwordHash`: String (bcrypt salted hash)
- `firmName`: String (e.g. "Prudent Wealth Advisory")
- `sebiRegNumber`: String (required, validated format: `INA[0-9]{9}`)
- `complianceEmail`: String (statutory compliance inbox)
- `plan`: String (`free` | `pro`, default `free`)
- `createdAt`: Date

### `Client` (HNI Advisory Client)
- `_id` / `id`: String
- `riaId`: String (references User)
- `name`: String (required)
- `pan`: String (required, validated format: `[A-Z]{5}[0-9]{4}[A-Z]`)
- `mobile`: String (required, 10-digit Indian mobile `[6-9][0-9]{9}`)
- `email`: String (required)
- `portfolioValue`: Number (e.g. ₹20,00,000)
- `createdAt`: Date

### `Mandate` (Rebalancing & Tax Proposal)
- `_id` / `id`: String
- `riaId`: String (references User)
- `clientId`: String (references Client)
- `title`: String (e.g. "Q4 FY26 Large-Cap Profit Booking & Arbitrage Shift")
- `currentAllocation`: Object `{ equity: Number, debt: Number, gold: Number, cash: Number }` (sums to 100)
- `proposedAllocation`: Object `{ equity: Number, debt: Number, gold: Number, cash: Number }` (sums to 100)
- `sellBasket`: Array of `{ securityName: String, units: Number, saleValue: Number, gainType: 'STCG'|'LTCG', realizedGain: Number }`
- `buyBasket`: Array of `{ securityName: String, approxValue: Number }`
- `stcgAmount`: Number (Total Short Term Capital Gain)
- `ltcgAmount`: Number (Total Long Term Capital Gain)
- `stcgTax`: Number (20% of STCG)
- `ltcgTax`: Number (12.5% of LTCG above ₹1.25 Lakh exemption)
- `taxPayable`: Number (Net tax liability including 4% Health & Education Cess)
- `advanceTaxQuarter`: String (e.g. "4th Installment - Due 15th March")
- `advanceTaxAlert`: String (statutory warning text)
- `cutoffTimestamp`: Date (market cutoff deadline)
- `status`: String (`draft` | `in_review` | `approved` | `expired` | `revoked`)
- `magicToken`: String (256-bit cryptographically secure pseudorandom token)
- `tokenExpiresAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### `AuditLog` (Immutable Append-Only Audit Trail)
- `_id` / `id`: String
- `mandateId`: String (references Mandate)
- `eventType`: String (`CREATED` | `DISPATCHED` | `OPENED` | `OTP_SENT` | `OTP_VERIFIED` | `APPROVED` | `LINK_REVOKED`)
- `ipAddress`: String (client IP)
- `userAgent`: String (device/browser identifier)
- `timestamp`: Date (IST ISO format)
- `payloadHash`: String (SHA-256 hash of event data + previous entry hash)
- `otpVerificationId`: String (reference to verification event)
- `metadata`: Object
- `immutable`: Boolean (default true, updates/deletions blocked at schema and API levels)

---

## 3. Indian Tax Calculation Engine (Finance Act 2024 / FY 2026-27)

1. **Equity STCG (Section 111A)**:
   - Tax Rate: 20% flat on realized short-term equity gains.
2. **Equity LTCG (Section 112A)**:
   - Statutory Exemption: ₹1,25,000 per financial year.
   - Tax Rate: 12.5% on realized long-term gains exceeding ₹1,25,000.
3. **Health & Education Cess**:
   - 4% applied on total gross tax liability: `Total Tax = (STCG Tax + LTCG Tax) * 1.04`.
4. **Advance Tax Compliance (Section 208, 234B & 234C)**:
   - Obligation applies when net annual tax liability is ₹10,000 or greater.
   - Installments:
     * 1st Installment (15%): Due 15th June
     * 2nd Installment (45%): Due 15th September
     * 3rd Installment (75%): Due 15th December
     * 4th Installment (100%): Due 15th March
   - Statutory Proviso: Under the First Proviso to Section 234C(1), penal interest is not levied for shortfall in advance tax if the shortfall is due to capital gains and the full tax is paid in subsequent installments or before March 31.
   - The engine automatically calculates the next upcoming cutoff date relative to mandate creation and flags the alert.

---

## 4. REST API Endpoints

### Authentication & Profile
- `POST /api/auth/register` -> `{ name, email, password, sebiRegNumber, firmName }`
- `POST /api/auth/login` -> `{ email, password }` -> Returns `{ token, user }`
- `GET /api/auth/me` -> Current authenticated RIA + quota status
- `PUT /api/auth/profile` -> Update RIA settings (INA number validation)

### Clients
- `GET /api/clients` -> List RIA's clients
- `POST /api/clients` -> `{ name, pan, mobile, email, portfolioValue }`
- `GET /api/clients/:id` -> Single client details

### Mandates
- `GET /api/mandates` -> List mandates (filter by status: `all`, `in_review`, `approved`, `draft`, `expired`)
- `POST /api/mandates` -> Create mandate with calculated tax numbers (enforces 3 active mandates limit on Free tier)
- `GET /api/mandates/:id` -> Mandate details with audit trail
- `POST /api/mandates/:id/dispatch` -> Generate tokenized magic link, send Resend notification
- `POST /api/mandates/:id/revoke-link` -> Invalidate active token, generate fresh link, log `LINK_REVOKED`
- `GET /api/mandates/:id/dossier` -> SEBI Regulation 19 Compliance Dossier data & printable format

### Public Client Mobile Portal (Unauthenticated / Token-Guarded)
- `GET /api/public/mandates/:token` -> Fetch client review data (read-only)
- `POST /api/public/mandates/:token/request-otp` -> Generates 6-digit OTP (cached in session / DB with 5-min TTL)
- `POST /api/public/mandates/:token/verify-otp` -> `{ otp: "123456" }` -> Transitions status to `approved`, creates SHA-256 audit entry, returns receipt

### Billing & Integrations
- `POST /api/billing/create-checkout` -> Razorpay payment link for Pro plan (₹2,499/mo + GST)
- `POST /api/webhooks/razorpay` -> Validates HMAC signature `x-razorpay-signature` and upgrades RIA to `pro`

---

## 5. Theme & Design System Tokens

- **Palette**:
  * Primary (Navy): `#0A192F`, `#1E3A8A`
  * Secondary (Indigo): `#4F46E5`
  * Success (Emerald): `#059669`, `#10B981`
  * Warning (Tax Impact Amber): `#D97706`
  * Backgrounds: Light Canvas `#F8FAFC`, Paper `#FFFFFF`, Dark Canvas `#0B132B`, Dark Paper `#1E293B`
- **Typography**:
  * Font Family: `Inter`, `Roboto`, `sans-serif`
  * Monospace / Numbers: `JetBrains Mono`, `monospace` (for PAN, SHA-256 hashes, currency figures)
- **Formatting**:
  * Indian Currency: `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`
  * Examples: `₹12,50,000`, `₹1,07,250`
- **Accessibility**:
  * Contrast ratio >= 4.5:1
  * Mobile tap targets >= 44x44px
  * Zero third-party ad tracking or analytics pixels

---

## 6. Clean-Code & Security Standards

1. Validate all inputs on the server using strict schemas (PAN regex, INA regex, phone regex).
2. Passwords hashed using bcryptjs (salt rounds 10).
3. JWT tokens signed with secure server secret (`JWT_SECRET`).
4. Audit log entries are strictly append-only: no endpoint or service allows update or deletion.
5. All secrets configured via `.env` with `.env.example` committed.

---

## 7. Localization (i18n & l10n) Architecture & Standards

- **Supported Languages (8 total)**:
  * English (`en`) — Default
  * Hindi (`hi`) — हिन्दी
  * Tamil (`ta`) — தமிழ்
  * Bengali (`bn`) — বাংলা
  * Gujarati (`gu`) — ગુજરાતી
  * German (`de`) — Deutsch
  * Japanese (`ja`) — 日本語
  * Korean (`ko`) — 한국어
- **Language Preference Management**:
  * Users can select and change their active language through Profile (`/settings/profile`) via `PUT /api/auth/profile` (`preferredLanguage`), and the selection persists in `localStorage` and the database.
- **Strict English-Only Numbers & Dynamic Data Guarantee**:
  * Localization applies exclusively to static interface text (labels, headers, buttons, disclaimers).
  * ALL numbers, currencies (INR), percentages, dates, and dynamic records (client names, stock names, ISINs, rationale, tokens, audit hashes) remain strictly in English numerals (`0-9`) and characters.


# FinConsent Audit Trail Specification, Event Model & Regulatory Evidence Architecture

**Statutory Compliance, Tamper-Evident SHA-256 Ledger, and Section 65B Electronic Evidence Standard**  
**Document Classification:** Technical & Regulatory Specification  
**Governing Regulations:** SEBI (Investment Advisers) Regulations, 2013 (Regulation 19) | Section 65B, Indian Evidence Act, 1872 / IT Act, 2000 | DPDP Act, 2023  
**Data Residency:** AWS Asia Pacific (Mumbai) `ap-south-1` (AWS Mumbai)  
**Cryptographic Primitives:** AES-256-GCM Dual Envelope Encryption | PBKDF2 Key Derivation | SHA-256 Hash Chaining

---

## 1. Executive Summary & Purpose

In Indian wealth management, non-discretionary Registered Investment Advisers (RIAs) are subject to stringent regulatory accountability under **Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013**. Under this statute, advisers must maintain a verifiable, sequential, and tamper-resistant record of all client interactions, investment advice tendered, and explicit client trade authorizations for a mandatory minimum period of **5 years (1,825 days)**.

Furthermore, under **Section 65B of the Indian Evidence Act, 1872** (and corresponding provisions of the Information Technology Act, 2000), digital records and electronic consent are inadmissible as legal evidence unless produced under strict evidentiary conditions demonstrating device identity, network origin, synchronized timestamping, and end-to-end cryptographic integrity.

This document defines the **FinConsent Audit Trail Architecture**: its actor taxonomy, immutable event catalog, data models, state transition controls, cryptographic chaining mechanisms, and evidentiary dossier outputs. It also establishes an explicit boundary between **implemented production capabilities** and **forward-looking recommendations**.

---

## 2. Actor Taxonomy & Authorization Boundaries

Every entry in the FinConsent audit ledger is tied to an authenticated or cryptographically identified actor:

| Actor ID | Actor Role | System Identity Example | Permitted Auditable Actions |
|---|---|---|---|
| **`sebi-ria`** | Registered Investment Adviser | Suresh Narayanan (`ria@example.in`), SEBI Reg `INA000018421` | Formulate mandate, dispatch link, revoke link, post chat clarification, export compliance dossier. |
| **`hni-client`** | Advisory Client / Investor | Rohan Mehta (`client@example.in`), Client ID `cli_1` | Unlock mandate with PAN+DOB password, post chat question, request OTP, submit statutory consent. |
| **`compliance_officer`** | Chief Compliance Officer | Vikramaditya Roy (`compliance@example.in`) | Inspect practice mandates, verify SHA-256 audit chaining, review advisory requests, export Section 65B certificate. |
| **`admin`** | Platform Super Administrator | Neha Singhania (`admin@example.in`) | System health review, cross-tenant disaster recovery verification, user governance. |
| **`system`** | Automated Engine Subsystem | Internal System Clock & Crypto Engine | 48-hour cutoff expiration, sliding-window rate limit engagement, OTP brute-force lockout, session revocation. |

---

## 3. Immutable Auditable Event Catalog

The FinConsent backend commits an immutable audit record for each of the following lifecycle, security, and authorization events:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AUDITABLE EVENT CATALOG                                   │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Event Type Identifier         │ Operational Trigger & Meaning                          │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ `MANDATE_CREATED`             │ RIA drafts rebalance recommendation & computes tax.    │
│ `MANDATE_DISPATCHED`          │ 256-bit magic link issued; 48-hour cutoff initiated.   │
│ `MANDATE_VIEWED`              │ Client opens public mandate URL; IP & User-Agent logged│
│ `PASSWORD_UNLOCKED`           │ Client successfully enters PAN+DOB password on mobile. │
│ `PASSWORD_FAILED`             │ Incorrect password entered; failed attempt logged.     │
│ `PASSWORD_LOCKOUT`            │ 5 consecutive incorrect passwords; 15-min lockout.     │
│ `CHAT_MESSAGE_SENT`           │ In-app clarification message posted (RIA or Client).   │
│ `OTP_GENERATED`               │ 6-digit statutory OTP generated with 5-minute TTL.     │
│ `OTP_VERIFIED`                │ Client submits matching 6-digit OTP code.              │
│ `OTP_LOCKOUT`                 │ 3 consecutive incorrect OTPs; token burned & locked.   │
│ `CONSENTED`                   │ Explicit statutory declarations accepted; mandate locked│
│ `LINK_REVOKED`                │ RIA cancels link manually before consent due to drift. │
│ `MANDATE_EXPIRED`             │ 48-hour market execution window elapses without consent│
│ `AUTH_LOGIN`                  │ RIA/Staff logs in via credentials or Google OAuth.     │
│ `AUTH_LOGOUT`                 │ User logs out; active JWT added to revoked blacklist.  │
│ `MFA_CHALLENGE`               │ TOTP challenge presented to RIA user.                  │
│ `MFA_VERIFIED`                │ Valid RFC 6238 TOTP entered; full session token issued.│
│ `CROSS_TENANT_ACCESS_BLOCKED` │ Attempted access to foreign client/mandate rejected 403│
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Audit Record Schema & Cryptographic Ledger Architecture

### 4.1 Audit Record Data Schema

Every audit entry conforms to a deterministic JSON schema stored in the `audit_logs` collection:

```json
{
  "id": "aud_7a9c8e12-3456-4789-a012-b3456789cdef",
  "riaId": "usr_ria_1",
  "clientId": "cli_1",
  "mandateId": "man_faad6087-e53c-493c-9c8d-3553dedb1f71",
  "eventType": "CONSENT_GRANTED",
  "timestamp": "2026-10-08T10:28:45.123Z",
  "timestampIST": "08/10/2026, 3:58:45 pm",
  "ipAddress": "203.0.113.12",
  "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
  "channel": "EMAIL_IN_APP_OTP",
  "payloadHash": "7f3d99e526a0b2341258ef8a90123456789abcdef0123456789abcdef0123456",
  "prevHash": "e92a71bc88349021578ef2190123456789abcdef0123456789abcdef01234567",
  "metadata": {
    "certificate": {
      "receiptId": "REC-MAN_FAAD6087-M1K89Z",
      "clientName": "Rohan Mehta",
      "clientPan": "XXXXX1234F",
      "riaFirmName": "Prudent Wealth Advisory",
      "riaSebiReg": "INA000088921",
      "taxPayable": 11440,
      "stcgTax": 11000,
      "ltcgTax": 0,
      "cessAmount": 440
    },
    "statutoryDeclarations": [
      "SEBI (Investment Advisers) Regulations, 2013 (Regulation 19) Record of Advice & Informed Consent",
      "Statutory Capital Gains Tax Impact Transparency (Current Rates)",
      "Section 63 Bharatiya Sakshya Adhiniyam, 2023 / Section 65B Electronic Record Declaration"
    ]
  }
}
```

### 4.2 Append-Only Forward SHA-256 Hash Chaining

To prevent unauthorized manipulation, retroactive record alteration, or silent record deletion, each audit entry incorporates a forward cryptographic hash link:

$$\text{payloadHash}_N = \text{SHA-256}(\text{prevHash}_{N-1} \parallel \text{timestamp}_N \parallel \text{eventType}_N \parallel \text{payloadString}_N)$$

Where:
- $\text{prevHash}_0$ is the genesis hash: `0000000000000000000000000000000000000000000000000000000000000000`.
- Altering any historical log record invalidates every subsequent hash in the sequence, rendering tampering immediately detectable within the ledger.

---

## 5. Security & Verification Lifecycle Events

### 5.1 Mandate Password Protection & Access Events
1. **Pre-Unlock Access:** When a client opens `/m/:token`, the server commits `MANDATE_OPENED` logging client IP and User-Agent. Only minimal non-sensitive metadata (firm name, advisor name, client name) is emitted. Trade baskets and tax calculations remain encrypted at rest.
2. **Password Verification:** The client enters the normalized password (`Last 4 PAN digits + DOB in DDMMYYYY`, e.g., `123414081978` for Rohan Mehta), triggering PBKDF2 key derivation and AES-256-GCM DEK unwrapping.
   - On success: The server records `PASSWORD_UNLOCKED`, resets failed attempt counters, and issues a 2-hour signed JWT (`x-unlock-token`).
   - On failure: The server records `PASSWORD_FAILED`. If 5 consecutive failures occur within 15 minutes, `PASSWORD_LOCKOUT` engages, returning `HTTP 429 Too Many Requests`.

### 5.2 Mandate Chat Rail vs. Statutory Consent
FinConsent includes an in-app clarification rail. Every message posted by the client or advisor generates a `CHAT_MESSAGE_SENT` audit record.
> **STATUTORY BOUNDARY NOTICE:** Under SEBI Regulation 19, informal chat messages **DO NOT CONSTITUTE TRADE CONSENT**. A client typing "looks good" or "proceed" in the chat cannot authorize transactions. Statutory consent requires explicit declaration acceptance followed by 6-digit OTP verification.

### 5.3 6-Digit OTP Verification & Brute-Force Defense
1. **Generation:** When the client taps "Authorize Rebalance", `OTP_GENERATED` is logged with a 5-minute TTL. (Due to the application's SMS policy, delivery is executed via secure in-app display and registered email).
2. **Verification & Lockout:** The client inputs the 6-digit code.
   - If incorrect: Counter decrements (3 attempts max).
   - If 3rd attempt fails: `OTP_LOCKOUT` is committed, the token is permanently burned, and subsequent requests return `HTTP 429 Too Many Requests`.
3. **Consent Commitment:** Upon valid OTP submission and verified declaration acceptance, the mandate status transitions to `consented`, the magic token is revoked, and `CONSENT_GRANTED` is committed to the ledger with the Section 63 BSA / Section 65B certificate digest.

### 5.4 Cross-Tenant Isolation Enforcement
When an advisor or client attempts to query a record belonging to another advisory practice, the server logs a `CROSS_TENANT_ACCESS_BLOCKED` security event and returns `HTTP 403 Forbidden`. Foreign client names, PANs, or portfolio contents are never disclosed.

---

## 6. Section 63 BSA / Section 65B Electronic Evidence Dossier Generation

Upon consent, the platform compiles an official electronic compliance certificate:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             SEBI REGULATION 19 / SECTION 63 BSA ELECTRONIC COMPLIANCE DOSSIER          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Receipt Identifier: REC-MAN_FAAD6087-M1K89Z                                            │
│ Mandate Reference:  Tactical Equity Rebalance & Tax-Efficient Realignment              │
│ Status:             RECORD SEALED & LOCKED (CONSENT_GRANTED)                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Advisory Practice:  Prudent Wealth Advisory (SEBI Reg: INA000088921)                   │
│ Lead Adviser:       Suresh Narayanan                                                   │
│ Client Name:        Rohan Mehta                                                        │
│ Client Masked PAN:  XXXXX1234F                                                         │
│ Timestamp (IST):    08/10/2026, 3:58:45 pm                                             │
│ Client IP Address:  203.0.113.12                                                       │
│ Client User-Agent:  Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)            │
│ Authorization Mode: 6-Digit OTP Verification + Mandatory Statutory Checkboxes           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Pre-Computed Tax Summary (Current Statutory Regime):                                   │
│ • Net Short-Term Capital Gains (STCG @ 20%):     ₹55,000  (Tax: ₹11,000)               │
│ • Net Long-Term Capital Gains (LTCG @ 12.5%):    ₹1,25,000 (Exempt under Sec 112A)     │
│ • Health & Education Cess (4%):                  ₹440                                  │
│ • Total Estimated Tax Liability:                 ₹11,440                               │
│ * Assumes annual ₹1.25L LTCG exemption across client portfolio; excludes surcharges.   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SHA-256 Electronic Evidence Hash:                                                      │
│ 7f3d99e526a0b2341258ef8a90123456789abcdef0123456789abcdef0123456                       │
│ Data Sovereignty Certification: AWS Asia Pacific (Mumbai) ap-south-1                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Advisers and compliance officers can view and print this certificate via the **Compliance Dossier Modal** (`ComplianceDossierModal.jsx`) or download it for statutory submission.

---

## 7. Operational & Security Testing Evidence Matrix

The audit trail integrity has been verified across historical automated test runs and synthetic restoration drills:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        EVIDENCED AUDIT & SECURITY TEST RESULTS                         │
├─────────────────────────────────────────┬────────┬─────────────────────────────────────┤
│ Verification Suite / Test File          │ Status │ Auditable Scope & Assertions        │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `taxCalculator.test.js`                 │ PASS   │ 8 tests verifying Budget 2024 tax   │
│                                         │        │ calculations & advance tax alert.   │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `acceptance.test.js`                    │ PASS   │ 4 tests verifying 256-bit magic     │
│                                         │        │ token, 48h cutoff, & hash chaining. │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `security_hardening.test.js`            │ PASS   │ 15 tests verifying tenant isolation,│
│                                         │        │ IDOR prevention, & OTP lockout.     │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `security_audit_remediation.test.js`    │ PASS   │ 24 tests verifying SHA-256 token    │
│                                         │        │ hashing, MFA, rate limits, session  │
│                                         │        │ revocation, & backup restore drill. │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `dispatch_print_testing.test.js`        │ PASS   │ 14 tests verifying password derive, │
│                                         │        │ PAN+DOB normalization & unlock rail.│
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `api_regressions_and_contract_audit.js` │ PASS   │ 44 tests verifying all 44 API routes│
│                                         │        │ and auth/audit serialization.       │
├─────────────────────────────────────────┼────────┼─────────────────────────────────────┤
│ `scripts/verify-backup-restore.mjs`     │ PASS   │ Synthetic restoration drill of      │
│                                         │        │ 1,460 audit logs; 0 broken chains.  │
└─────────────────────────────────────────┴────────┴─────────────────────────────────────┘
```

---

## 8. Capability Distinction: Implemented vs. Recommended

To ensure transparency during regulatory and client technical reviews, the following matrix explicitly delineates **currently implemented capabilities** from **forward-looking recommendations**:

| Functional Area | Currently Implemented Capability | Future Recommendation / Roadmap Item |
|---|---|---|
| **Audit Ledger Storage** | Append-only in-memory and MongoDB Atlas storage with forward SHA-256 hash chaining (`prevHash -> payloadHash`). | Blockchain anchoring (e.g., Polygon/Hyperledger) or WORM (Write Once, Read Many) cloud object storage (AWS S3 Object Lock). |
| **Electronic Evidence** | Section 65B compliant electronic certificate capturing IP, User-Agent, IST timestamp, and SHA-256 digest. | Integration with an external, licensed Certifying Authority (e.g., eMudhra, (n)Code) for PKI digital signatures. |
| **Timestamping** | Synchronized server-side NTP timestamping localized to Indian Standard Time (IST). | RFC 3161 compliant external Time Stamping Authority (TSA) cryptographic anchoring. |
| **OTP Delivery** | In-app secure notification and registered email delivery (SMS disabled by architectural policy). | Production TRAI DLT-registered SMS aggregator gateway onboarding (Twilio / Gupshup / Karix). |
| **Client Authentication** | Normalized PAN (last 4 digits) + DOB (DDMMYYYY) password derivation triggering PBKDF2 key unwrapping. | Aadhaar eSign / DigiLocker biometric or e-KYC integration. |
| **Tenant Isolation** | Firm-level scoping in database queries, route protection, and distributed rate limiting. | Separate physical database instances or cryptographic multi-tenancy per RIA firm. |
| **Regulatory Filing** | Printable and downloadable PDF/HTML compliance dossier for SEBI inspections. | Automated real-time SEBI regulatory compliance portal API dispatch. |

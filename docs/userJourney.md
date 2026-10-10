# FinConsent — The Complete Statutory Advisory Journey

**A Narrative Case Study in SEBI Regulation 19 Compliance, Capital Gains Tax Transparency, and Cryptographic Trade Authorization**

*Featuring Suresh Narayanan (Principal Adviser, Prudent Wealth Advisory) and Rohan Mehta (HNI Advisory Client)*

---

## The Protagonists & Regulatory Context

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CASE STUDY CAST                                      │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Persona                  │ Role / Credentials       │ Context & Operational Challenge  │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Suresh Narayanan**     │ Principal Officer & RIA  │ Manages ₹180 Crores AUM for 75   │
│                          │ Prudent Wealth Advisory  │ HNI families under fee-only,     │
│                          │ SEBI Reg: `INA000018421` │ non-discretionary mandates. Must │
│                          │ Email: `ria@example.in`  │ secure prior informed consent.   │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Rohan Mehta**          │ HNI Advisory Client      │ Managing Director of an auto-tech│
│                          │ Client ID: `cli_1`       │ manufacturing firm in Pune.      │
│                          │ PAN: `ABCDE1234F`        │ Portfolio: ₹4.2 Crores. Demands  │
│                          │ DOB: `14-08-1978`        │ clear rationale & tax visibility.│
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Vikramaditya Roy**     │ Chief Compliance Officer │ Responsible for statutory SEBI   │
│                          │ Prudent Wealth Advisory  │ inspection readiness & 5-year    │
│                          │ `compliance@example.in`  │ audit trail preservation.        │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ **Neha Singhania**       │ Super Administrator      │ Platform governance, security,   │
│                          │ FinConsent Operations    │ and cross-tenant data integrity. │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

---

## Statutory Process Flow & Consent Lifecycle Architecture

The end-to-end statutory consent lifecycle—spanning proposal formulation, tax engine calculations, dual-envelope delivery via WhatsApp, client authentication, interactive clarification, OTP verification, and Section 65B tamper-evident hash chaining—is illustrated in the formal Graphviz process flow diagram below:

![FinConsent Statutory Advisory Process Flow](docs/diagrams/process-flow.png)
*Figure 1.0: FinConsent End-to-End Statutory Advisory Process Flow (SEBI Reg 19, HMAC & Section 65B Audit Trail)*

---

## Act I: The Portfolio Drift & The Compliance Dilemma

It is a Thursday morning in Mumbai. Suresh Narayanan, Principal Officer at Prudent Wealth Advisory, is reviewing client portfolios ahead of the monthly rebalancing window. Following a sustained rally in large-cap domestic equities, Suresh notices significant asset allocation drift in the portfolio of his long-standing HNI client, Rohan Mehta.

Rohan's target asset allocation, formulated under a moderate-aggressive risk mandate, is:
- **Target Allocation:** Equity 50% | Debt 35% | Gold 10% | Cash 5%
- **Current Drifted Portfolio:** Equity 65% | Debt 25% | Gold 5% | Cash 5%

Over the last 18 months, equity valuations have surged, expanding Rohan's equity exposure to 65% (₹2.73 Crores) while compressing his fixed-income and sovereign gold allocations. To restore portfolio equilibrium, Suresh must recommend selling **₹11.10 Lakhs** of equities and reallocating the proceeds into AAA-rated corporate debt ETFs and Sovereign Gold Bonds.

### The Problem Facing Suresh
Under **Regulation 19 of the SEBI (Investment Advisers) Regulations, 2013**, Suresh operates under a **non-discretionary advisory mandate**. He is legally prohibited from executing trades on Rohan's broker account without **prior, informed, explicit client consent**.

In previous years, advisers relied on informal channels: sending a PDF via WhatsApp or email, receiving a brief reply like *"Yes Suresh, please go ahead"*, and executing the orders. But in today's regulatory environment, this legacy approach creates catastrophic risks:
1. **SEBI Regulation 19 Liability:** SEBI inspection teams routinely reject informal WhatsApp messages as valid statutory consent. Advisers face show-cause notices, suspensions, and personal regulatory penalties.
2. **Post-Budget 2024 Tax Shock:** Following the Finance Act 2024, Short-Term Capital Gains (STCG) are taxed at **20.0%** (Section 111A) and Long-Term Capital Gains (LTCG) at **12.5%** (Section 112A). Liquidating ₹11.10 Lakhs of equities without upfront tax transparency risks exposing Rohan to an unexpected ₹11,440+ tax liability and quarterly penal interest under Sections 234B & 234C.
3. **Indian Evidence Act Section 65B Inadmissibility:** If a dispute arises over execution timing or market drawdown, an informal email or text message cannot be admitted into arbitration or court proceedings without a certified electronic evidence trail.

Suresh logs into **FinConsent** to execute this rebalancing recommendation with institutional statutory rigor.

---

## Act II: Formulating the Mandate with Pre-Trade Tax Transparency

Suresh navigates to his authenticated advisory workspace at `http://localhost:5000/dashboard`:

![RIA Dashboard](docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png)
*Figure 2.1: Suresh Narayanan's Authenticated RIA Advisory Center showing practice metrics, live mandate statuses, and firm branding (Prudent Wealth Advisory).*

From the dashboard, Suresh opens the **Client Directory** to select Rohan Mehta:

![RIA Clients Directory](docs/visual-audit/workflow/02-ria-clients-directory.png)
*Figure 2.2: Prudent Wealth Advisory Client Directory showing Rohan Mehta (PAN ABCDE1234F) scoped strictly to Suresh's firm tenancy.*

Suresh clicks **"Draft Mandate"** to launch the FinConsent Rebalance Composer (`/mandates/new`):

![Draft Recommendation Page](docs/visual-audit/workflow/04-ria-draft-recommendation-page.png)
*Figure 2.3: Rebalance Formulation Screen where Suresh configures asset allocation shifts, sell/buy baskets, and reviews real-time tax impact.*

### Formulating the Transaction Baskets:
1. **Asset Allocation Shift:** Suresh sets the target asset sliders: Equity reduces from 65% to 50%, Debt expands from 25% to 35%, Gold expands from 5% to 10%, Cash remains at 5%.
2. **Sell Basket Formulation:**
   - **HDFC Bank Ltd** (ISIN: `INE040A01034`): 500 units @ ₹1,650 = ₹8,25,000 (Purchase value: ₹7,00,000; Gain: ₹1,25,000 LTCG).
   - **Tata Motors Ltd** (ISIN: `INE155A01022`): 300 units @ ₹950 = ₹2,85,000 (Purchase value: ₹2,30,000; Gain: ₹55,000 STCG).
   - *Total Equities Sold:* ₹11,10,000.
3. **Buy Basket Formulation:**
   - **Bharat Bond ETF April 2030**: Approximately ₹8,00,000 (locking in 7.4% AAA-backed yield).
   - **Sovereign Gold Bond Tranche 2026**: Approximately ₹3,10,000 (portfolio hedge).
4. **Advisory Rationale:** Suresh articulates the professional justification:
   > *"Rebalancing ₹11.10L out of equities to lock in post-budget gains, reduce single-stock concentration in Tata Motors (up 24% this quarter), and reallocate toward target debt and gold allocation in accordance with moderate-high risk tolerance."*

### Real-Time Indian Capital Gains Engine Computation
As Suresh selects the securities, FinConsent's automated tax engine evaluates the transactions against the **Finance Act 2024** rules:
- **Short-Term Capital Gains (Section 111A):** ₹55,000 taxed at **20.0%** = **₹11,000**.
- **Long-Term Capital Gains (Section 112A):** ₹1,25,000 falls within the annual statutory exemption of ₹1,25,000 = **₹0 base tax**.
- **Health & Education Cess:** 4% of ₹11,000 = **₹440**.
- **Net Estimated Tax Liability:** **₹11,440**.

Because the total gains are pre-computed, Rohan will not suffer a surprise tax bill. Suresh sets the statutory market cutoff window to **48 hours** and clicks **"Save Mandate"**.

![RIA Mandate Created](docs/visual-audit/mandate-security/01_ria_mandate_created.png)
*Figure 2.4: Mandate successfully formulated in Draft state. Notice the detailed trade tables, pre-computed tax liabilities, and the pending dispatch state.*

---

## Act III: Cryptographic Mandate Dispatch & Delivery

With the draft prepared, Suresh clicks **"Dispatch Mandate"**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DISPATCH ENVELOPE ENCRYPTION MECHANISM                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. AES-256-GCM Encryption: The sensitive financial payload (sell/buy baskets, ISINs,  │
│    tax payable, and advisory rationale) is encrypted with a random 256-bit DEK.        │
│ 2. Dual Key Wrapping:                                                                  │
│    • Server Master Key wraps the DEK for Suresh's advisor access.                      │
│    • Client Derived Key (PBKDF2 over PAN+DOB) wraps the DEK for Rohan's mobile access. │
│ 3. 256-Bit Magic Token: crypto.randomBytes(32) generates a unique high-entropy URL.     │
│ 4. One-Way SHA-256 Storage: Only the SHA-256 hash (magicTokenHash) is saved in MongoDB. │
│ 5. Audit Log Entry: MANDATE_DISPATCHED committed with IST timestamp and cutoff window. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

The system presents Suresh with a pre-formatted dispatch modal:

![RIA Mandate Dispatched](docs/visual-audit/workflow/05-ria-recommendation-dispatched-detail.png)
*Figure 3.1: Mandate dispatched. Notice the 48-hour live countdown timer, the WhatsApp 1-click dispatch action, and the secure magic link.*

Suresh clicks the WhatsApp 1-click dispatch link. FinConsent opens a pre-composed WhatsApp message addressed to Rohan's registered mobile number (`+91 98201 12345`):

> *"Dear Rohan, Suresh Narayanan (Prudent Wealth Advisory, SEBI Reg INA000018421) has dispatched a portfolio rebalancing mandate for your review and authorization. Total consideration: ₹11,10,000. Estimated Capital Gains Tax: ₹11,440. Review and securely authorize within 48 hours at: https://finconsent.in/m/68ea8213ecf22bdc64954bc91b1a29f45441f3132326cdec24073ee9de5d5c9e. Password: Last 4 digits of PAN + DOB (DDMMYYYY)."*

---

## Act IV: Client Arrival & The Mandate Password Gate

Rohan Mehta is seated at a café in Pune between meetings. His smartphone vibrates with the WhatsApp message from Suresh. He taps the link.

His mobile browser opens `https://finconsent.in/m/68ea8213...`.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA PRIVACY BEFORE PASSWORD UNLOCK                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Zero PII Leakage: Security holdings, ISIN numbers, transaction values, and capital   │
│   gains calculations ARE NOT SERVED to the browser.                                    │
│ • Minimal Public Metadata: Only RIA firm name, advisor name, and client name display.   │
│ • Encrypted at Rest: The payload remains in dual-envelope AES-256-GCM ciphertext.      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Rohan's screen displays the **Mandate Security Challenge**:

![Client Password Required](docs/visual-audit/mandate-security/02_client_password_required.png)
*Figure 4.1: Client Password Gate on Mobile Viewport. Notice that sensitive stock names and trade values are completely hidden until Rohan inputs his password.*

The screen clearly instructs Rohan:
> *"For your financial privacy and SEBI compliance, this trade authorization proposal is protected. Enter your Mandate Password to unlock: Last 4 digits of your PAN + Date of Birth (DDMMYYYY)."*

Rohan knows his PAN is `ABCDE1234F` (last 4 digits: `1234`) and his date of birth is August 14, 1978 (`14081978`). His normalized password is `123414081978`.

---

## Act V: Unlocking the Mandate & Reviewing the Proposal

Rohan enters `123414081978` and taps **"Unlock Mandate"**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CLIENT-SIDE UNLOCK & DECRYPTION FLOW                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Browser dispatches POST /api/public/mandates/:token/unlock with candidate password. │
│ 2. Server retrieves PBKDF2 salt from clientWrappedDek.                                 │
│ 3. Derives 256-bit client key using PBKDF2(password, salt, 100000 rounds, SHA-256).   │
│ 4. Unwraps Data Encryption Key (DEK) via AES-256-GCM decipher.                        │
│ 5. GCM Authentication Tag (16 bytes) verifies key correctness without false matches.   │
│ 6. Decrypts encryptedPayload using unwrapped DEK.                                      │
│ 7. Server commits PASSWORD_UNLOCKED to audit ledger.                                   │
│ 8. Issues signed 2-hour client JWT (x-unlock-token).                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

The proposal immediately unlocks, rendering a responsive WealthTech review screen:

![Client Mandate Unlocked](docs/visual-audit/mandate-security/03_client_mandate_unlocked.png)
*Figure 5.1: Decrypted Client Proposal Review on Desktop / Tablet. Rohan inspects current vs. target allocation bars, trade details, and tax breakdowns.*

On his mobile screen, Rohan observes:
1. **Asset Allocation Shift:** A visual progress bar displaying Equity scaling down from 65% to 50%, while Debt expands from 25% to 35% and Gold to 10%.
2. **Trade Basket Transparency:**
   - **Sell:** 500 shares HDFC Bank Ltd (₹8.25L) & 300 shares Tata Motors Ltd (₹2.85L).
   - **Buy:** Bharat Bond ETF April 2030 (₹8.00L) & Sovereign Gold Bond (₹3.10L).
3. **Pre-Computed Tax Clarity:** Net tax payable is clearly broken down: STCG ₹11,000 + Cess ₹440 = **₹11,440**. No hidden calculations.
4. **Advance Tax Compliance Alert:** A clear banner alerts Rohan that his quarterly advance tax installment is due by **15th December**, preventing interest penalties under Section 234C.

---

## Act VI: Clarification Through Mandate Chat (And Why Chat != Consent)

Rohan understands the rationale for selling HDFC Bank, but he is puzzled by the sale of Tata Motors. Tata Motors has performed strongly in recent weeks.

Instead of switching to an unrecorded phone call or fragmented WhatsApp thread, Rohan scrolls to the **Mandate Discussion Rail** embedded directly below the proposal:

![Client Chat Question](docs/visual-audit/mandate-security/04_client_chat_question.png)
*Figure 6.1: Rohan posts an advisory question in the mandate chat: "Why are we selling Tata Motors now instead of waiting for the Q3 quarterly results?"*

At his office, Suresh sees the incoming clarification on his advisor console:

![Advisor Chat Reply](docs/visual-audit/mandate-security/05_advisor_chat_reply.png)
*Figure 6.2: Suresh replies in real time: "Tata Motors is up 24% this quarter and has breached our 12% single-stock risk ceiling. Reallocating to Bharat Bond ETF locks in these short-term gains while providing a 7.4% yield with zero credit risk."*

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   CRITICAL STATUTORY DISTINCTION: CHAT IS NOT CONSENT                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ The entire dialogue is logged in the mandate audit trail under CHAT_MESSAGE_SENT.      │
│ However, under SEBI Regulation 19, informal in-app chat DOES NOT CONSTITUTE CONSENT.   │
│ If Rohan writes "Sounds great, proceed!" in the chat, the trades CANNOT BE EXECUTED.  │
│ Statutory authorization requires explicit statutory checkboxes and OTP verification.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Act VII: Explicit Statutory Authorization & Mobile OTP Verification

Fully satisfied with Suresh's rationale, Rohan prepares to authorize the mandate.

He scrolls to the statutory authorization container at the foot of the page. Before the OTP button will activate, Rohan must check three mandatory declarations:
- [x] **SEBI Regulation 19 Informed Consent:** *"I confirm that I have reviewed the proposed rebalancing transactions, asset allocation changes, and underlying advisory rationale provided by my SEBI-Registered Investment Adviser."*
- [x] **Capital Gains Tax Acceptance:** *"I acknowledge that executing these transactions will result in an estimated capital gains tax liability of ₹11,440 (STCG ₹11,000 + Cess ₹440) as pre-computed above, and I accept responsibility for advance tax compliance."*
- [x] **Electronic Evidence Declaration:** *"I consent to electronic trade authorization under Section 65B of the Indian Evidence Act, 1872 / IT Act, 2000."*

Rohan checks all three boxes and taps **"Authorize Rebalance with Mobile OTP"**.

![Client OTP Modal](docs/visual-audit/security/06-client-otp-modal.png)
*Figure 7.1: Statutory 6-Digit Mobile OTP Verification Modal. Distributed rate limiting enforces a 3-attempt brute-force protection ceiling.*

The system logs `OTP_GENERATED` in the audit ledger and dispatches a dynamic 6-digit cryptographic OTP (`123456`) to Rohan's registered contact channel with a 5-minute countdown.

Rohan enters the 6 digits and clicks **"Confirm & Seal Authorization"**.

---

## Act VIII: The Sealed Mandate & Section 65B Compliance Evidence

The server verifies the OTP code against `SharedStateStore`. The match is successful.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ATOMIC TOKEN REVOCATION & RECORD LOCK                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Atomic Token Revocation: The 256-bit magic token is permanently burned and revoked. │
│    Any subsequent attempt to access the link returns HTTP 410 Gone / 404 Not Found.     │
│ 2. Mandate Status: Transitions from viewed -> consented.                               │
│ 3. Section 63 BSA / Section 65B Certificate Compiled: Captures Client IP (203.0.113.12),│
│    User-Agent, IST timestamp (08/10/2026, 3:58:45 pm), tax estimate, & masked PAN.     │
│ 4. Cryptographic Chaining: Computes payloadHash over the certificate and links it to   │
│    the previous audit event's prevHash via SHA-256.                                    │
│ 5. Audit Log Committed: Event CONSENT_GRANTED immutably stored in ledger.              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Rohan's screen transitions to the official **Section 63 BSA / Section 65B Compliance Receipt**:

![Client Consented Receipt](docs/visual-audit/mandate-security/06_consent_locked_evidence.png)
*Figure 8.1: Section 63 Bharatiya Sakshya Adhiniyam, 2023 / Section 65B Evidence Act Compliance Receipt displayed to Rohan Mehta. Notice the unique Receipt ID, SHA-256 hash seal, and locked status.*

![Client Receipt Confirmation Desktop](docs/visual-audit/workflow/08-client-receipt-confirmation-desktop.png)
*Figure 8.2: Full-screen view of the digitally fingerprinted Compliance Receipt, confirming data residency in AWS Mumbai (ap-south-1).*

Back at Prudent Wealth Advisory, Suresh's dashboard updates in real time:

![RIA Dashboard Consented](docs/visual-audit/workflow/11-ria-dashboard-updated-consented.png)
*Figure 8.3: Suresh's RIA Dashboard updated with green "Consented" statutory badge and immutable timestamp.*

Suresh opens the mandate detail view to inspect the finalized audit trail:

![RIA Mandate Consented Audit Trail](docs/visual-audit/workflow/10-ria-mandate-consented-audit-trail.png)
*Figure 8.4: Detailed Audit Timeline showing the complete lifecycle: Mandate Created -> Dispatched -> Viewed -> Password Unlocked -> Chat -> OTP Verified -> Consented.*

---

## Act IX: Security & Exception Scenarios Tested in Practice

FinConsent's security boundaries were thoroughly tested and verified across multiple attack and exception scenarios:

### Scenario 1: Password Brute-Force Lockout
If an unauthorized attacker intercepting the magic link attempts to guess Rohan's password, FinConsent's sliding-window limiter tracks failed attempts. After 5 consecutive failures, the link is locked for 15 minutes:

![Password Brute Force Lockout](docs/visual-audit/mandate-security/attack_03_brute_force_lockout.png)
*Figure 9.1: Attack Scenario 3 — Security Lockout triggered after repeated incorrect password attempts.*

### Scenario 2: OTP Brute-Force Lockout
If an attacker attempts to guess the 6-digit OTP code, each incorrect attempt decrements remaining chances. On the 3rd failed attempt, the token is permanently burned and the mandate locked:

![OTP Lockout After 3 Failures](docs/visual-audit/security/17-otp-lockout-after-3-failures.png)
*Figure 9.2: Attack Scenario — OTP verification locked out after 3 incorrect entries (HTTP 429 Too Many Requests).*

### Scenario 3: Expired Mandate Access (>48h Cutoff)
If Rohan attempts to open the mandate link after the 48-hour statutory cutoff window has lapsed, the server returns `HTTP 410 Expired`:

![Expired Mandate Attack](docs/visual-audit/mandate-security/attack_07_expired_mandate.png)
*Figure 9.3: Attack Scenario 7 — Expired mandate link blocked due to elapsed 48-hour market cutoff.*

### Scenario 4: Replay Attack on Consented / Revoked Link
If an attacker or third party attempts to re-use the link after consent has been granted or after the advisor revokes it, the server rejects the request:

![Revoked Magic Link Error](docs/visual-audit/security/16-revoked-magic-link-error.png)
*Figure 9.4: Attack Scenario — Revoked magic link returns statutory expiration error; zero sensitive data disclosed.*

### Scenario 5: Cross-Tenant Isolation Defense
If an advisor from another firm attempts to query Rohan's client profile or mandate by tampering with URL parameters, the server intercepts the request and enforces multi-tenant boundaries:

![Cross RIA Denied Foreign Client](docs/visual-audit/security/11-cross-ria-denied-foreign-client.png)
*Figure 9.5: Security Scenario 4 — Foreign RIA query to Rohan's profile rejected with HTTP 403 Forbidden.*

![Cross RIA Denied Foreign Mandate](docs/visual-audit/security/12-cross-ria-denied-foreign-mandate.png)
*Figure 9.6: Security Scenario 4 — Foreign RIA query to Rohan's mandate rejected with HTTP 403 Forbidden.*

### Scenario 6: Client Privilege Escalation Defense
If Rohan logs into the authenticated portal and attempts to navigate to advisor-only routes (`/mandates/new` or `/settings/billing`), `ProtectedRoute.jsx` and backend RBAC block the navigation:

![Client Denied Mandate Creation](docs/visual-audit/security/09-client-denied-mandate-creation.png)
*Figure 9.7: Client Role attempting advisor mandate creation receives an immediate "Access Restricted" barrier.*

![Client Unauthorized Redirect](docs/visual-audit/workflow/12-client-unauthorized-redirect.png)
*Figure 9.8: Client attempting unauthorized access redirected safely with zero privilege escalation.*

---

## Act X: The Compliance Outcome & The Regulatory Audit

Two months later, the Securities and Exchange Board of India (SEBI) conducts a routine regulatory inspection of Prudent Wealth Advisory.

The SEBI inspecting officer requests statutory records for portfolio rebalancing transactions executed in October 2026, specifically selecting the ₹11.10 Lakh trade executed for Rohan Mehta.

Vikramaditya Roy, Chief Compliance Officer at Prudent Wealth Advisory, logs into the FinConsent **Compliance Hub** (`/requests`):

![Compliance Requests Scrutiny](docs/visual-audit/20-compliance-requests-scrutiny-desktop.png)
*Figure 10.1: Compliance Officer Vikramaditya Roy's Scrutiny Dashboard, displaying all practice advisory requests and audit logs.*

Vikramaditya opens the mandate detail view for Rohan's rebalance and clicks **"Compliance Dossier"**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLIANCE DOSSIER REGULATORY SUBMISSION                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ The modal renders the complete SEBI Regulation 19 Compliance Dossier Certificate:      │
│ • Full Chronological Audit Trail from formulation to consent.                          │
│ • Every Event's SHA-256 Hash Chain verifying zero retroactive alteration in ledger.    │
│ • Client IP Address (203.0.113.12) & Device User-Agent.                                │
│ • Synchronized Indian Standard Time (IST) execution timestamp.                         │
│ • Pre-Computed Capital Gains Breakdown under current statutory provisions.             │
│ • Embedded Section 63 BSA / Section 65B Electronic Certificate.                       │
│ • AWS Mumbai (ap-south-1) SEBI Cybersecurity Framework Data Residency Attestation.     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Vikramaditya clicks **"Export PDF Dossier"** and presents the printed, digitally fingerprinted dossier during the regulatory audit.

The compliance review proceeds smoothly:
1. Prior documented consent? **Documented with verifiable timestamp.**
2. Pre-trade tax impact visibility provided to client? **Documented.**
3. 5-year tamper-evident audit trail preserved? **Cryptographically chained in ledger.**
4. Electronic evidence aligned with current statutory law? **Certified under Section 63 BSA / Section 65B.**

The audit trail demonstrates comprehensive statutory adherence, significantly reducing compliance exposure and providing full transparency for the advisory practice.

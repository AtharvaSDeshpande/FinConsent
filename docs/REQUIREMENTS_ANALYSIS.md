# FinConsent Requirements Analysis & Regulatory-Capability Mapping

**Document Version:** 1.0  
**Date:** 13 October 2026  
**Scope:** Traceability Matrix Mapping Regulatory Mandates, User Needs, and Competitor Capabilities to Repository Implementation Evidence and Architectural Boundaries  

---

## 1. Regulatory Requirements Mapping

| Regulatory Mandate & Citation | Core Statutory Requirement | FinConsent Feature | Repository Evidence / Implementation | Gap / Qualification / Boundary |
|---|---|---|---|---|
| **SEBI IA Regulations, 2013 — Regulation 13** | Mandatory bilateral investment advisory agreement between RIA and client prior to advice. | Master Agreement Reference Tracking in Client Profile. | `src/features/clients/ClientsPage.jsx`, `server/routes/clients.js` | **Qualification:** FinConsent tracks client profile association and agreement metadata; the execution of the master bilateral contract occurs prior to transactional proposal dispatch. |
| **SEBI IA Regulations, 2013 — Regulation 17** | Risk profiling, asset allocation assessment, and investment suitability. | Portfolio Allocation Drift Visualization (Current vs Target Equity/Debt/Gold). | `src/features/mandate-builder/MandateNewPage.jsx`, `src/features/client-review/ClientReviewPage.jsx` | **Qualification:** Advisers input target allocations based on prior client risk profiles. The platform visualizes allocation restoration; it does not replace the adviser's professional risk evaluation. |
| **SEBI IA Regulations, 2013 — Regulation 19(1)(c) & (d)** | Mandatory maintenance of written advice/recommendations tendered and investment rationale. | Mandate Proposal Engine with required rationale text and ISIN-level trade baskets. | `server/routes/mandates.js`, `src/features/mandate-builder/AllocationForm.jsx` | **Evidence:** 17 Vitest suites verify mandate persistence with trade rationale and asset allocations. |
| **SEBI IA Regulations, 2013 — Regulation 19(1)(f) & (2)** | Maintenance of investor consent/acknowledgement records for a minimum of 5 years (1,825 days). | Immutable Proposal Acknowledgement & 5-Year Cloud Audit Retention. | `server/routes/audit.js`, `scripts/verify-backup-restore.mjs` (synthetic restore drill over 1,460 records) | **Boundary:** Proposal-specific acknowledgements are recorded; FinConsent does not execute market trades. |
| **SEBI IA Regulations, 2013 — Regulation 22 & 22B** | Non-discretionary advisory boundary; segregation of advisory and execution; fee-free implementation. | Non-Discretionary Proposal Governance Rail (No Broker Order Execution). | `src/features/legal-compliance/TermsOfServicePage.jsx`, `server/routes/publicMandates.js` | **Boundary:** Platform halts at locked proposal acknowledgement. Trade execution is conducted independently by the client or through non-discretionary broker terminals. |
| **Finance (No. 2) Act, 2024 — Section 111A** | STCG tax rate increased to 20% (+ 4% cess) on equity transfers from 23 July 2024. | Pre-Trade Capital Gains Engine (STCG computed @ 20%). | `src/features/tax-engine/taxCalculator.js`, `src/test/taxCalculator.test.js` | **Qualification:** Calculated on entered acquisition and sale values; does not account for complex loss set-offs without full profile. |
| **Finance (No. 2) Act, 2024 — Section 112A** | LTCG tax rate revised to 12.5% (+ 4% cess); annual aggregate exemption raised to ₹1,25,000. | Pre-Trade Capital Gains Engine (LTCG computed @ 12.5% above ₹1.25L). | `src/features/tax-engine/taxCalculator.js`, `src/test/taxCalculator.test.js` | **Qualification:** Assumes the annual aggregate ₹1,25,000 exemption is available for the mandate. |
| **Income-tax Act, 1961 — Section 208 & 234C** | Advance tax obligation if net tax >= ₹10,000; statutory quarterly installment schedule and Section 234C Proviso. | Quarterly Advance Tax Alert Schedule with Proviso Disclosure. | `src/features/tax-engine/AdvanceTaxSchedule.jsx`, `src/features/tax-engine/TaxBreakdownCard.jsx` | **Qualification:** Flags advance tax dates; explicitly notes Section 234C proviso relief if capital gains are paid in remaining installments. |
| **Bharatiya Sakshya Adhiniyam, 2023 — Section 63** | Admissibility of electronic records; structured metadata for Section 63(4) Certificate. | Append-Only Cryptographic Audit Dossier with Device IP, User-Agent, and SHA-256 Ledger. | `server/security/hashLedger.js`, `src/features/compliance-hub/ComplianceHubPage.jsx` | **Evidence:** SHA-256 forward-hash ledger verified across 17 test suites; captures RFC 5737 IP, User-Agent, timestamp. |
| **Digital Personal Data Protection Act, 2023 — Section 8** | Reasonable security safeguards; data minimization; confidential financial storage. | AES-256-GCM Dual-Envelope Encryption & PBKDF2 Password Gate. | `server/security/mandateCrypto.js`, `src/test/mandate_security_and_chat.test.js` | **Evidence:** Master key wrapping + client key derivation (PAN last 4 + DOB, 100k rounds in prod). Zero plaintext in database. |

---

## 2. User Needs & Personas Mapping

| Persona | Operational Need / Pain Point | FinConsent Feature | Repository Verification Evidence |
|---|---|---|---|
| **Suresh Narayanan**<br>*(Principal Officer, Prudent Wealth Advisory, SEBI Reg: INA000088921)* | • Eliminate compliance assembly overhead for routine rebalancing.<br>• Maintain contemporaneous 5-year records of rationale.<br>• Provide transparent pre-trade tax estimates to preserve client trust.<br>• Prevent accidental execution through clear 48-hour proposal lifecycles. | • Scoped RIA Dashboard with mandate formulation.<br>• Pre-trade Capital Gains Engine.<br>• In-app Clarification Chat Rail (distinct from consent).<br>• Emergency One-Click Revocation. | • `src/features/ria-dashboard/RiaDashboardPage.jsx`<br>• `src/features/mandate-builder/MandateNewPage.jsx`<br>• `src/test/api_regressions_and_contract_audit.test.js`<br>• Screenshots: `docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png` |
| **Rohan Mehta**<br>*(Affluent Client / Investor)* | • Review rebalancing proposals conveniently on smartphone without password fatigue.<br>• Understand exact estimated tax liability before acknowledging advice.<br>• Ask clarifying questions without confusing dialogue with consent.<br>• Review proposals in preferred language. | • Zero-login magic link with PAN+DOB gate.<br>• Mobile-optimized rebalance card with rupee tax preview.<br>• In-app discussion thread.<br>• 8 supported languages with English ASCII numerals. | • `src/features/client-review/ClientReviewPage.jsx`<br>• `src/features/client-review/MandateUnlockModal.jsx`<br>• `src/test/localization_i18n_l10n.test.js`<br>• Screenshots: `docs/visual-audit/mandate-security/07_mobile_unlock_screen.png` |
| **Compliance Officer**<br>*(Supervisory Role)* | • Read-only inspection access to all firm mandates.<br>• Verify unbroken cryptographic hash ledger.<br>• Export Section 63 BSA audit dossiers for SEBI/BASL inspection teams. | • Scoped Compliance Officer Scrutiny Hub.<br>• Section 63 BSA Compliance Dossier Export.<br>• Audit trail hash chain verification. | • `src/features/compliance-hub/ComplianceHubPage.jsx`<br>• `src/test/role_experience_and_access_control.test.js` |

---

## 3. Competitor & Adjacent Product Capability Mapping

| Capability | smallcase Publisher / Gateway | Broker Basket Orders (e.g. Zerodha) | FinConsent Architecture |
|---|---|---|---|
| **Target User Segment** | Research Analysts & Model Portfolio Managers | Self-directed retail investors & traders | Non-discretionary fee-only Registered Investment Advisers |
| **Primary Workflow Goal** | Distribute standardized baskets and execute trades via broker APIs. | Fast multi-leg order execution directly on exchange. | Governance, tax-impact transparency, and proposal acknowledgement records. |
| **Exchange Order Execution** | **Yes:** Routes orders to connected broker accounts via Gateway API. | **Yes:** Direct order placement on exchange order book. | **No:** Platform halts at proposal acknowledgement. Zero broker order routing. |
| **Pre-Trade Capital Gains Preview** | **No:** Displays asset weights and returns; no client-specific rupee tax preview. | **No:** Order execution only; tax calculations handled post-trade in tax P&L. | **Yes:** Pre-computes estimated STCG, LTCG, cess, and advance tax alert before client sign-off. |
| **Statutory Evidentiary Trail** | Order logs and transaction records from broker accounts. | Exchange trade books, contract notes, and order IDs. | Cryptographically chained SHA-256 audit ledger structured for BSA §63 admissibility. |
| **Clarification vs Consent Rail** | General social comments or external messaging. | None. | Structured in-app discussion rail legally separated from the OTP acknowledgement rail. |

---

## 4. Current Implementation vs. Roadmap Boundaries

| Dimension | Current Production Implementation (Verifiable) | Future Roadmap Milestone (Documented Scope) |
|---|---|---|
| **OTP Delivery Channel** | Dispatched via secure registered email and in-app display (cellular SMS decommissioned to avoid unencrypted carrier delivery). | Commercial cellular SMS via TRAI DLT aggregator and WhatsApp Business API delivery. |
| **Key Management Tier** | Environment-isolated `SERVER_MASTER_KEY` with AES-256-GCM dual wrapping and PBKDF2 (100k rounds in prod). | Dedicated Hardware Security Module (AWS CloudHSM / AWS KMS) for institutional tiering. |
| **Trade Execution** | Strict non-discretionary halt at proposal acknowledgement; client executes through broker. | Optional post-consent deep-link to broker basket order terminals (e.g., Zerodha Kite / smallcase Gateway). |
| **Tax Computation Depth** | Baseline equity capital gains engine under Finance Act 2024 (STCG 20%, LTCG 12.5%, ₹1.25L exemption, Sec 208/234C). | Comprehensive client tax profile integration (income tax slabs, surcharges, prior unabsorbed loss set-offs). |
| **Data Residency** | Configured for AWS Asia Pacific (Mumbai) `ap-south-1` residency to comply with Indian data sovereignty norms. | Multi-region active-active disaster recovery configuration within Indian territory. |

---

*This Requirements Analysis links verified implementation artifacts with statutory parameters and defines clear functional boundaries.*

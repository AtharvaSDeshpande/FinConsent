# FinConsent Source-of-Truth Matrix & Content Synchronization Register

**Version:** 1.0  
**Date:** 13 October 2026  
**Status:** Active Governance Standard  
**Purpose:** Canonical reference defining verified product claims, statutory grounds, operational boundaries, hypothesis classifications, and repository-wide file synchronization status.

---

## 1. Verified Product Claims vs. Prohibited Overstatements

| Topic / Claim Area | Prohibited Overstatement (Outdated / Misleading) | Verified Canonical Position (Authoritative Grounding) | Authoritative Source / Legal Grounding |
|---|---|---|---|
| **Platform Scope & Classification** | "Statutory Trade Authorization Engine", "Statutory Execution Platform", or implying FinConsent executes trades on Indian exchanges. | **"Advisory Proposal Consent & Tax-Impact Infrastructure"**. FinConsent is a governance, proposal review, estimated tax decision-support, and evidentiary record-keeping platform for SEBI Registered Investment Advisers (RIAs). It does NOT place orders or execute trades. | SEBI (Investment Advisers) Regulations, 2013, Reg 22 & 22B; SEBI Master Circular SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2023/158. |
| **Trade Execution** | "All RIAs execute client rebalancing trades", or "FinConsent executes the approved trades via broker APIs". | **Non-Discretionary Advisory Scope**. Under SEBI regulations, non-discretionary RIAs tender advice; actual order placement is executed independently by the client (or via client-authorized non-discretionary execution interfaces without advice-fee blending). FinConsent's workflow halts at immutable proposal acknowledgement. | SEBI IA Reg 22 (non-discretionary mandate); Reg 22B (implementation services without execution fees). |
| **Regulatory OTP Mandate** | "SEBI mandates OTP verification for every advisory rebalancing proposal". | **Voluntary Evidentiary Safeguard**. SEBI Reg 19 mandates maintaining advice, rationale, and client agreement/acknowledgement records for 5 years, but does NOT prescribe an SMS/email OTP mechanism. OTP is an evidentiary safeguard adopted by FinConsent to substantiate client consent under Section 63 of Bharatiya Sakshya Adhiniyam, 2023. | SEBI IA Reg 19(1)(d), 19(1)(f), 19(2); BSA 2023, Section 63. |
| **Advisory Agreement vs. Proposal Consent** | Treating the digital rebalancing approval as the SEBI Master Advisory Agreement. | **Clear Contractual Distinction**. The mandatory bilateral investment advisory agreement under SEBI Regulation 13 is executed between RIA and client at onboarding. FinConsent's digital workflow captures *proposal-specific acknowledgements* for rebalancing mandates under that pre-existing master agreement. | SEBI IA Reg 13 (client agreement requirement) vs Reg 19 (maintenance of advice records). |
| **Communication Legality (Email/WhatsApp)** | "Email and WhatsApp are illegal or non-compliant under SEBI rules". | **Administrative Inefficiency & Evidentiary Fragility**. Email and WhatsApp messages are legally discoverable records, but they fragment rationale, lack pre-trade tax calculations, suffer from delayed responses, and create manual compliance archiving overhead. | SEBI IA Reg 19(1); Indian Evidence Act / BSA Section 63 evidentiary requirements. |
| **Competitor Differentiation** | "smallcase and broker platforms have no security, ignore compliance, or cannot do basket orders". | **Objective Capability Distinction**. smallcase Publisher/Gateway and broker basket orders are designed for standardized model portfolios and direct exchange order execution. FinConsent specializes in customized non-discretionary RIA proposals, pre-trade rupee capital gains previews, in-app discussion logs, and BSA §63 audit trails without execution routing. | Public product documentation: smallcase Publisher & Gateway; Zerodha Basket Orders. |
| **Compliance Guarantees** | "FinConsent guarantees 100% SEBI compliance and immunity from audit penalties". | **Institutional Evidence Rails (No Guarantee)**. FinConsent provides structured audit trails, cryptographic hash chains, and standardized disclosures to assist RIAs with compliance, but cannot guarantee compliance or prevent regulatory penalties resulting from adviser misconduct or non-adherence. | General legal disclaimer and liability limitation. |
| **Capital Gains Tax Rates** | Outdated STCG 15% / LTCG 10% / ₹1,00,000 exemption figures. | **Finance (No. 2) Act, 2024 Rates**: STCG @ 20% (+ 4% cess = 20.8%), LTCG @ 12.5% (+ 4% cess = 13.0%) for gains exceeding ₹1,25,000 exemption. | Finance (No. 2) Act, 2024, Sections 111A, 112A; Income-tax Act, 1961. |
| **Advance Tax & Section 234C** | Claiming rebalancing gains immediately trigger unavoidable penal interest under Section 234C. | **Advance Tax Schedule with Proviso Relief**. Section 208 mandates advance tax if liability >= ₹10,000. Under the First Proviso to Section 234C(1), interest is NOT levied for shortfall due to capital gains if the full tax is paid in subsequent installments or before March 31. | Income-tax Act, 1961, Section 208 & First Proviso to Section 234C(1). |
| **Customer Pain Metrics** | Asserting as verified facts: "Average turnaround is 72 hours", "80% of RIAs use unencrypted WhatsApp", "RIAs spend 6 hours/week on manual audit collation". | **Explicitly Labeled Hypotheses**. These operational metrics represent working market hypotheses drawn from qualitative practice patterns. They are explicitly earmarked for validation during the 4-week pilot cohort (15 RIAs, 150 clients). | Documented pilot validation methodology. |

---

## 2. Customer Needs & Hypotheses Register

| Item ID | Claim / Hypothesis Statement | Status | Evidence / Validation Method |
|---|---|---|---|
| **HYP-01** | Non-discretionary RIAs face 48–72 hour delays securing client consent for rebalancing recommendations via unstructured email/messaging. | **HYPOTHESIS** | To be benchmarked during 4-week RIA pilot by measuring proposal creation to OTP timestamp. |
| **HYP-02** | Unexpected capital gains tax bills damage adviser-client trust, and pre-trade rupee tax estimates reduce client hesitation. | **HYPOTHESIS** | Pilot feedback survey: evaluate client satisfaction and comprehension of Tax Breakdown Card. |
| **HYP-03** | Compliance preparation for SEBI/BASL inspections requires 4–8 hours of manual collation per audit sample across disjointed emails and trade files. | **HYPOTHESIS** | Time-motion study comparing manual folder retrieval vs one-click BSA §63 Dossier export. |
| **HYP-04** | RIAs will pay ₹3,999/month for dedicated proposal governance and tax decision-support infrastructure. | **HYPOTHESIS (WTP)** | Willingness-to-pay (WTP) conversion metric at completion of 30-day pilot trial. |

---

## 3. Product Architecture & Operational Boundaries

| Architectural Dimension | Current Verifiable Capability | Explicit System Boundary / Out of Scope |
|---|---|---|
| **Trade Execution** | Dispatches rebalancing proposal, computes tax estimates, captures client OTP acknowledgement, freezes immutable record. | **OUT OF SCOPE:** Does NOT integrate broker execution APIs, place market orders, or handle funds. |
| **OTP Delivery** | Dispatches OTP via secure registered email and in-app display (with rate limiting and expiry). Cellular SMS decommissioned to avoid unencrypted carrier delivery. | Cellular SMS and WhatsApp messaging are on the future commercial roadmap via TRAI DLT aggregators. |
| **Cryptographic Storage** | Dual-envelope encryption: `SERVER_MASTER_KEY` wraps client keys derived via PBKDF2 (100k rounds in prod, salt, IV, auth tag). | Dedicated institutional HSM / AWS KMS is slated for institutional tiering. |
| **Evidentiary Integrity** | Append-only SHA-256 hash ledger linking previous entry hash, timestamp, event, client IP, and user agent. Formatted for BSA §63. | Does not replace the RIA Principal Officer's statutory testimony in formal court proceedings. |
| **Tax Estimation** | Baseline equity capital gains engine under Finance Act 2024 (STCG 20%, LTCG 12.5%, ₹1.25L exemption, Sec 208/234C). | Does not account for comprehensive multi-asset loss set-offs or individual income tax slabs unless fully input. |

---

## 4. Repository-Wide File Synchronization Matrix

| File Path | Description / Role | Current Alignment Status | Required Action / Verification |
|---|---|---|---|
| `docs/LITERATURE_REVIEW.md` | Authoritative literature review covering SEBI, Tax, Evidence, DPDP, Competitors. | **COMPLETED & VERIFIED** | Canonical reference authored with verified citations. |
| `docs/REQUIREMENTS_ANALYSIS.md` | Traceability matrix linking statutory rules, personas, and competitors to code. | **COMPLETED & VERIFIED** | Canonical reference authored with repository evidence. |
| `docs/SOURCE_OF_TRUTH_MATRIX.md` | Central matrix defining claims, boundaries, hypotheses, and file states. | **COMPLETED & VERIFIED** | This document. |
| `README.md` (root) | Primary project overview, architecture, security, and deployment documentation. | **PENDING ALIGNMENT** | Update positioning, remove "trade authorization/statutory execution" claims, label hypotheses, cite Finance Act 2024 & BSA §63, update pilot validation section. |
| `userjourney.md` (root) & `docs/userJourney.md` | End-to-end user journeys (Suresh, Rohan, Officer). | **PENDING ALIGNMENT** | Update both files synchronously: clarify non-discretionary scope, proposal acknowledgement vs master agreement, advance tax proviso, and label hypotheses. |
| `audit-log.md` (root) & `docs/audit-log.md` | Verification and audit logs across milestones. | **PENDING ALIGNMENT** | Update both files to note verified positioning, evidentiary boundary, and hypothesis labeling. |
| `docs/CONTRACTS.md` | API contracts and data models. | **PENDING ALIGNMENT** | Verify terminology reflects advisory rebalancing proposals and acknowledgements. |
| `docs/TRACEABILITY.md` | Requirements traceability register. | **PENDING ALIGNMENT** | Synchronize with `REQUIREMENTS_ANALYSIS.md`. |
| `site.spec.json` & `docs/spec.lock.json` | Project specification and site metadata. | **PENDING ALIGNMENT** | Update tagline, description, business goals to advisory proposal consent and tax-impact infrastructure. |
| `siteDetails.txt` | Machine-readable project overview and details. | **PENDING ALIGNMENT** | Update positioning, terminology, and tax rates. |
| `scripts/generate_presentation.py` | Python PPTX deck generator. | **PENDING ALIGNMENT** | Update slide copy: align titles, bullets, speaker notes, tax rates, BSA §63 citations, and hypothesis labels. |
| `scripts/generate_presentation_html.py` | HTML presentation deck generator. | **PENDING ALIGNMENT** | Update slide copy synchronously with python script. |
| `FinConsent-Client-Presentation.pptx` (root & docs) | Compiled 29-slide PowerPoint presentation. | **PENDING RECOMPILATION** | Recompile via `scripts/generate_presentation.py` after copy update. |
| `FinConsent-Client-Presentation.html` (root & docs) | Compiled 29-slide HTML deck. | **PENDING RECOMPILATION** | Recompile via `scripts/generate_presentation_html.py` after copy update. |
| `src/i18n/locales/*.js` (8 locales) | Multilingual UI translation dictionaries (en, hi, ta, bn, gu, de, ja, ko). | **PENDING ALIGNMENT** | Audit and update `otp_guarantee_text`, taglines, and regulatory descriptions across all 8 locales; preserve ASCII numbers. |
| `domains/magic_link.js` | Domain helper for magic link notifications and text. | **PENDING ALIGNMENT** | Verify copy consistency with proposal acknowledgement. |
| `src/features/legal-compliance/TermsOfServicePage.jsx` | Terms of service page. | **PENDING ALIGNMENT** | Verify explicit non-discretionary advisory and non-broker disclaimer. |
| `docs/runs/*` | Historical run logs. | **PRESERVED AS HISTORICAL RECORDS** | Kept intact; active run log tracks current alignment. |

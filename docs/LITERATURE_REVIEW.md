# FinConsent Authoritative Literature Review & Regulatory Foundation

**Document Version:** 1.0  
**Date of Review:** 13 October 2026  
**Scope:** Regulatory, Legal, Tax, Evidence, and Competitive Landscape for Indian Registered Investment Advisers (RIAs)  
**Status:** Canonical Reference Document  

---

## Executive Summary

FinConsent is engineered as a specialized governance, tax-impact transparency, and proposal-acknowledgement infrastructure platform for Indian SEBI-Registered Investment Advisers (RIAs) operating under non-discretionary advisory mandates.

To ensure that the platform's positioning, product claims, documentation, and user communications remain rigorous, defensible, and factually accurate, this literature review examines primary statutes, regulator circulars, tax laws, evidence rules, data protection statutes, and competitive systems. 

### Key Findings & Bound Rules
1. **Advisory Agreements vs. Proposal-Specific Acknowledgements**: Under Regulation 13 of the SEBI (Investment Advisers) Regulations, 2013, an RIA must execute a comprehensive bilateral client agreement prior to rendering advice. Proposal-specific acknowledgements (such as those recorded by FinConsent) operate at the level of individual periodic rebalancing recommendations, providing contemporaneous evidence under Regulation 19; they do not replace the master client agreement.
2. **Implementation Services vs. Trade Execution**: Under Regulation 22 and 22B, RIAs may offer implementation services through direct plans without fees or brokerage commissions. Non-discretionary RIAs do not execute market trades as brokers on exchange order books. FinConsent provides proposal presentation, tax impact estimation, and acknowledgement recording; it does **not** execute securities trades on exchange terminals.
3. **Authentication Standards**: SEBI Regulation 19 mandates maintaining verifiable records of advice, rationale, and client agreement for five years. However, **statute does not prescribe a specific technical mechanism (such as OTP or biometric validation) per individual rebalance**. FinConsent's OTP verification is an institutional cryptographic security feature chosen for tamper-resistance, not a universally mandated statutory rule.
4. **Communication Tools**: Email and documented electronic communications are not categorically banned by SEBI. However, informal, unarchived chats across consumer messaging platforms create substantial administrative overhead and evidentiary challenges when proving provenance and integrity under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA).
5. **Tax Preview Nature**: Pre-trade capital gains estimates under Finance (No. 2) Act, 2024 provide transparent decision-support visibility (STCG @ 20%, LTCG @ 12.5% above ₹1.25L exemption, 4% cess, Advance Tax alert under Sec 208 and Sec 234C proviso). They represent calculated estimates based on entered cost and market values and do not substitute for a Chartered Accountant's comprehensive tax computation.
6. **Market Hypotheses**: Customer pain points regarding review turnaround, spreadsheet fatigue, and willingness to pay ₹2,499/month represent **product hypotheses** subject to empirical pilot validation, rather than established empirical market facts.

---

## 1. Primary Regulatory Framework: SEBI Regulations & Guidance

### 1.1 SEBI (Investment Advisers) Regulations, 2013
- **Primary Citation:** Securities and Exchange Board of India (Investment Advisers) Regulations, 2013 [No. LAD-NRO/GN/2012-13/31/1778], published in Gazette of India on 21 January 2013, as amended up to 2024.
- **URL:** [https://www.sebi.gov.in/legal/regulations/jan-2013/sebi-investment-advisers-regulations-2013_24151.html](https://www.sebi.gov.in/legal/regulations/jan-2013/sebi-investment-advisers-regulations-2013_24151.html)
- **Key Provisions Analyzed:**
  - **Regulation 13 (Agreement between investment adviser and client):**
    - *Statutory Rule:* An investment adviser shall enter into an investment advisory agreement with its clients, incorporating mandatory terms and conditions specified by the Board.
    - *Finding for FinConsent:* The advisory agreement is a foundational bilateral contract executed at onboarding. FinConsent's rebalancing proposals represent transactional advice tendered under the auspices of this agreement. FinConsent must never confuse or equate proposal acknowledgements with the master advisory agreement.
  - **Regulation 15 (General responsibility):**
    - *Statutory Rule:* An investment adviser shall act in a fiduciary capacity towards its clients and maintain an arm's length relationship between its activities as an investment adviser and other activities.
    - *Finding for FinConsent:* FinConsent must reinforce the fiduciary obligation of the RIA by providing complete transparency of rationale and tax impact prior to client decisions.
  - **Regulation 17 (Risk profiling and suitability):**
    - *Statutory Rule:* Advisers must obtain adequate information from the client, assess risk capacity, and ensure that investment advice tendered is suitable for the client.
    - *Finding for FinConsent:* Mandate proposals capture and display target asset allocation drift and specific rationale, helping advisers document suitability alignment.
  - **Regulation 19 (Maintenance of records):**
    - *Statutory Rule:* (1) An investment adviser shall maintain the following records: (a) date-wise client risk profiling and assessment; (b) suitability assessment; (c) written advice or recommendation tendered; (d) rationale for arriving at investment advice; (e) agreements with clients; (f) investor consent / acknowledgement where required; (g) complaints received. (2) All records shall be maintained for a minimum period of **five years (1,825 days)**.
    - *Finding for FinConsent:* Regulation 19(1)(c), (d), and (f) provide the direct regulatory anchor for FinConsent. FinConsent serves as a structured repository and digital trail preserving recommendations, underlying rationale, and client acknowledgements for the required 5-year statutory period.
  - **Regulation 22 & 22B (Implementation services and execution boundaries):**
    - *Statutory Rule:* An investment adviser may provide implementation services to clients in the securities market, subject to the condition that no consideration, commission, or fee (direct or indirect) is received. Implementation must be through direct schemes, and the client cannot be under any obligation to avail implementation services through the adviser.
    - *Finding for FinConsent:* Non-discretionary RIAs do not act as stock brokers. They do not execute trades on exchange terminals. FinConsent records proposal approvals; trade execution is carried out independently by the client via their broker or via the RIA's permitted non-discretionary implementation workflows without brokerage fees.

### 1.2 SEBI Circulars & Master Circular
- **Primary Citations:**
  1. SEBI Circular `SEBI/HO/IMD/DF1/CIR/P/2020/182` (dated 23 September 2020): *Operating guidelines for Investment Advisers in terms of qualification, fee limits, client agreement, and record keeping.*
  2. SEBI Master Circular for Investment Advisers `SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2023/89` (dated 15 June 2023).
  3. SEBI Circular `SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2024/38` (dated 2 May 2024): *Periodic reporting through supervisory body (BASL).*
- **URL:** [https://www.sebi.gov.in/legal/master-circulars/jun-2023/master-circular-for-investment-advisers_72651.html](https://www.sebi.gov.in/legal/master-circulars/jun-2023/master-circular-for-investment-advisers_72651.html)
- **Key Findings:**
  - Client communications regarding advice must be auditable, sequential, and preserved.
  - Supervisory inspections by SEBI and BSE Administration & Supervision Limited (BASL) inspect sample client files for documented advice and rationale.
  - Fee limits: Maximum fee chargeable under AUA mode is 2.5% of AUA per family per annum; under fixed fee mode, maximum ₹1,25,000 per family per annum.

### 1.3 SEBI FAQs on Investment Advisers
- **Publication Date:** Updated periodically on SEBI official portal.
- **URL:** [https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doFaq=yes](https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doFaq=yes)
- **Key Findings:**
  - Prohibits discretionary management under an Investment Adviser registration. Discretionary portfolio management requires a Portfolio Management Services (PMS) license under SEBI (Portfolio Managers) Regulations, 2020, with a ₹5 Crore net worth requirement and minimum ₹50 Lakh client threshold.
  - Clarifies that non-discretionary advisers must seek client concurrence before recommendations are acted upon.

---

## 2. Indian Taxation & Finance (No. 2) Act, 2024

### 2.1 Statutory Capital Gains Amendments
- **Primary Citation:** The Finance (No. 2) Act, 2024 [Act No. 15 of 2024], received assent of President of India on 16 August 2024; amendments to Section 111A and Section 112A effective from 23 July 2024.
- **URL:** [https://incometaxindia.gov.in/pages/acts/finance-act-2024.aspx](https://incometaxindia.gov.in/pages/acts/finance-act-2024.aspx)
- **Provisions Analyzed:**
  - **Section 111A (Tax on short-term capital gains in certain cases):**
    - STCG on equity shares and units of equity-oriented mutual funds on which STT has been paid increased from 15% to **20%** for transfers effected on or after 23 July 2024.
  - **Section 112A (Tax on long-term capital gains in certain cases):**
    - LTCG on equity shares and units of equity-oriented mutual funds on which STT has been paid revised from 10% to **12.5%** for transfers effected on or after 23 July 2024.
    - Aggregate annual statutory exemption limit under Section 112A(2)(i) increased from ₹1,00,000 to **₹1,25,000**.
  - **Health and Education Cess:** 4% levied on total base income tax across all categories.
  - **Surcharge Cap:** Surcharge on capital gains taxable under Section 111A and Section 112A is capped at **15%** under both old and new regimes.

### 2.2 Advance Tax Provisions & Statutory Provisos
- **Primary Citation:** Income-tax Act, 1961, Sections 208, 211, 234B, and 234C.
- **Key Rules Analyzed:**
  - **Section 208 (Condition of liability to pay advance tax):** Advance tax is payable during a financial year in every case where the amount of such tax payable by the assessee during that year is **₹10,000 or more**.
  - **Section 211 / 234C Installment Calendar:**
    - 1st Installment (on or before 15 June): 15% of advance tax
    - 2nd Installment (on or before 15 September): 45% of advance tax
    - 3rd Installment (on or before 15 December): 75% of advance tax
    - 4th Installment (on or before 15 March): 100% of advance tax
    - Interest under Section 234C is charged at 1% per month for deferment of advance tax installments.
  - **First Proviso to Section 234C(1) (Statutory Capital Gains Relief):**
    - *Statutory Rule:* No interest under Section 234C shall be charged in respect of any shortfall in the payment of the tax due on returned income where such shortfall is on account of under-estimate or failure to estimate the amount of capital gains, provided the assessee pays the amount of tax payable in respect of such income as part of the remaining installments of advance tax, or where no such installment is due, pays the same by the 31st day of March of the financial year.
    - *Implication for FinConsent:* The advance tax schedule displayed in FinConsent provides valuable planning transparency. However, FinConsent must explicitly note the Section 234C proviso: penal interest is relieved if the investor pays the resulting liability in subsequent quarterly installments following the actual trade realization.

---

## 3. Electronic Records, Authentication & Evidence Law

### 3.1 Bharatiya Sakshya Adhiniyam, 2023 (BSA) & Indian Evidence Act, 1872
- **Primary Citation:** Bharatiya Sakshya Adhiniyam, 2023 [Act No. 47 of 2023], notified in Gazette of India on 25 December 2023, brought into force on 1 July 2024, repealing the Indian Evidence Act, 1872 (1 of 1872).
- **Provisions Analyzed:**
  - **Section 63 (Admissibility of electronic records):**
    - Directly corresponds to and replaces erstwhile Section 65B of the Indian Evidence Act, 1872.
    - Sets forth conditions for electronic records to be deemed documents admissible in legal proceedings without further proof of production of original:
      1. Computer output produced by computer during period when it was regularly used to store or process information.
      2. Regular feeding of information in the ordinary course of activities.
      3. Computer operating properly, or periods of non-operation did not affect electronic record accuracy.
      4. Reproduction of information supplied to the computer in the ordinary course.
    - **Section 63(4) Certificate:** Requires a certificate identifying the electronic record, describing the manner of production, certifying the computer conditions, and signed by a person occupying a responsible official position in relation to the operation of the device or management of activities.
  - *Implication for FinConsent:* FinConsent generates an immutable audit receipt capturing timestamp, client device metadata, mandate UUID, masked identifiers, and SHA-256 hash chaining. This structured receipt is designed to supply the technical data attributes required to prepare a compliant Section 63 BSA certificate. FinConsent itself is the technical record producer; the signing of the legal certificate remains with the responsible RIA compliance officer.

### 3.2 Information Technology Act, 2000
- **Key Sections:** Section 4 (legal recognition of electronic records), Section 10A (validity of contracts formed through electronic means).
- **Authentication Reality:** The law recognizes electronic agreements and electronic consent. However, **no Indian statute mandates that every portfolio rebalance must be verified using a 6-digit OTP**. FinConsent implements OTP verification as an institutional product safeguard to prevent accidental submissions and authenticate the recipient, rather than as a statutory mandate.

---

## 4. Data Protection & Privacy Framework

### 4.1 Digital Personal Data Protection Act, 2023 (DPDP Act)
- **Primary Citation:** Digital Personal Data Protection Act, 2023 [Act No. 22 of 2023], notified in Gazette on 11 August 2023.
- **Provisions Analyzed:**
  - **Section 5 (Notice) & Section 6 (Consent):** Data fiduciaries must provide clear notice detailing purpose of processing and obtain informed consent.
  - **Section 8 (General obligations of Data Fiduciary):** Obligation to implement reasonable security safeguards to prevent personal data breaches; data minimization; storage limitation (retention only as long as necessary for specified purpose or legal compliance).
  - *Harmonization with SEBI Reg 19:* While DPDP encourages data deletion after purpose fulfillment, Section 8(7) explicitly carves out retention required under any law in force. SEBI Regulation 19 mandates 5-year retention. FinConsent harmonizes these standards by retaining audit logs for the statutory 5-year period while strictly protecting client data via AES-256-GCM encryption at rest and TLS 1.3 in transit.

---

## 5. Competitive & Adjacent Product Landscape

To establish an evidence-based and defensible product positioning, FinConsent is benchmarked against recognized tools in the Indian ecosystem:

| Dimension | FinConsent | smallcase Technologies (Publisher / Gateway) | Broker Basket Orders (Zerodha / Angel One) | Legacy Workflow (Email / Chat) |
|---|---|---|---|---|
| **Primary Target User** | SEBI Registered Investment Advisers (Fee-Only / Non-Discretionary) | Research Analysts (RAs) & Investment Advisers (Model Portfolio Creators) | Retail Investors, Traders & Sub-Brokers | Independent Advisers |
| **Portfolio Architecture** | Bespoke, custom client portfolios with individualized drift & basis | Standardized Model Portfolios (baskets of 10–30 stocks/ETFs) | Ad-hoc user-created multi-leg order baskets | Customized spreadsheets |
| **Trade Execution** | **No trade execution.** Non-discretionary proposal acknowledgement and governance. | **Direct broker execution.** Order basket routed to broker trading account via Gateway API. | **Direct broker execution.** Traded directly on exchange order book. | Client places trades manually on their broker terminal. |
| **Pre-Trade Tax Impact** | **Integrated pre-trade preview.** Estimated STCG, LTCG, 4% cess, Advance Tax alert. | General rebalance weighting; no individualized pre-trade tax liability computation. | None. Order execution only. | Manual spreadsheet computation by adviser, if any. |
| **Statutory Evidentiary Trail** | Append-only SHA-256 forward-hash ledger structured for BSA §63 compliance. | Transaction logs of orders dispatched through connected broking accounts. | Exchange order confirmation numbers and contract notes. | Unorganized email inbox or exported chat transcripts. |
| **Client Review Interaction** | Zero-login mobile web view with PAN+DOB gate, tax breakdown, and in-app clarification chat. | Deep-linked mobile app/web view prompting broker credential login. | Native broker application login. | File attachment in email or text message. |
| **Pricing / Business Model** | Flat software subscription: ₹2,499/month (Pro Practice) with zero AUM bps. | Revenue share / bps on AUM or fee subscription split on platform. | Standard broker brokerage (e.g. ₹0 equity delivery, ₹20 intraday/F&O). | Zero additional software cost; high administrative time cost. |

### Differentiator Summary
- **Execution Boundary:** smallcase excels at automated order routing to brokers for standardized model portfolios. FinConsent does not compete as a broker routing tool; it addresses the governance gap for advisers creating customized rebalancing proposals who require pre-trade tax visibility, discussion audit trails, and Section 63 BSA compliance receipts.
- **Evidence Quality:** While broker tools record order execution, they do not record the underlying investment rationale or the non-discretionary advisory consultation process mandated by SEBI Regulation 19.

---

## 6. Unvalidated Market Hypotheses & Customer Discovery Agenda

The FinConsent documentation previously cited operational statistics (such as 72-hour turnaround baselines and 80% informal communication usage). A rigorous literature review reveals that **these are unvalidated product hypotheses rather than published empirical benchmarks**.

FinConsent formally documents these as hypotheses to be evaluated during customer discovery:

| Hypothesis ID | Statement | Current Evidence State | Required Validation Mechanism |
|---|---|---|---|
| **HYP-01: Turnaround Friction** | Non-discretionary RIAs experience 48–72 hour delays in obtaining client approval for rebalance proposals sent via email/PDF. | Qualitative feedback from advisory practitioners; no industry-wide survey published. | Measure time-to-acknowledgement across 100 live pilot mandates with 10–25 practicing RIAs. |
| **HYP-02: Tax Surprise Impact** | Clients frequently experience friction or surprise tax bills following rebalancing due to lack of pre-trade capital gains visibility under Finance Act 2024. | Anecdotal tax dispute reports; high statutory tax rates (20% STCG). | Survey pilot investors on whether pre-trade rupee tax estimates influenced their acknowledgement decisions. |
| **HYP-03: Evidentiary Audit Burden** | Assembling email threads and screenshots during BASL/SEBI routine inspections requires 10+ hours per quarter per RIA. | Inspection checklists require advice + rationale records; assembly difficulty is reported. | Interview Compliance Officers and RIA Principal Officers on actual audit preparation time with and without FinConsent. |
| **HYP-04: Willingness to Pay** | Independent fee-only RIAs find positive ROI in paying ₹2,499/month (+ GST) for a dedicated proposal governance and tax visibility tool. | Competitive SaaS pricing benchmark; commercial willingness unverified. | Conversion rate and feedback during the 4-week structured pilot program. |

---

## 7. Limitations & Open Questions

1. **Broker Integration Roadmap:** While FinConsent intentionally halts at proposal acknowledgement to maintain clear regulatory separation, feedback from clients indicates interest in post-acknowledgement deep-links to broker basket orders (e.g., Zerodha Kite API / smallcase Gateway). This represents an architectural roadmap evaluation item for future releases.
2. **Tax Engine Assumptions:** The tax computation assumes the ₹1,25,000 annual LTCG exemption is fully available across the portfolio and does not query an external tax filing repository for client-level unabsorbed capital losses or income tax slabs. This assumption must always be clearly disclosed to clients.
3. **TRAI DLT Commercial Gateways:** Current demonstration deployments deliver verification OTPs via secure email and in-app alerts because commercial SMS delivery requires TRAI DLT registration and approved template headers. Transitioning to commercial SMS remains a production operational task.

---

*This Literature Review serves as the foundational source of truth for all technical documentation, website copy, client presentations, and translation assets across the FinConsent repository.*

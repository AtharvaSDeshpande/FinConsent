#!/usr/bin/env node
/**
 * FinConsent Master Architecture & Workflow Diagram Generator
 * Compiles all 18 institutional WealthTech diagrams using @hpcc-js/wasm-graphviz.
 * Rasterizes crisp high-resolution 300-DPI equivalent PNGs via headless Edge/Chromium.
 * Outputs .dot, .svg, and .png to:
 *   - docs/diagrams/
 *   - diagrams/
 *   - docs/visual-audit/diagrams/
 */

import { Graphviz } from "@hpcc-js/wasm-graphviz";
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(BASE_DIR, "docs");
const DIAGRAMS_DIR = path.join(DOCS_DIR, "diagrams");
const ROOT_DIAGRAMS_DIR = path.join(BASE_DIR, "diagrams");
const AUDIT_DIAGRAMS_DIR = path.join(DOCS_DIR, "visual-audit", "diagrams");

for (const d of [DIAGRAMS_DIR, ROOT_DIAGRAMS_DIR, AUDIT_DIAGRAMS_DIR]) {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
}

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
];

function getBrowserExecutable() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("No compatible Chromium/Edge browser found for high-res PNG rendering.");
}

// Shared DOT header with >= 12pt fonts
const SHARED_STYLE_DOT = `
    bgcolor="#FFFFFF";
    fontname="Helvetica,Arial,sans-serif";
    fontsize=14;
    pad="0.25,0.25";
    nodesep=0.4;
    ranksep=0.45;
    splines=ortho;

    node [
        fontname="Helvetica,Arial,sans-serif",
        fontsize=12,
        shape=box,
        style="rounded,filled",
        fillcolor="#F8FAFC",
        color="#CBD5E1",
        penwidth=1.5,
        margin="0.15,0.12"
    ];

    edge [
        fontname="Helvetica,Arial,sans-serif",
        fontsize=12,
        color="#64748B",
        fontcolor="#334155",
        penwidth=1.5
    ];
`;

fs.writeFileSync(path.join(DIAGRAMS_DIR, "shared_style.dot"), SHARED_STYLE_DOT.trim(), "utf-8");

const DIAGRAMS = {
  // Slide 2 & 4: Cause -> Effect Map
  "cause-effect-map": `digraph CauseEffectMap {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    subgraph cluster_cause {
        label="Informal Channel Practice";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=14;
        fontcolor="#E11D48";
        color="#FDA4AF";
        style="rounded,dashed";
        fillcolor="#FFF1F2";

        c1 [label="Informal Acknowledgements\\nWhatsApp / Email / Calls", color="#E11D48", fontcolor="#9F1239", fillcolor="#FFE4E6"];
        c2 [label="No Pre-Trade Tax Visibility\\nBlindsided by Capital Gains", color="#D97706", fontcolor="#92400E", fillcolor="#FEF3C7"];
        c3 [label="Fragmented Communications\\nSpreadsheets & Lost Screenshots", color="#64748B", fontcolor="#334155", fillcolor="#F1F5F9"];
    }

    subgraph cluster_impact {
        label="Direct Operational & Regulatory Impact";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=14;
        fontcolor="#0A192F";
        color="#CBD5E1";
        style="rounded,dashed";
        fillcolor="#F8FAFC";

        i1 [label="SEBI Reg 19 Non-Compliance\\nContemporaneous Rationale Missing", color="#E11D48", fontcolor="#9F1239"];
        i2 [label="Advance Tax Shortfalls\\nSec 208 & 234C (Relief via Proviso)", color="#D97706", fontcolor="#92400E"];
        i3 [label="Inadmissible Evidence\\nFails Section 63 BSA Standard", color="#4F46E5", fontcolor="#312E81"];
    }

    subgraph cluster_consequence {
        label="Statutory & Business Liability";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=14;
        fontcolor="#E11D48";
        color="#E11D48";
        style="rounded,filled";
        fillcolor="#FFF1F2";

        end1 [label="Discretionary Execution Disputes\\nClient Misunderstandings & Penalties", color="#E11D48", fontcolor="#FFFFFF", fillcolor="#E11D48"];
    }

    c1 -> i1 [label="Audit Review"];
    c2 -> i2 [label="Quarterly Due"];
    c3 -> i3 [label="Legal Challenge"];
    i1 -> end1 [color="#E11D48", penwidth=2.0];
    i2 -> end1 [color="#E11D48", penwidth=2.0];
    i3 -> end1 [color="#E11D48", penwidth=2.0];
}`,

  // Slide 5: Four-Pillar FinConsent Hub
  "four-pillar-hub": `digraph FourPillarHub {
    ${SHARED_STYLE_DOT}
    rankdir=TB;

    hub [label="FINCONSENT CORE PLATFORM\\nStatutory WealthTech Infrastructure\\nSEBI Reg 19  |  BSA 2023 Sec 63  |  Finance Act 2024",
         shape=box, style="rounded,filled", fillcolor="#0A192F", color="#0A192F", fontcolor="#FFFFFF", fontsize=15, penwidth=2.5, margin="0.3,0.2"];

    p1 [label="1. Pre-Trade Tax Transparency\\nFinance Act 2024 Tax Engine\\n• STCG 20.0%  |  LTCG 12.5%\\n• Sec 208 / 234C Advance Tax Alerts",
        color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E", fontsize=13];

    p2 [label="2. Dual-Envelope Encryption\\nCryptographic Protection at Rest\\n• AES-256-GCM Unique DEK\\n• Server Key + Client PBKDF2 Wrap",
        color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81", fontsize=13];

    p3 [label="3. Mobile Consent Rail\\nPassword-Protected Delivery\\n• Last-4 PAN + DOB Convenience Gate\\n• 6-Digit Single-Use OTP (5m TTL)",
        color="#059669", fillcolor="#ECFDF5", fontcolor="#065F46", fontsize=13];

    p4 [label="4. Section 63 BSA Audit Ledger\\nTamper-Evident Evidence Trail\\n• Append-Only SHA-256 Hash Chain\\n• IP, IST Time & Signed Certificate",
        color="#0A192F", fillcolor="#F1F5F9", fontcolor="#0A192F", fontsize=13];

    hub -> p1 [color="#D97706", penwidth=2.0];
    hub -> p2 [color="#4F46E5", penwidth=2.0];
    hub -> p3 [color="#059669", penwidth=2.0];
    hub -> p4 [color="#0A192F", penwidth=2.0];
}`,

  // Slide 6: Actor Lanes Timeline
  "actor-lanes": `digraph ActorLanes {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    subgraph cluster_ria {
        label="Advisor Lane (RIA: Suresh Narayanan)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#0A192F";
        color="#94A3B8";
        style="rounded,dashed";
        fillcolor="#F8FAFC";

        a1 [label="1. Detects Drift\\nIdentifies 15% Equity Excess", color="#0A192F"];
        a2 [label="2. Formulates Baskets\\nSelects Sell & Buy Assets", color="#0A192F"];
        a3 [label="3. Dispatches Proposal\\nIssues 48h Cutoff Window", color="#4F46E5", fontcolor="#312E81", fillcolor="#EEF2FF"];
        a4 [label="6. Answers Inquiries\\nExplains Tax in Chat Rail", color="#0A192F"];
    }

    subgraph cluster_platform {
        label="FinConsent Engine Lane (Platform)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#4F46E5";
        color="#818CF8";
        style="rounded,dashed";
        fillcolor="#EEF2FF";

        p1 [label="Computes Tax Liability\\n₹11,440 Capital Gains Est.", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E"];
        p2 [label="Derives Cryptographic Keys\\nWraps DEK (Server & Client)", color="#4F46E5", fontcolor="#312E81"];
        p3 [label="Issues 6-Digit OTP\\nEnforces 5m Timer & 3 Attempts", color="#059669", fontcolor="#065F46", fillcolor="#ECFDF5"];
        p4 [label="Burns Token & Chains Hash\\nGenerates BSA Sec 63 Dossier", color="#0A192F", fillcolor="#E2E8F0", fontcolor="#0A192F"];
    }

    subgraph cluster_client {
        label="Client Lane (HNI: Rohan Mehta)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#059669";
        color="#6EE7B7";
        style="rounded,dashed";
        fillcolor="#ECFDF5";

        c1 [label="4. Unlocks via Password\\nInputs PAN Last 4 + DOB", color="#059669"];
        c2 [label="5. Reviews Proposal\\nReads Rationale & Drift", color="#059669"];
        c3 [label="7. Checks Declarations\\nEnters Verified 6-Digit OTP", color="#059669", fontcolor="#065F46", fillcolor="#A7F3D0"];
        c4 [label="8. Receives Receipt\\nProceeds to Broker Execution", color="#059669"];
    }

    a1 -> a2 -> a3;
    a3 -> p1 -> p2 -> c1;
    c1 -> c2;
    c2 -> a4 [label="Asks Question"];
    a4 -> c2 [label="Clarification"];
    c2 -> c3;
    c3 -> p3 -> p4 -> c4;
}`,

  // Slide 7a: Main Journey Flow
  "main-journey-flow": `digraph MainJourneyFlow {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    s_draft [label="DRAFT\\nAdvisor Prepares Baskets\\n& Advisory Rationale", color="#64748B", fillcolor="#F1F5F9"];
    s_sent  [label="SENT\\nEncrypted Magic Link\\nDispatched with 48h Window", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    s_view  [label="VIEWED / IN REVIEW\\nClient Unlocks via PAN+DOB\\nFull Tax & Baskets Revealed", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E"];
    s_cons  [label="CONSENTED\\n3 Declarations Accepted\\n6-Digit OTP Verified", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.5];
    s_lock  [label="EVIDENCE LOCKED\\nSHA-256 Chained Hash\\nSec 63 BSA Receipt Emitted", color="#0A192F", fillcolor="#E2E8F0", fontcolor="#0A192F", penwidth=2.0];

    s_draft -> s_sent [label="Dispatch"];
    s_sent -> s_view [label="Password Unlock"];
    s_view -> s_cons [label="OTP Verified"];
    s_cons -> s_lock [label="Atomic Seal"];
}`,

  // Slide 7b: Exception & Terminal States
  "exception-flows": `digraph ExceptionFlows {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    s_active [label="ACTIVE MANDATE\\n(Sent or In Review State)", color="#4F46E5", fillcolor="#EEF2FF"];

    subgraph cluster_exceptions {
        label="Terminal Exception Boundaries";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#E11D48";
        color="#FDA4AF";
        style="rounded,dashed";
        fillcolor="#FFF1F2";

        e_exp  [label="EXPIRED\\n48-Hour Cutoff Window Elapsed\\nLink Inaccessible (HTTP 410)", color="#64748B", fillcolor="#E2E8F0"];
        e_rev  [label="REVOKED\\nAdvisor Issues Emergency Cancel\\nMarket Drift / Retracted Advice", color="#E11D48", fillcolor="#FEE2E2", fontcolor="#9F1239"];
        e_lock [label="LOCKED OUT\\n3 Failed OTP Attempts Exceeded\\nToken Burned Immediately (HTTP 429)", color="#E11D48", fillcolor="#FEE2E2", fontcolor="#9F1239"];
    }

    s_active -> e_exp  [label="Cutoff >= 48h", color="#64748B"];
    s_active -> e_rev  [label="RIA Revokes", color="#E11D48"];
    s_active -> e_lock [label="3 OTP Failures", color="#E11D48"];
}`,

  // Slide 10: Unlock Sequence Diagram
  "unlock-sequence": `digraph UnlockSequence {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    step1 [label="1. Magic Link Opened\\n256-bit Scoped URL\\n(/m/:token)", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    step2 [label="2. Client Password Gate\\nLast-4 PAN + DOB\\n(123414081978)", color="#0A192F"];
    step3 [label="3. PBKDF2 Key Derivation\\n100,000 Rounds SHA-256\\nDerives 256-bit Client KEK", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E"];
    step4 [label="4. DEK Unwrapped\\nAES-256-GCM Unwraps\\nClient Data Encryption Key", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    step5 [label="5. Plaintext Revealed\\nPortfolio Drift, Tax Est.,\\n& Trade Baskets Displayed", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.0];

    step1 -> step2 -> step3 -> step4 -> step5;
}`,

  // Slide 11: Multi-Tenant Isolation
  "tenant-isolation": `digraph TenantIsolation {
    ${SHARED_STYLE_DOT}
    rankdir=TB;

    subgraph cluster_firmA {
        label="Tenant A: Prudent Wealth Advisory (Suresh)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#0A192F";
        color="#818CF8";
        style="rounded,filled";
        fillcolor="#F8FAFC";

        userA [label="Advisor Suresh (RIA A)\\nToken: firmName='Prudent Wealth'", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
        dataA [label="Mandate: man_rohan_1\\nOwner: Prudent Wealth Advisory", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46"];
    }

    subgraph cluster_firmB {
        label="Tenant B: Artha Capital Advisors (Vikram)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#0A192F";
        color="#CBD5E1";
        style="rounded,filled";
        fillcolor="#F8FAFC";

        userB [label="Advisor Vikram (RIA B)\\nToken: firmName='Artha Capital'", color="#64748B", fillcolor="#F1F5F9"];
        dataB [label="Mandate: man_artha_42\\nOwner: Artha Capital Advisors", color="#64748B", fillcolor="#F1F5F9"];
    }

    guard [label="EXPRESS TENANCY SCOPING MIDDLEWARE\\nVerify: req.user.firmName === resource.firmName",
           shape=box, style="rounded,filled", fillcolor="#0A192F", color="#0A192F", fontcolor="#FFFFFF", fontsize=13];

    userA -> guard [label="Authorized Query", color="#059669"];
    guard -> dataA [label="Access Granted (200 OK)", color="#059669", penwidth=2.0];

    userA -> guard [label="Tampered ID Access to man_artha_42", color="#E11D48", style="dashed"];
    guard -> dataB [label="BLOCKED: 403 FORBIDDEN\\nZero Data Disclosure", color="#E11D48", style="dashed", penwidth=2.5, fontcolor="#E11D48"];
}`,

  // Slide 12: Dual-Envelope Encryption Architecture
  "envelope-encryption": `digraph EnvelopeEncryption {
    ${SHARED_STYLE_DOT}
    rankdir=TB;

    plain [label="PLAINTEXT MANDATE DATA\\nClient Holdings, PAN, Tax Liability & Trade Baskets",
           color="#0A192F", fillcolor="#F1F5F9", fontcolor="#0A192F", fontsize=13];

    dek [label="UNIQUE DATA ENCRYPTION KEY (DEK)\\nGenerated via CSPRNG (256-bit Random Key)",
         color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E", fontsize=13, penwidth=2.0];

    cipher [label="ENCRYPTED PAYLOAD AT REST (AES-256-GCM)\\nCiphertext + 12-byte IV + 16-byte Authentication Tag",
            color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", fontsize=13, penwidth=2.0];

    plain -> cipher [label="AES-256-GCM Encrypt", color="#059669", penwidth=2.0];
    dek -> cipher [label="Key Input", color="#D97706"];

    subgraph cluster_dual_wrapping {
        label="Dual Key Wrapping Architecture (Zero Plaintext Stored in Database)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#4F46E5";
        color="#818CF8";
        style="rounded,dashed";
        fillcolor="#F8FAFC";

        wrap_server [label="SERVER-WRAPPED DEK\\nEncrypted with isolated SERVER_MASTER_KEY\\n(For RIA Dashboard Management)",
                     color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];

        wrap_client [label="CLIENT-WRAPPED DEK\\nEncrypted with PBKDF2(PAN_last_4 + DOB)\\n(For Mobile Client Password Unlock)",
                     color="#059669", fillcolor="#ECFDF5", fontcolor="#065F46"];
    }

    dek -> wrap_server [label="Server Master Key Wrap", color="#4F46E5"];
    dek -> wrap_client [label="Client PBKDF2 Wrap", color="#059669"];
}`,

  // Slide 13: OTP Verification & Attempt Lockout State Machine
  "otp-attempts": `digraph OtpAttempts {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    req [label="OTP REQUESTED\\nCSPRNG 6-Digit Code\\n5m TTL | Email & In-App", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    att1 [label="ATTEMPT 1\\nIncorrect Code Entered", color="#D97706", fillcolor="#FEF3C7"];
    att2 [label="ATTEMPT 2\\nIncorrect Code Entered", color="#D97706", fillcolor="#FEF3C7"];
    att3 [label="ATTEMPT 3 (FINAL)\\n3rd Consecutive Failure", color="#E11D48", fillcolor="#FEE2E2", fontcolor="#9F1239"];

    success [label="VERIFIED & BURNED\\nSingle-Use Atomic Revocation\\nProceeds to Evidence Lock", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.5];
    locked [label="LOCKED OUT (HTTP 429)\\nToken Immediately Burned\\nClient Must Contact Advisor", color="#E11D48", fillcolor="#E11D48", fontcolor="#FFFFFF", penwidth=2.5];

    req -> success [label="Valid 6 Digits", color="#059669", penwidth=2.0];
    req -> att1 [label="Invalid Code", color="#D97706"];
    att1 -> success [label="Valid 6 Digits", color="#059669"];
    att1 -> att2 [label="Invalid Code", color="#D97706"];
    att2 -> success [label="Valid 6 Digits", color="#059669"];
    att2 -> att3 [label="Invalid Code", color="#E11D48"];
    att3 -> locked [label="Permanent Lock", color="#E11D48", penwidth=2.5];
}`,

  // Slide 14: Forward SHA-256 Hash Chain
  "hash-chain": `digraph HashChain {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    b1 [label="LOG RECORD N-1\\nEvent: MANDATE_VIEWED\\nTimestamp: 10:14:22 IST\\nHash: a3b8...9f12", color="#64748B", fillcolor="#F1F5F9"];
    b2 [label="LOG RECORD N\\nEvent: MANDATE_CONSENTED\\nTimestamp: 10:15:08 IST\\nPayload: Rohan Mehta OTP\\nHash: 7c4e...d103", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.0];
    b3 [label="LOG RECORD N+1\\nEvent: DOSSIER_EXPORTED\\nTimestamp: 10:15:10 IST\\nHash: e82f...39aa", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];

    b1 -> b2 [label="SHA256(b1.Hash + Record N)", color="#059669", penwidth=2.0];
    b2 -> b3 [label="SHA256(b2.Hash + Record N+1)", color="#4F46E5", penwidth=2.0];
}`,

  // Slide 16: Separate Chat vs Consent Lanes
  "chat-vs-consent": `digraph ChatVsConsent {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    start [label="Client In Review\\nMandate Unlocked on Mobile", color="#0A192F", fillcolor="#F1F5F9"];

    subgraph cluster_chat_lane {
        label="Clarification Chat Rail (Discussion != Consent)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#D97706";
        color="#FDE68A";
        style="rounded,dashed";
        fillcolor="#FEF3C7";

        c_msg [label="Rohan: 'Why sell Tata Motors now?'\\nCommitted to Audit Log", color="#D97706", fontcolor="#92400E"];
        c_ans [label="Suresh: 'Rebalancing 15% equity excess'\\nCommitted to Audit Log", color="#D97706", fontcolor="#92400E"];
        c_stop [label="STAYS 'IN REVIEW'\\nChat CANNOT authorize rebalance\\n(Broker Execution Required)", color="#E11D48", fontcolor="#9F1239", fillcolor="#FEE2E2"];
    }

    subgraph cluster_consent_lane {
        label="Statutory Consent Rail (SEBI Reg 19 / BSA Sec 63)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#059669";
        color="#A7F3D0";
        style="rounded,dashed";
        fillcolor="#ECFDF5";

        auth_check [label="Active Check of 3 Declarations\\n• Reg 17/19 Informed Consent\\n• Capital Gains Tax Acceptance\\n• Sec 63 BSA Electronic Record", color="#059669", fontcolor="#065F46"];
        auth_otp   [label="Enter 6-Digit Mobile OTP\\nCSPRNG Verified & Burned", color="#059669", fontcolor="#065F46"];
        auth_done  [label="CONSENTED STATE\\nImmutable Cryptographic Seal", color="#059669", fillcolor="#059669", fontcolor="#FFFFFF", penwidth=2.5];
    }

    start -> c_msg [color="#D97706"];
    c_msg -> c_ans -> c_stop;

    start -> auth_check [color="#059669", penwidth=2.0];
    auth_check -> auth_otp -> auth_done [color="#059669", penwidth=2.0];
}`,

  // Slide 17: Advance Tax Timeline
  "advance-tax-timeline": `digraph AdvanceTaxTimeline {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    inst1 [label="1st Installment (15%)\\nOn or before 15th June\\nInitial Planning Baseline", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    inst2 [label="2nd Installment (45%)\\nOn or before 15th September\\nMid-Year Rebalancing", color="#059669", fillcolor="#ECFDF5", fontcolor="#065F46"];
    inst3 [label="3rd Installment (75%)\\nOn or before 15th December\\nPrimary Capital Gains Due", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E", penwidth=2.0];
    inst4 [label="4th Installment (100%)\\nOn or before 15th March\\nYear-End Reconciliation", color="#0A192F", fillcolor="#F1F5F9", fontcolor="#0A192F"];

    inst1 -> inst2 -> inst3 -> inst4 [color="#64748B", penwidth=2.0];
}`,

  // Slide 20: Threat -> Defence Mapping
  "threat-defence-mapping": `digraph ThreatDefenceMapping {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    subgraph cluster_threats {
        label="Threat Vectors";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#E11D48";
        color="#FDA4AF";
        style="rounded,dashed";
        fillcolor="#FFF1F2";

        t1 [label="Credential Stuffing & OTP Brute-Force", color="#E11D48", fontcolor="#9F1239"];
        t2 [label="Cross-Tenant IDOR & Privilege Escalation", color="#E11D48", fontcolor="#9F1239"];
        t3 [label="Replay Attacks & Expired Link Re-use", color="#E11D48", fontcolor="#9F1239"];
        t4 [label="Database Breaches & Token Leakage", color="#E11D48", fontcolor="#9F1239"];
    }

    subgraph cluster_defences {
        label="FinConsent Hardened Defences";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#059669";
        color="#A7F3D0";
        style="rounded,dashed";
        fillcolor="#ECFDF5";

        d1 [label="Sliding Window Rate Limit + 3 OTP Lockout (HTTP 429)", color="#059669", fontcolor="#065F46"];
        d2 [label="Strict Firm Tenancy Middleware & RBAC (HTTP 403)", color="#059669", fontcolor="#065F46"];
        d3 [label="48h Cutoff Timer + Atomic Token Revocation (HTTP 410)", color="#059669", fontcolor="#065F46"];
        d4 [label="Dual-Envelope AES-256-GCM + SHA-256 Hashed Tokens", color="#059669", fontcolor="#065F46"];
    }

    t1 -> d1 [color="#059669", penwidth=2.0];
    t2 -> d2 [color="#059669", penwidth=2.0];
    t3 -> d3 [color="#059669", penwidth=2.0];
    t4 -> d4 [color="#059669", penwidth=2.0];
}`,

  // Slide 22: Deployment Topology
  "deployment-topology": `digraph DeploymentTopology {
    ${SHARED_STYLE_DOT}
    rankdir=TB;

    subgraph cluster_client_tier {
        label="Client Ingress Tier";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#0A192F";
        color="#CBD5E1";
        style="rounded,filled";
        fillcolor="#F8FAFC";

        c_desk [label="RIA Advisory Hub\\nDesktop React 18 / MUI", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
        c_mob  [label="Mobile Consent Review\\nResponsive Smartphone (360px)", color="#059669", fillcolor="#ECFDF5", fontcolor="#065F46"];
    }

    tls [label="TLS 1.3 Ingress Gateway (Helmet HSTS | 1-Year Max Age)",
         shape=box, style="rounded,filled", fillcolor="#0A192F", color="#0A192F", fontcolor="#FFFFFF", fontsize=13];

    subgraph cluster_cloud_mumbai {
        label="AWS Asia Pacific (Mumbai) Region: ap-south-1 (Territorial Data Sovereignty)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#4F46E5";
        color="#818CF8";
        style="rounded,filled";
        fillcolor="#F1F5F9";

        subgraph cluster_docker {
            label="Multi-Stage Docker Container (Production)";
            fontname="Helvetica,Arial,sans-serif";
            fontsize=12;
            fontcolor="#0A192F";
            color="#94A3B8";
            style="rounded,dashed";
            fillcolor="#FFFFFF";

            api [label="Express Node.js REST API\\nTenancy, RBAC & Crypto Middleware", color="#0A192F", fontcolor="#0A192F"];
            dist [label="Vite Optimized Static Bundle\\nZero External CDN Dependencies", color="#64748B", fontcolor="#334155"];
        }

        db  [label="MongoDB Atlas Cluster (ap-south-1)\\nEncrypted Payloads & SHA-256 Ledger", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.0];
        sec [label="Isolated Key Storage\\nSERVER_MASTER_KEY != JWT_SECRET", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E", penwidth=2.0];
    }

    c_desk -> tls [color="#4F46E5"];
    c_mob  -> tls [color="#059669"];
    tls -> api [color="#0A192F", penwidth=2.0];
    api -> db  [color="#059669", penwidth=2.0];
    api -> sec [color="#D97706", penwidth=2.0];
}`,

  // Slide 24: Before & After Flows
  "before-after-flow": `digraph BeforeAfterFlow {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    subgraph cluster_before {
        label="Legacy Approval Practice (Vulnerable)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#E11D48";
        color="#FDA4AF";
        style="rounded,dashed";
        fillcolor="#FFF1F2";

        b1 [label="WhatsApp / Email Text\\n'Please buy Tata Motors'", color="#E11D48", fontcolor="#9F1239"];
        b2 [label="Informal 'Yes' Reply\\nNo Documented Rationale", color="#E11D48", fontcolor="#9F1239"];
        b3 [label="Year-End Tax Shock\\nPenalty under Sec 234C", color="#E11D48", fontcolor="#9F1239"];
        b4 [label="Audit Vulnerability\\nInadmissible in Disputes", color="#E11D48", fillcolor="#E11D48", fontcolor="#FFFFFF"];

        b1 -> b2 -> b3 -> b4 [color="#E11D48"];
    }

    subgraph cluster_after {
        label="FinConsent Statutory Digital Rail (Protected)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#059669";
        color="#A7F3D0";
        style="rounded,dashed";
        fillcolor="#ECFDF5";

        a1 [label="Encrypted Magic Link\\nPre-Trade Tax Visible", color="#059669", fontcolor="#065F46"];
        a2 [label="Password-Protected Gate\\nPAN Last 4 + DOB", color="#059669", fontcolor="#065F46"];
        a3 [label="Explicit Declarations\\n+ 6-Digit OTP Verification", color="#059669", fontcolor="#065F46"];
        a4 [label="Section 63 BSA Dossier\\nClient Executes via Broker", color="#059669", fillcolor="#059669", fontcolor="#FFFFFF"];

        a1 -> a2 -> a3 -> a4 [color="#059669", penwidth=2.0];
    }
}`,

  // Slide 27: Evidence Pack Composition Diagram
  "evidence-pack-composition": `digraph EvidencePackComposition {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    subgraph cluster_inputs {
        label="Mandatory Evidentiary Attributions (BSA 2023 §63)";
        fontname="Helvetica,Arial,sans-serif";
        fontsize=13;
        fontcolor="#0A192F";
        color="#94A3B8";
        style="rounded,dashed";
        fillcolor="#F8FAFC";

        e1 [label="Client Origin IP Address\\nRFC 5737 Sanitized (203.0.113.12)", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
        e2 [label="Device User-Agent & Environment\\nBrowser, Operating System & Viewport", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
        e3 [label="Synchronized NTP IST Timestamp\\nExact Indian Standard Time of OTP Verification", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E"];
        e4 [label="Masked Client Identity\\nValid PAN Syntax (XXXXX1234F) & DOB", color="#059669", fillcolor="#ECFDF5", fontcolor="#065F46"];
        e5 [label="Immutable Transaction Payload\\nISINs, Quantities, Prices & Capital Gains Tax", color="#0A192F", fillcolor="#F1F5F9", fontcolor="#0A192F"];
    }

    engine [label="CRYPTOGRAPHIC INTEGRITY ENGINE\\nComputes SHA-256 payloadHash\\nChains into Forward Ledger",
            shape=box, style="rounded,filled", fillcolor="#0A192F", color="#0A192F", fontcolor="#FFFFFF", fontsize=13];

    dossier [label="CERTIFIED SECTION 63 BSA COMPLIANCE DOSSIER\\nAdmissible in Regulatory Inspections & Civil Proceedings\\nPreserved for Mandatory 5-Year SEBI Retention",
             shape=box, style="rounded,filled", fillcolor="#059669", color="#059669", fontcolor="#FFFFFF", fontsize=14, penwidth=2.5];

    e1 -> engine;
    e2 -> engine;
    e3 -> engine;
    e4 -> engine;
    e5 -> engine;
    engine -> dossier [color="#059669", penwidth=2.5];
}`,

  // Slide 29: Pilot Timeline
  "pilot-timeline": `digraph PilotTimeline {
    ${SHARED_STYLE_DOT}
    rankdir=LR;

    w1 [label="WEEK 1: GOVERNANCE & SETUP\\n• Configure SEBI INA Number\\n• Set Compliance Officer Profile\\n• Configure Staff TOTP MFA", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    w2 [label="WEEK 2: CLIENT ROSTER INGESTION\\n• Import Client PAN & DOB\\n• Configure Masked Formatting\\n• Set Rebalance Rationale Templates", color="#4F46E5", fillcolor="#EEF2FF", fontcolor="#312E81"];
    w3 [label="WEEK 3: CONTROLLED PILOT RUN\\n• Present 10–25 Rebalance Proposals\\n• Verify Mobile OTP Turnaround\\n• Pre-Trade Tax Transparency Validated", color="#D97706", fillcolor="#FEF3C7", fontcolor="#92400E", penwidth=2.0];
    w4 [label="WEEK 4: COMPLIANCE AUDIT & SCALE\\n• Audit BSA §63 Evidence Receipts\\n• Compliance Officer Adjudication\\n• Practice-Wide Production Rollout", color="#059669", fillcolor="#D1FAE5", fontcolor="#065F46", penwidth=2.5];

    w1 -> w2 -> w3 -> w4 [color="#059669", penwidth=2.0];
}`
};

async function main() {
  console.log("==================================================================");
  console.log("   FINCONSENT MASTER ARCHITECTURE & WORKFLOW DIAGRAM GENERATOR    ");
  console.log("==================================================================\n");

  console.log(">>> 1. Loading WASM Graphviz engine...");
  const graphviz = await Graphviz.load();
  console.log(`  [OK] Loaded WASM Graphviz engine successfully.`);

  console.log("\n>>> 2. Launching Headless Chromium / Edge for PNG Rasterization...");
  const browserPath = getBrowserExecutable();
  console.log(`  [INFO] Using browser executable: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1100, deviceScaleFactor: 2 });
  await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #FFFFFF;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    svg {
      max-width: 100%;
      height: auto;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.03));
    }
  </style>
</head>
<body id="container"></body>
</html>`, { waitUntil: "domcontentloaded" });

  let count = 0;
  console.log(`\n>>> 3. Compiling and Rendering ${Object.keys(DIAGRAMS).length} Diagrams...`);

  for (const [name, dotSrc] of Object.entries(DIAGRAMS)) {
    const dotTrimmed = dotSrc.trim();

    // Paths for primary docs/diagrams
    const dotPath = path.join(DIAGRAMS_DIR, `${name}.dot`);
    const svgPath = path.join(DIAGRAMS_DIR, `${name}.svg`);
    const pngPath = path.join(DIAGRAMS_DIR, `${name}.png`);

    // 1. Write DOT
    fs.writeFileSync(dotPath, dotTrimmed, "utf-8");

    // 2. Compile to SVG
    const svgOutput = graphviz.dot(dotTrimmed, "svg");
    fs.writeFileSync(svgPath, svgOutput, "utf-8");

    // 3. Render High-Resolution PNG via in-page SVG replacement
    await page.evaluate((svg) => {
      document.getElementById("container").innerHTML = svg;
    }, svgOutput);

    const svgElement = await page.$("svg");
    if (!svgElement) {
      throw new Error(`SVG element not found for ${name}`);
    }

    await svgElement.screenshot({
      path: pngPath,
      omitBackground: false
    });

    // 4. Mirror to root diagrams/ and docs/visual-audit/diagrams/
    for (const targetDir of [ROOT_DIAGRAMS_DIR, AUDIT_DIAGRAMS_DIR]) {
      fs.copyFileSync(dotPath, path.join(targetDir, `${name}.dot`));
      fs.copyFileSync(svgPath, path.join(targetDir, `${name}.svg`));
      fs.copyFileSync(pngPath, path.join(targetDir, `${name}.png`));
    }

    count++;
    console.log(`  [OK] ${name}: .dot, .svg (${svgOutput.length} B), .png (${fs.statSync(pngPath).size} B)`);
  }

  await browser.close();

  console.log(`\n==================================================================`);
  console.log(`SUCCESS: All ${count} diagrams compiled and mirrored across:`);
  console.log(`  - ${DIAGRAMS_DIR}`);
  console.log(`  - ${ROOT_DIAGRAMS_DIR}`);
  console.log(`  - ${AUDIT_DIAGRAMS_DIR}`);
  console.log(`==================================================================`);
}

main().catch(err => {
  console.error("Fatal Error generating diagrams:", err);
  process.exit(1);
});

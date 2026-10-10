#!/usr/bin/env node
/**
 * Generates the FinConsent Statutory Process Flow Diagram using Graphviz.
 * Uses official Graphviz engine via @hpcc-js/wasm-graphviz for WebAssembly execution.
 * Renders SVG and high-resolution 300-DPI PNG via headless Microsoft Edge.
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

if (!fs.existsSync(DIAGRAMS_DIR)) {
  fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
}

const DOT_FILE = path.join(DIAGRAMS_DIR, "process-flow.dot");
const SVG_FILE = path.join(DIAGRAMS_DIR, "process-flow.svg");
const PNG_FILE = path.join(DIAGRAMS_DIR, "process-flow.png");

// Edge browser path on Windows
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

const dotContent = `digraph FinConsentProcessFlow {
    graph [
        rankdir=TB,
        nodesep=0.35,
        ranksep=0.45,
        splines=ortho,
        bgcolor="#FFFFFF",
        fontname="Helvetica,Arial,sans-serif",
        fontsize=12,
        pad="0.3,0.3",
        compound=true
    ];

    node [
        shape=none,
        fontname="Helvetica,Arial,sans-serif",
        fontsize=10,
        color="#CBD5E1"
    ];

    edge [
        fontname="Helvetica,Arial,sans-serif",
        fontsize=8.5,
        fontcolor="#334155",
        penwidth=2.0,
        color="#4F46E5",
        arrowsize=0.85
    ];

    // =========================================================================
    // ROW 1: RIA ADVISORY FORMULATION & SECURE DISPATCH
    // =========================================================================
    subgraph cluster_row1 {
        label=<<FONT POINT-SIZE="11.5" COLOR="#0A192F"><B>PHASE I &amp; II: RIA ADVISORY FORMULATION, TAX PRE-CALCULATION &amp; CRYPTOGRAPHIC DISPATCH</B></FONT>>;
        color="#CBD5E1";
        style="rounded,filled";
        fillcolor="#F8FAFC";
        penwidth=1.2;
        margin=14;

        step1 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#4F46E5" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#0A192F" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>1. RIA FORMULATION</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#4F46E5" POINT-SIZE="9"><B>Actor: Suresh Narayanan (RIA)</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Equity Drift: 65% → 50% target</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Sell: HDFC Bank &amp; Tata Motors (₹11.1L)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Buy: Bharat Bond ETF &amp; Gold ETF (₹11.1L)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#059669" POINT-SIZE="8"><B>• SEBI Reg 19 Advisory Rationale</B></FONT></TD></TR>
            </TABLE>
        >];

        step2 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#0284C7" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#0369A1" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>2. TAX ENGINE &amp; CUTOFF</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#0284C7" POINT-SIZE="9"><B>Engine: Finance Act 2024</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• STCG @ 20.0% on ₹55k = ₹11,000</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• LTCG @ 12.5% in ₹1.25L exempt = ₹0</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Net Tax: ₹11,440 (with 4% Cess)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#D97706" POINT-SIZE="8"><B>• Sec 234B/C Alert &amp; 48h Cutoff</B></FONT></TD></TR>
            </TABLE>
        >];

        step3 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#6366F1" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#4338CA" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>3. ENCRYPTION &amp; DISPATCH</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#6366F1" POINT-SIZE="9"><B>Dual AES-256-GCM Envelope</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Financial payload encrypted (DEK)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Server Master Key wraps DEK</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Client PBKDF2(PAN+DOB) wraps DEK</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#4F46E5" POINT-SIZE="8"><B>• 256-bit Magic Token (SHA-256 DB)</B></FONT></TD></TR>
            </TABLE>
        >];

        { rank=same; step1; step2; step3; }

        step1 -> step2 [label="Pre-Trade\\nTax Rules"];
        step2 -> step3 [label="Draft Sealed &amp;\\nDispatched"];
    }

    // =========================================================================
    // ROW 2: CLIENT REVIEW, MANDATE CHAT & STATUTORY AUTHORIZATION
    // =========================================================================
    subgraph cluster_row2 {
        label=<<FONT POINT-SIZE="11.5" COLOR="#0A192F"><B>PHASE III, IV &amp; V: CLIENT MOBILE REVIEW, CHAT CLARIFICATION, 6-DIGIT OTP &amp; SECTION 63 BSA EVIDENCE DOSSIER</B></FONT>>;
        color="#CBD5E1";
        style="rounded,filled";
        fillcolor="#F8FAFC";
        penwidth=1.2;
        margin=14;

        step4 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#0D9488" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#0F766E" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>4. PASSWORD UNLOCK</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#0D9488" POINT-SIZE="9"><B>Actor: Rohan Mehta (Mobile)</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Zero PII disclosed prior to unlock</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Password: 123414081978</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• PBKDF2 unwraps DEK; 2h JWT</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#0D9488" POINT-SIZE="8"><B>• Drift, Baskets &amp; Tax Decrypted</B></FONT></TD></TR>
            </TABLE>
        >];

        step5 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#7C3AED" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#6D28D9" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>5. MANDATE CHAT RAIL</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#7C3AED" POINT-SIZE="9"><B>Advisory Clarification Rail</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Client queries Tata Motors weight</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• Suresh clarifies risk ceiling</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#DC2626" POINT-SIZE="8"><B>• STATUTORY BOUNDARY:</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#DC2626" POINT-SIZE="8"><B>  Chat ≠ Trade Consent</B></FONT></TD></TR>
            </TABLE>
        >];

        step6 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#D97706" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#B45309" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>6. STATUTORY CONSENT &amp; OTP</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#D97706" POINT-SIZE="9"><B>Cryptographic Authorization</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• 3 Mandatory Legal Checkboxes:</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="7.5">•   Reg 19, Tax Estimate, Sec 63 BSA / 65B</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">• 6-Digit OTP (CSPRNG, 5m TTL)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#D97706" POINT-SIZE="8"><B>• Max 3 Attempts Before Lock</B></FONT></TD></TR>
            </TABLE>
        >];

        step7 [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7" COLOR="#059669" BGCOLOR="#ECFDF5" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#065F46" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="10.5"><B>7. EVIDENCE LOCK &amp; DOSSIER</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#065F46" POINT-SIZE="9"><B>Immutable Regulatory Ledger</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8">• Token Burned (Single-Use 410)</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8">• Mandate Status: CONSENTED</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8">• Chained SHA-256 Audit Logged</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#065F46" POINT-SIZE="8"><B>• Sec 63 BSA / 65B Dossier Certified</B></FONT></TD></TR>
            </TABLE>
        >];

        { rank=same; step4; step5; step6; step7; }

        step4 -> step5 [label="Advisory\\nClarification"];
        step5 -> step6 [label="Terms\\nUnderstood"];
        step6 -> step7 [label="OTP Validated &amp;\\nAtomic Revoke"];
    }

    // =========================================================================
    // ROW 3: SECURITY GUARDS & AUTOMATED DEFENSES
    // =========================================================================
    subgraph cluster_row3 {
        label=<<FONT POINT-SIZE="10.5" COLOR="#991B1B"><B>RUNTIME SECURITY GUARDS &amp; AUTOMATED EXCEPTION CONTROLS</B></FONT>>;
        color="#FCA5A5";
        style="rounded,filled";
        fillcolor="#FEF2F2";
        penwidth=1.0;
        margin=10;

        cutoff_box [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#991B1B" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>48H CUTOFF / REVOCATION</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="7.5">• 48h Window Elapsed without consent</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="7.5">• RIA Emergency "Revoke Link" Tapped</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#B91C1C" POINT-SIZE="7.5"><B>Status: EXPIRED / REVOKED (HTTP 410)</B></FONT></TD></TR>
            </TABLE>
        >];

        pwd_lockout [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#991B1B" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>PASSWORD BRUTE-FORCE LOCKOUT</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="7.5">• 5 Consecutive Failed Attempts</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#B91C1C" POINT-SIZE="7.5"><B>• 15-Minute Rate Limit Lockout (HTTP 429)</B></FONT></TD></TR>
            </TABLE>
        >];

        otp_lockout [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#991B1B" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>OTP BRUTE-FORCE DEFENSE</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="7.5">• 3 Failed OTP Verification Tries</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#B91C1C" POINT-SIZE="7.5"><B>• Token Permanently Burned &amp; Locked (HTTP 429)</B></FONT></TD></TR>
            </TABLE>
        >];

        replay_defense [label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#059669" BGCOLOR="#FFFFFF" STYLE="ROUNDED">
                <TR><TD BGCOLOR="#065F46" ALIGN="CENTER"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>ANTI-REPLAY TOKEN GUARD</B></FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#065F46" POINT-SIZE="7.5">• Magic token invalidated immediately upon consent</FONT></TD></TR>
                <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="7.5"><B>• Re-access attempts rejected with HTTP 410 Gone</B></FONT></TD></TR>
            </TABLE>
        >];

        { rank=same; cutoff_box; pwd_lockout; otp_lockout; replay_defense; }
    }

    // Inter-Phase Transition Edge (Row 1 to Row 2)
    step3 -> step4 [label="1-Click WhatsApp / Email Delivery\\nHigh-Entropy Magic Link Dispatched", penwidth=2.5, color="#059669", fontcolor="#065F46"];

    // Security Guards Connections
    step2 -> cutoff_box [label="&gt;48h / Revoke", color="#DC2626", fontcolor="#DC2626", style=dashed];
    step4 -> pwd_lockout [label="5x Failed Pwd", color="#DC2626", fontcolor="#DC2626", style=dashed];
    step6 -> otp_lockout [label="3x Failed OTP", color="#DC2626", fontcolor="#DC2626", style=dashed];
    step7 -> replay_defense [label="Atomic Burn", color="#059669", fontcolor="#065F46", style=dashed];
}
`;

async function main() {
  console.log("==================================================================");
  console.log("     FINCONSENT GRAPHVIZ PROCESS FLOW DIAGRAM GENERATOR           ");
  console.log("==================================================================\n");

  // 1. Write .dot file
  console.log(">>> 1. Writing Graphviz DOT definition...");
  fs.writeFileSync(DOT_FILE, dotContent, "utf8");
  console.log(`  [OK] Wrote DOT source: ${DOT_FILE}`);

  // 2. Compile to SVG via @hpcc-js/wasm-graphviz
  console.log("\n>>> 2. Compiling Graphviz DOT to SVG via WebAssembly...");
  const gv = await Graphviz.load();
  const svgOutput = gv.dot(dotContent, "svg");
  fs.writeFileSync(SVG_FILE, svgOutput, "utf8");
  console.log(`  [OK] Rendered SVG: ${SVG_FILE} (${fs.statSync(SVG_FILE).size} bytes)`);

  // 3. Render High-Resolution PNG via Headless Edge / Chromium
  console.log("\n>>> 3. Rendering High-Resolution PNG (Retina 300-DPI equivalent)...");
  const browserPath = getBrowserExecutable();
  console.log(`  [INFO] Using browser executable: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  try {
    const page = await browser.newPage();
    // High device scale factor for crisp vector-like text rendering in PowerPoint
    await page.setViewport({ width: 1600, height: 1100, deviceScaleFactor: 2 });

    const htmlWrapper = `<!DOCTYPE html>
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
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.04));
    }
  </style>
</head>
<body>
  ${svgOutput}
</body>
</html>`;

    await page.setContent(htmlWrapper, { waitUntil: "networkidle0" });
    const svgElement = await page.$("svg");
    if (!svgElement) {
      throw new Error("SVG element not found in rendered page.");
    }

    await svgElement.screenshot({
      path: PNG_FILE,
      omitBackground: false
    });

    console.log(`  [OK] Rendered High-Res PNG: ${PNG_FILE} (${fs.statSync(PNG_FILE).size} bytes)`);

    // Mirror to root diagrams directory if exists or create for accessibility
    const ROOT_DIAGRAMS = path.join(BASE_DIR, "diagrams");
    if (!fs.existsSync(ROOT_DIAGRAMS)) fs.mkdirSync(ROOT_DIAGRAMS, { recursive: true });
    fs.copyFileSync(DOT_FILE, path.join(ROOT_DIAGRAMS, "process-flow.dot"));
    fs.copyFileSync(SVG_FILE, path.join(ROOT_DIAGRAMS, "process-flow.svg"));
    fs.copyFileSync(PNG_FILE, path.join(ROOT_DIAGRAMS, "process-flow.png"));
    console.log(`  [OK] Mirrored assets to ${ROOT_DIAGRAMS}`);

  } finally {
    await browser.close();
  }

  console.log("\n==================================================================");
  console.log("SUCCESS: FINCONSENT PROCESS FLOW DIAGRAM REGENERATED VIA GRAPHVIZ");
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("FATAL ERROR generating process flow diagram:", err);
  process.exit(1);
});

#!/usr/bin/env python3
"""
Generates the FinConsent Statutory Process Flow Diagram using Graphviz.
Renders both high-resolution PNG (for PowerPoint & documentation) and SVG (for HTML viewer).
"""

import os
import subprocess
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
DIAGRAMS_DIR = os.path.join(DOCS_DIR, "diagrams")
os.makedirs(DIAGRAMS_DIR, exist_ok=True)

DOT_FILE = os.path.join(DIAGRAMS_DIR, "process-flow.dot")
PNG_FILE = os.path.join(DIAGRAMS_DIR, "process-flow.png")
SVG_FILE = os.path.join(DIAGRAMS_DIR, "process-flow.svg")

def create_dot_file():
    dot_content = """digraph FinConsentProcessFlow {
    // Global Graph Attributes
    graph [
        rankdir=LR,
        nodesep=0.5,
        ranksep=0.7,
        splines=ortho,
        bgcolor="#FFFFFF",
        fontname="Helvetica,Arial,sans-serif",
        fontsize=12,
        pad="0.4,0.4",
        compound=true
    ];

    // Global Node & Edge Attributes
    node [
        shape=none,
        fontname="Helvetica,Arial,sans-serif",
        fontsize=10,
        color="#CBD5E1"
    ];
    edge [
        fontname="Helvetica,Arial,sans-serif",
        fontsize=8.5,
        color="#4F46E5",
        fontcolor="#475569",
        penwidth=1.8,
        arrowsize=0.8
    ];

    // ==========================================
    // STAGE 1: RIA Formulation
    // ==========================================
    step1 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#4F46E5" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#4F46E5"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>1. RIA FORMULATION</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Actor: Suresh Narayanan (RIA)</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Equity Drift Detected: 65% → 50%</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Sell Basket: HDFC &amp; Tata Motors (₹11.1L)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Buy Basket: Bharat Bond ETF &amp; Gold ETF</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#059669" POINT-SIZE="8.5"><B>• SEBI Reg 19 Advisory Rationale</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 2: Tax Calculation & Cutoff
    // ==========================================
    step2 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#0284C7" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#0284C7"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>2. TAX ENGINE &amp; CUTOFF</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Engine: Finance Act 2024</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• STCG @ 20% on ₹55k gain = ₹11,000</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• LTCG @ 12.5% within ₹1.25L exempt</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Total Tax Liability: ₹11,440 (with Cess)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#D97706" POINT-SIZE="8.5"><B>• 48-Hour Cutoff Timer Initialized</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 3: Dual-Envelope Encryption
    // ==========================================
    step3 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#6366F1" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#6366F1"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>3. ENCRYPTION &amp; DISPATCH</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Security: Dual-Envelope Crypto</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• AES-256-GCM Payload Encryption</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• DEK Key Wrap (Server Master Key)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Client Wrap: PBKDF2(PAN + DOB)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#4F46E5" POINT-SIZE="8.5"><B>• 256-bit Magic Token (SHA-256 DB)</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 4: Client Mobile Access & Password Gate
    // ==========================================
    step4 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#0D9488" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#0D9488"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>4. PASSWORD ACCESS GATE</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Actor: Rohan Mehta (Client Mobile)</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Zero PII visible prior to unlock</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Client Enters PAN + DOB Password</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• PBKDF2 unwraps DEK; 2h JWT issued</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0D9488" POINT-SIZE="8.5"><B>• Drift, Baskets &amp; Tax Decrypted</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 5: Mandate Clarification Chat Rail
    // ==========================================
    step5 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#7C3AED" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#7C3AED"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>5. MANDATE CLARIFICATION</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Channel: In-App Advisory Rail</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Client queries single-stock ceiling</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• Suresh clarifies Tata Motors risk</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#DC2626" POINT-SIZE="8.5"><B>• STATUTORY SEPARATION BARRIER:</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#DC2626" POINT-SIZE="8.5"><B>  Informal Chat ≠ Trade Consent</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 6: Statutory Declarations & OTP
    // ==========================================
    step6 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#D97706" BGCOLOR="#F8FAFC" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#D97706"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>6. STATUTORY CONSENT &amp; OTP</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#0A192F" POINT-SIZE="9"><B>Multi-Factor Authorization</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• 3 Mandatory Legal Checkboxes:</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8">•   Reg 19, Tax Liability, Sec 65B</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#475569" POINT-SIZE="8.5">• 6-Digit Cryptographic OTP (5m TTL)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#D97706" POINT-SIZE="8.5"><B>• Max 3 Attempts Before Lockout</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // STAGE 7: Evidence Dossier & Atomic Lock
    // ==========================================
    step7 [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="#059669" BGCOLOR="#ECFDF5" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#059669"><FONT COLOR="#FFFFFF" POINT-SIZE="11"><B>7. EVIDENCE LOCK &amp; REVOKE</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#065F46" POINT-SIZE="9"><B>Audit: Immutable Regulatory Ledger</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8.5">• Single-Use Magic Token Burned (410)</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8.5">• Mandate Status: CONSENTED</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#047857" POINT-SIZE="8.5">• SHA-256 Chained Hash Log Committed</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#065F46" POINT-SIZE="8.5"><B>• Sec 63 BSA / 65B Dossier Certified</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // Exception / Security Safeguards Nodes
    // ==========================================
    exp_timeout [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FEF2F2" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#DC2626"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>48H CUTOFF / REVOCATION</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8">• 48h Window Elapsed</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8">• RIA Emergency Revoke</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8"><B>Status: EXPIRED / REVOKED</B></FONT></TD></TR>
        </TABLE>
    >];

    pwd_lockout [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FEF2F2" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#DC2626"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>PASSWORD LOCKOUT</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8">• 5 Consecutive Failures</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8"><B>15-Min Lockout (HTTP 429)</B></FONT></TD></TR>
        </TABLE>
    >];

    otp_lockout [label=<
        <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="6" COLOR="#DC2626" BGCOLOR="#FEF2F2" STYLE="ROUNDED">
            <TR><TD BGCOLOR="#DC2626"><FONT COLOR="#FFFFFF" POINT-SIZE="9"><B>OTP BRUTE-FORCE LOCK</B></FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8">• 3 Failed Verification Tries</FONT></TD></TR>
            <TR><TD ALIGN="LEFT"><FONT COLOR="#991B1B" POINT-SIZE="8"><B>Token Burned (HTTP 429)</B></FONT></TD></TR>
        </TABLE>
    >];

    // ==========================================
    // Main Progression Edges
    // ==========================================
    step1 -> step2 [label="Pre-Trade\\nTax Rules"];
    step2 -> step3 [label="Draft Saved &amp;\\nEnvelope Sealed"];
    step3 -> step4 [label="WhatsApp / Email\\nMagic Link"];
    step4 -> step5 [label="Client Inquires\\n(Optional)"];
    step5 -> step6 [label="Clarification\\nReceived"];
    step4 -> step6 [label="Direct Consent\\n(If no query)", style=dashed, color="#94A3B8"];
    step6 -> step7 [label="OTP Verified &amp;\\nAtomic Lock"];

    // ==========================================
    // Security & Exception Edges
    // ==========================================
    step2 -> exp_timeout [label=">48 Hours", color="#DC2626", fontcolor="#DC2626", style=dashed];
    step4 -> pwd_lockout [label="5x Invalid Pwd", color="#DC2626", fontcolor="#DC2626", style=dashed];
    step6 -> otp_lockout [label="3x Invalid OTP", color="#DC2626", fontcolor="#DC2626", style=dashed];
}
"""
    with open(DOT_FILE, "w", encoding="utf-8") as f:
        f.write(dot_content)
    print(f"[OK] Wrote DOT file: {DOT_FILE}")

def render_diagrams():
    # Use dot to render PNG and SVG
    # Rendering PNG at 300 DPI for ultra crisp presentation resolution
    print("[INFO] Rendering PNG via Graphviz dot (300 DPI)...")
    res_png = subprocess.run(["dot", "-Tpng", "-Gdpi=300", DOT_FILE, "-o", PNG_FILE], capture_output=True, text=True)
    if res_png.returncode != 0:
        print(f"[ERROR] Graphviz PNG render failed: {res_png.stderr}")
        sys.exit(1)
    print(f"[OK] Rendered PNG: {PNG_FILE} ({os.path.getsize(PNG_FILE)} bytes)")

    print("[INFO] Rendering SVG via Graphviz dot...")
    res_svg = subprocess.run(["dot", "-Tsvg", DOT_FILE, "-o", SVG_FILE], capture_output=True, text=True)
    if res_svg.returncode != 0:
        print(f"[ERROR] Graphviz SVG render failed: {res_svg.stderr}")
        sys.exit(1)
    print(f"[OK] Rendered SVG: {SVG_FILE} ({os.path.getsize(SVG_FILE)} bytes)")

if __name__ == "__main__":
    create_dot_file()
    render_diagrams()

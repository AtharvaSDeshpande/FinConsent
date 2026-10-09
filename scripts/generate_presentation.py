#!/usr/bin/env python3
"""
FinConsent Client-Facing Executive Presentation Generator
Generates a synchronized, highly professional PowerPoint presentation (16:9 widescreen)
following the exact FinConsent user journey, regulatory context, architecture, and visual evidence.
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
OUTPUT_PPTX = os.path.join(DOCS_DIR, "FinConsent-Client-Presentation.pptx")
OUTPUT_PPTX_ROOT = os.path.join(BASE_DIR, "FinConsent-Client-Presentation.pptx")

# Color Palette: Clean Institutional WealthTech Light Theme
COLOR_BG = RGBColor(255, 255, 255)          # Pure White #FFFFFF
COLOR_CARD_BG = RGBColor(248, 250, 252)     # Tinted Slate #F8FAFC
COLOR_CARD_BORDER = RGBColor(226, 232, 240) # Slate #E2E8F0
COLOR_NAVY = RGBColor(10, 25, 47)           # Primary Navy #0A192F
COLOR_SLATE = RGBColor(71, 85, 105)         # Body Slate #475569
COLOR_MUTED = RGBColor(148, 163, 184)       # Muted Slate #94A3B8
COLOR_INDIGO = RGBColor(79, 70, 229)        # Accent Indigo #4F46E5
COLOR_EMERALD = RGBColor(5, 150, 105)       # Success Emerald #059669
COLOR_AMBER = RGBColor(217, 119, 6)         # Warning Amber #D97706
COLOR_RED = RGBColor(225, 29, 72)           # Security Rose #E11D48

FONT_HEADING = "Calibri"
FONT_BODY = "Calibri"

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_blank_slide():
        slide = prs.slides.add_slide(blank_layout)
        # Add subtle background fill
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return slide

    def add_header(slide, kicker, title, subtitle=None):
        # Header Container
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.3))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Kicker
        p_kicker = tf.paragraphs[0]
        p_kicker.text = kicker.upper()
        p_kicker.font.name = FONT_HEADING
        p_kicker.font.size = Pt(9.5)
        p_kicker.font.bold = True
        p_kicker.font.color.rgb = COLOR_INDIGO
        p_kicker.space_after = Pt(2)

        # Title
        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = FONT_HEADING
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_NAVY
        p_title.space_after = Pt(2)

        # Subtitle
        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = FONT_BODY
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = COLOR_SLATE

    def add_card(slide, left, top, width, height, bg_color=COLOR_CARD_BG, border_color=COLOR_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    def add_image_safe(slide, rel_path, left, top, width, height, caption=None):
        full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        if os.path.exists(full_path):
            pic = slide.shapes.add_picture(full_path, left, top, width, height)
            if caption:
                cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.08), width, Inches(0.4))
                tf = cap_box.text_frame
                tf.word_wrap = True
                tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
                p = tf.paragraphs[0]
                p.text = caption
                p.font.name = FONT_BODY
                p.font.size = Pt(9)
                p.font.italic = True
                p.font.color.rgb = COLOR_SLATE
            return pic
        else:
            # Fallback placeholder card
            ph = add_card(slide, left, top, width, height, COLOR_CARD_BG, COLOR_AMBER)
            tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
            p = tb.text_frame.paragraphs[0]
            p.text = f"[Visual Placeholder: {os.path.basename(rel_path)}]"
            p.font.size = Pt(11)
            p.font.color.rgb = COLOR_AMBER
            return ph

    # =========================================================================
    # SLIDE 1: Title & FinConsent Introduction
    # =========================================================================
    s1 = add_blank_slide()
    # Decorative accent bar
    top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.2), Inches(0.8), Inches(0.08))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = COLOR_INDIGO
    top_bar.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.733), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "FINCONSENT"
    p.font.name = FONT_HEADING
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = COLOR_NAVY

    p = tf1.add_paragraph()
    p.text = "Enterprise Statutory Trade Authorization & Tax-Impact Infrastructure for Indian RIAs"
    p.font.name = FONT_HEADING
    p.font.size = Pt(20)
    p.font.color.rgb = COLOR_INDIGO
    p.space_after = Pt(24)

    p = tf1.add_paragraph()
    p.text = "Purpose-built for SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, pre-trade capital gains tax transparency under Finance Act 2024, and Section 65B tamper-evident electronic evidence."
    p.font.name = FONT_BODY
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_SLATE
    p.space_after = Pt(36)

    # Key highlights row
    add_card(s1, Inches(0.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t1 = s1.shapes.add_textbox(Inches(1.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t1.text_frame.word_wrap = True
    p = t1.text_frame.paragraphs[0]
    p.text = "SEBI Regulation 19 Compliance"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t1.text_frame.add_paragraph()
    p.text = "Enforces non-discretionary prior informed client consent with a statutory 5-year cryptographic audit trail."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    add_card(s1, Inches(4.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t2 = s1.shapes.add_textbox(Inches(5.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t2.text_frame.word_wrap = True
    p = t2.text_frame.paragraphs[0]
    p.text = "Budget 2024 Tax Engine"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t2.text_frame.add_paragraph()
    p.text = "Automates STCG (20%) & LTCG (12.5%) pre-computations with Section 234B/C quarterly advance tax alerts."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    add_card(s1, Inches(8.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t3 = s1.shapes.add_textbox(Inches(9.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t3.text_frame.word_wrap = True
    p = t3.text_frame.paragraphs[0]
    p.text = "Cryptographic Evidence"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t3.text_frame.add_paragraph()
    p.text = "Dual AES-256-GCM envelope encryption, 6-digit OTP, and Section 65B Indian Evidence Act certificates."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 2: The Problem Advisors and Clients Face Today
    # =========================================================================
    s2 = add_blank_slide()
    add_header(s2, "Industry Landscape", "The Problem: The High-Stakes Friction in Indian Wealth Advisory",
               "Why legacy approval methods fail both advisory firms and high-net-worth investors.")

    # 3 Column Cards
    col_w = Inches(3.64)
    c1 = add_card(s2, Inches(0.8), Inches(2.0), col_w, Inches(4.6))
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "1. Informal WhatsApp Approvals"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_RED
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Advisors routinely collect approvals via WhatsApp, emails, or phone notes.\n• SEBI inspection teams reject informal text messages as non-compliant with Regulation 19.\n• Leaves advisers legally exposed to claims of discretionary or unauthorized trading.\n• Zero legal admissibility under Section 65B of the Indian Evidence Act."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s2, Inches(4.84), Inches(2.0), col_w, Inches(4.6))
    tb = s2.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "2. Capital Gains Tax Shocks"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_AMBER
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Union Budget 2024 increased STCG to 20% and LTCG to 12.5%.\n• Rebalancing portfolios triggers significant capital gains without prior investor visibility.\n• Clients are blindsided by unexpected year-end tax liabilities.\n• Advance tax penal interest (Sections 234B & 234C) erodes investor trust and fee satisfaction."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s2, Inches(8.88), Inches(2.0), col_w, Inches(4.6))
    tb = s2.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "3. Fragmented Audit Trails"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Advisory rationale, client communications, and trade executions live in separate silos.\n• Compiling regulatory records for annual SEBI audits takes weeks of administrative overhead.\n• Audit logs in spreadsheets can be altered, disputed, or deleted.\n• Inability to prove exact IST timestamp, client IP, and portfolio allocation agreed upon."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 3: The Human/Business Story & Personas
    # =========================================================================
    s3 = add_blank_slide()
    add_header(s3, "The Story", "The Human Context: An RIA and HNI Client Journey",
               "Grounding compliance in real operational realities: Suresh Narayanan and Rohan Mehta.")

    p_w = Inches(5.6)
    # Persona 1: Advisor
    add_card(s3, Inches(0.8), Inches(2.0), p_w, Inches(4.6))
    tb = s3.shapes.add_textbox(Inches(1.1), Inches(2.2), p_w - Inches(0.6), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Suresh Narayanan"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "Principal Officer & Founder, Prudent Wealth Advisory (SEBI Reg: INA000018421)"; p.font.size = Pt(11); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(12)
    p = tf.add_paragraph()
    p.text = "• Background: Manages ₹180 Crores in AUM across 75 affluent families under a fee-only, non-discretionary advisory model.\n• Challenge: Equity markets surged post-budget; several client portfolios have drifted 15%+ away from risk mandates.\n• Regulatory Obligation: Must recommend selling equities and buying debt/gold, but cannot execute without prior written consent and full tax disclosure under SEBI Regulation 19."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # Persona 2: Client
    add_card(s3, Inches(6.8), Inches(2.0), p_w, Inches(4.6))
    tb = s3.shapes.add_textbox(Inches(7.1), Inches(2.2), p_w - Inches(0.6), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Rohan Mehta"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "HNI Advisory Client | Managing Director, Auto-Tech Firm, Pune (PAN: ABCDE1234F)"; p.font.size = Pt(11); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(12)
    p = tf.add_paragraph()
    p.text = "• Background: Holds a ₹4.2 Crore portfolio. Extremely busy executive who reviews financial proposals on his mobile phone between meetings.\n• Expectation: Values Suresh's advice, but refuses to sign complex paper forms or guess tax liabilities.\n• Need: Demands a frictionless 2-minute mobile authorization flow that clearly explains why securities are being sold and the exact rupee tax liability."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 4: Why the Current Process Creates Risk and Friction
    # =========================================================================
    s4 = add_blank_slide()
    add_header(s4, "Friction & Risk Analysis", "Why Current Operational Approaches Break Down",
               "Evaluating the systemic vulnerabilities of informal, non-statutory consent channels.")

    # 4 horizontal cards
    card_h = Inches(1.1)
    y_starts = [Inches(1.9), Inches(3.2), Inches(4.5), Inches(5.8)]
    risks = [
        ("SEBI Regulation 19 Violation", "Advisers without cryptographic client consent face cancellation of registration, show-cause notices, and personal penalties during mandatory regulatory inspections.", COLOR_RED),
        ("Advance Tax Penalties (Sec 234B & 234C)", "Selling equities without advance tax warnings leads to mandatory 1% monthly penal interest, creating direct client friction and fee dissatisfaction.", COLOR_AMBER),
        ("Inadmissible Electronic Evidence", "Under Section 65B of the Indian Evidence Act, raw screenshots of WhatsApp messages cannot be admitted into court or arbitration tribunals without device and server hash proof.", COLOR_INDIGO),
        ("Operational Delay & Market Slippage", "Chasing clients across emails and phone calls causes days of delay, during which market prices drift and optimal rebalancing opportunities evaporate.", COLOR_NAVY)
    ]

    for i, (title, desc, color) in enumerate(risks):
        y = y_starts[i]
        add_card(s4, Inches(0.8), y, Inches(11.733), card_h)
        # Accent indicator
        ind = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), y, Inches(0.12), card_h)
        ind.fill.solid(); ind.fill.fore_color.rgb = color; ind.line.fill.background()

        tb = s4.shapes.add_textbox(Inches(1.2), y + Inches(0.15), Inches(11.0), card_h - Inches(0.3))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 5: FinConsent Solution Overview
    # =========================================================================
    s5 = add_blank_slide()
    add_header(s5, "Platform Architecture", "FinConsent Solution Overview: The Four Core Pillars",
               "An integrated statutory infrastructure bridging advisory formulation and client mobile consent.")

    p_w = Inches(2.7)
    x_positions = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    pillars = [
        ("1. Pre-Trade Tax Transparency", "Dynamic Union Budget 2024 tax engine. Computes STCG (20%) and LTCG (12.5%) in real time, alerting clients to quarterly advance tax deadlines.", COLOR_INDIGO),
        ("2. Dual-Envelope Encryption", "AES-256-GCM encryption with dual key wrapping. Protects sensitive financial assets until client unlocks via PAN last 4 digits and DOB.", COLOR_NAVY),
        ("3. Frictionless Mobile Consent", "Zero-login 256-bit magic links. 360px responsive mobile layout, mandate clarification chat, and TRAI DLT 6-digit OTP verification.", COLOR_EMERALD),
        ("4. Section 65B Audit Trail", "Append-only forward SHA-256 hash chaining. Emits digitally fingerprinted Regulation 19 compliance dossiers with IP, user-agent, and IST timestamps.", COLOR_AMBER)
    ]

    for i, (p_title, p_desc, p_col) in enumerate(pillars):
        x = x_positions[i]
        add_card(s5, x, Inches(2.0), p_w, Inches(4.6))
        # Top color badge
        badge = s5.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, Inches(2.0), p_w, Inches(0.1))
        badge.fill.solid(); badge.fill.fore_color.rgb = p_col; badge.line.fill.background()

        tb = s5.shapes.add_textbox(x + Inches(0.2), Inches(2.3), p_w - Inches(0.4), Inches(4.0))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = p_title; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
        p = tf.add_paragraph(); p.space_before = Pt(12); p.text = p_desc; p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 6: End-to-End User Journey Narrative
    # =========================================================================
    s6 = add_blank_slide()
    add_header(s6, "Narrative Flow", "End-to-End User Journey: From Drift to Locked Evidence",
               "Chronological storytelling mapping advisor formulation to statutory compliance archive.")

    # 5 Phase Horizontal Sequence
    step_w = Inches(2.2)
    step_x = [Inches(0.8), Inches(3.2), Inches(5.6), Inches(8.0), Inches(10.4)]
    steps = [
        ("Phase 1: Drift & Formulation", "Suresh detects 15% equity drift. Drafts ₹11.10L rebalance into corporate debt and gold bonds.", "RIA Workspace"),
        ("Phase 2: Tax Calculation", "Engine calculates ₹11,440 capital gains tax. Generates 48-hour cutoff window and dispatch link.", "Tax Engine"),
        ("Phase 3: Secure Delivery", "Delivered via WhatsApp. Rohan opens link; sensitive data remains encrypted until PAN+DOB unlock.", "Mobile Delivery"),
        ("Phase 4: Review & Chat", "Rohan reviews trade baskets, asks a clarification in mandate chat. Suresh replies; Rohan accepts terms.", "Discussion Rail"),
        ("Phase 5: OTP & Evidence", "Rohan verifies 6-digit OTP. Token revoked; Section 65B compliance dossier locked immutably.", "Audit Ledger")
    ]

    for i, (st, desc, actor) in enumerate(steps):
        x = step_x[i]
        add_card(s6, x, Inches(2.0), step_w, Inches(4.6))
        tb = s6.shapes.add_textbox(x + Inches(0.15), Inches(2.2), step_w - Inches(0.3), Inches(4.2))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = f"STEP {i+1}"; p.font.bold = True; p.font.size = Pt(10); p.font.color.rgb = COLOR_INDIGO
        p = tf.add_paragraph(); p.text = st; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(8)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(10); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(12)
        p = tf.add_paragraph(); p.text = f"[{actor}]"; p.font.italic = True; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_MUTED

    # =========================================================================
    # SLIDE 7: Process Flow Diagram
    # =========================================================================
    s7 = add_blank_slide()
    add_header(s7, "Process Flow", "Statutory Process Flow Diagram",
               "Deterministic state progression from recommendation to immutable regulatory evidence.")

    flow_box = add_card(s7, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.8), COLOR_CARD_BG)
    tb = s7.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(11.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True

    flow_text = """[ 1. RIA FORMULATION ]
   • Portfolio Drift Identified (Equity 65% → 50% target)
   • Trade baskets constructed (Sell HDFC Bank & Tata Motors; Buy Bharat Bond ETF & SGB)
   • Advisory Rationale documented under SEBI IA Regulations
              │
              ▼
[ 2. TAX-IMPACT CALCULATION & 48H CUTOFF ]
   • Union Budget 2024 Engine: STCG @ 20% (₹11,000) + LTCG @ 12.5% (Exempt) + 4% Cess
   • Section 234B/C Advance Tax notice triggered
   • 48-Hour execution cutoff timer initialized
              │
              ▼
[ 3. DUAL-ENVELOPE ENCRYPTION & SECURE DISPATCH ]
   • Sensitive financial payload encrypted via AES-256-GCM
   • Data Encryption Key (DEK) wrapped for client via PBKDF2(PAN_last4 + DOB)
   • 256-bit high-entropy magic link dispatched via 1-click WhatsApp template
              │
              ▼
[ 4. CLIENT ACCESS & PASSWORD UNLOCK ]
   • Rohan Mehta taps link on mobile smartphone (Zero PII visible prior to unlock)
   • Enters client password (123414081978); browser receives signed 2-hour JWT
   • Proposal decrypts: trade details, allocation bars, and advance tax calendar displayed
              │
              ▼
[ 5. ADVISORY DISCUSSION & STATUTORY CLARIFICATION ]
   • In-app Mandate Chat clarifies single-stock risk ceiling on Tata Motors
   • ⚠️ Legal boundary: Informal chat dialogue explicitly does NOT constitute trade consent
              │
              ▼
[ 6. STATUTORY ACCEPTANCE & 6-DIGIT OTP AUTHORIZATION ]
   • Explicit acknowledgement of 3 statutory declarations (Reg 19, Tax, Section 65B)
   • 6-digit cryptographic OTP verified (rate-limited, 3 attempts max before lockout)
              │
              ▼
[ 7. ATOMIC REVOCATION & SECTION 65B EVIDENCE LOCK ]
   • Magic token permanently revoked to prevent replay attacks; mandate status = CONSENTED
   • Chained SHA-256 audit record committed (IP, User-Agent, IST timestamp, hash digest)
   • Official Section 65B Compliance Dossier Certificate generated and downloadable"""

    p = tf.paragraphs[0]
    p.text = flow_text
    p.font.name = "Consolas"
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 8: Advisor/RIA Experience (with Existing Screenshots)
    # =========================================================================
    s8 = add_blank_slide()
    add_header(s8, "RIA Interface", "The Advisor (RIA) Experience: Formulation & Control",
               "Real screenshots from Prudent Wealth Advisory's institutional advisory center.")

    # Image Left
    add_image_safe(s8, "docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.")

    # Content Right
    add_card(s8, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s8.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advisor Capabilities & Controls"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Practice Workspace: Scoped view displaying active mandate statuses (Draft, Sent, Viewed, Consented, Expired) with real-time 48-hour countdown badges.\n• Frictionless Client Registry: Client management enforcing PAN syntax ([A-Z]{5}[0-9]{4}[A-Z]) and mobile number formatting.\n• Integrated Rebalance Wizard: Simultaneous formulation of current vs. proposed allocations, sell baskets, buy baskets, and advisory rationale.\n• Instant Emergency Control: Single-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market volatility occurs."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 9: Client Experience (with Existing Screenshots)
    # =========================================================================
    s9 = add_blank_slide()
    add_header(s9, "Client Interface", "The Client Experience: Mobile-First Transparency",
               "Rohan Mehta's proposal review interface designed for executive clarity on smartphones.")

    # Image Left
    add_image_safe(s9, "docs/visual-audit/mandate-security/03_client_mandate_unlocked.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 9.1: Rohan Mehta's unlocked proposal review showing trade allocations and pre-computed tax.")

    # Content Right
    add_card(s9, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s9.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Key Client-Facing Elements"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Zero-Login Convenience: Clients tap the link received via WhatsApp/email without remembering passwords or downloading an app.\n• Allocation Drift Visualization: High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%).\n• Transparent Trade Baskets: Exact share quantities, current market value, ISIN numbers, and transaction rationale displayed clearly.\n• Tax Accountability: Pre-computes exact rupee liability (₹11,440) so the client understands the net financial impact before consenting."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 10: Mandate Security & Password-Protected Access
    # =========================================================================
    s10 = add_blank_slide()
    add_header(s10, "Data Privacy Gate", "Mandate Security: Password-Protected Access Gate",
               "Zero sensitive financial disclosure prior to client authentication.")

    add_image_safe(s10, "docs/visual-audit/mandate-security/02_client_password_required.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 10.1: Client Password Gate on Mobile. Sensitive portfolio holdings remain encrypted until unlocked.")

    add_card(s10, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s10.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "PAN + DOB Password Mechanism"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Zero PII Exposure: If a magic link is forwarded, intercepted, or leaked, the recipient sees only the adviser's firm name. Zero stock holdings or tax figures are emitted.\n• Deterministic Derivation: Password formatted as Last 4 PAN digits + Date of Birth (DDMMYYYY). Example: Rohan's PAN ABCDE1234F + 14/08/1978 = 123414081978.\n• PBKDF2 Key Derivation: The password derives a 256-bit cryptographic key using 100,000 SHA-256 iterations to unwrap the Data Encryption Key (DEK).\n• Brute-Force Rate Limiting: 5 consecutive failed attempts trigger an automatic 15-minute security lockout (HTTP 429)."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 11: Authentication, Authorization & Tenant Isolation
    # =========================================================================
    s11 = add_blank_slide()
    add_header(s11, "Multi-Tenancy & RBAC", "Authentication, Authorization & Tenant Isolation",
               "Architectural barriers guaranteeing strict multi-tenant privacy across advisory practices.")

    add_image_safe(s11, "docs/visual-audit/security/11-cross-ria-denied-foreign-client.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 11.1: Security Test Evidence — Cross-tenant client access attempt rejected with HTTP 403 Forbidden.")

    add_card(s11, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s11.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Tenancy Invariants & Controls"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Firm Tenancy Scoping: Every database query for clients, mandates, and audit logs is strictly partitioned by authenticated firm ID (req.user.firmName).\n• Zero Cross-RIA Data Leakage: RIA 1 attempting to query Client 201 or Mandate 101 of RIA 2 receives an immediate HTTP 403 Forbidden with zero data disclosure.\n• Role-Based Access Control (RBAC): Strict segregation across sebi-ria, hni-client, compliance_officer, admin, and guest personas.\n• Privilege Escalation Defense: Client users navigating to advisor creation or billing routes are intercepted by React Router ProtectedRoute and Express middleware."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 12: Data Security Architecture and Encryption
    # =========================================================================
    s12 = add_blank_slide()
    add_header(s12, "Cryptographic Core", "Data Security Architecture & Dual-Envelope Encryption",
               "Institutional cryptographic defense protecting financial mandates at rest and in transit.")

    # 3 horizontal columns
    col_w = Inches(3.64)
    c1 = add_card(s12, Inches(0.8), Inches(2.0), col_w, Inches(4.6))
    tb = s12.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Payload Encryption"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Algorithm: AES-256-GCM\n• Key: Unique 256-bit random Data Encryption Key (DEK) per mandate.\n• IV: 12-byte random initialization vector.\n• Auth Tag: 16-byte authentication tag ensuring ciphertext integrity and anti-tampering."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s12, Inches(4.84), Inches(2.0), col_w, Inches(4.6))
    tb = s12.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Dual Key Wrapping"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Server Wrapping: DEK encrypted with Server Master Key via AES-256-GCM for RIA dashboard access.\n• Client Wrapping: DEK encrypted with key derived from PBKDF2(PAN_last_4 + DOB, salt, 100,000 rounds).\n• Zero Plaintext: Neither plaintext DEK nor client password stored in DB."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s12, Inches(8.88), Inches(2.0), col_w, Inches(4.6))
    tb = s12.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Transit & Storage"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Magic Token Hashing: 256-bit raw token stored in DB strictly as SHA-256 digest (magicTokenHash).\n• In-Transit Security: Forced TLS 1.3 with Helmet HSTS (1-year max-age).\n• Zero Secret Logs: Passwords, OTPs, and bearer tokens sanitized from all logs."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 13: OTP and Consent Integrity
    # =========================================================================
    s13 = add_blank_slide()
    add_header(s13, "Consent Verification", "OTP & Consent Integrity: Anti-Tamper Authorization",
               "Statutory multi-factor verification guaranteeing explicit non-discretionary consent.")

    add_image_safe(s13, "docs/visual-audit/security/06-client-otp-modal.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 13.1: 6-Digit Mobile OTP Verification Modal with 5-minute statutory countdown.")

    add_card(s13, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s13.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Statutory Authorization Safeguards"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Mandatory Declarations: Clients must actively check 3 statutory declarations (Regulation 19 Informed Consent, Capital Gains Acceptance, Section 65B Electronic Evidence).\n• Dynamic 6-Digit OTP: Generated via CSPRNG with 5-minute Time-To-Live (TTL).\n• Brute-Force Lockout: Maximum 3 verification attempts permitted. A 3rd failed attempt immediately locks verification and burns the token (HTTP 429).\n• Single-Use Atomic Revocation: The instant consent succeeds, the magic token is burned. Re-accessing the URL returns HTTP 410 Gone, preventing replay attacks."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 14: Audit Trail / Compliance Evidence
    # =========================================================================
    s14 = add_blank_slide()
    add_header(s14, "Audit Infrastructure", "Audit Trail & Compliance Evidence: Cryptographic Proof",
               "Chained SHA-256 audit ledger meeting Section 65B and Regulation 19 standards.")

    add_image_safe(s14, "docs/visual-audit/mandate-security/06_consent_locked_evidence.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 14.1: Section 65B Indian Evidence Act Compliance Receipt issued upon successful consent.")

    add_card(s14, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s14.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Legal Admissibility & Hash Chaining"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Forward Hash Chaining: Each log entry hashes the previous record: payloadHash = SHA256(prevHash + timestamp + event + payload). Any retroactive tampering breaks the entire chain.\n• Section 65B Certificate: Captures client device IP (49.36.110.12), browser User-Agent, exact IST timestamp, and masked PAN (AB*****4F).\n• 5-Year Regulatory Preservation: Designed to satisfy SEBI Regulation 19 mandatory 5-year retention requirements.\n• Verified Disaster Recovery: Non-destructive drill restored 1,460 audit logs with zero broken hash links."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 15: Mandate Lifecycle / State Model
    # =========================================================================
    s15 = add_blank_slide()
    add_header(s15, "State Machine", "Mandate Lifecycle & State Model",
               "Strict server-enforced state transitions with zero direct status manipulation.")

    card = add_card(s15, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s15.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True

    state_diag = """                     ┌──────────────────────────────────────────────┐
                     │                                              │
                     ▼                                              │
                ┌─────────┐      RIA Dispatches Link       ┌──────────┐
                │  DRAFT  │ ─────────────────────────────> │   SENT   │
                └─────────┘                                └──────────┘
                     │                                          │
                     │                                          │ Client Inputs
                     │                                          │ PAN + DOB Password
                     │                                          ▼
                     │                                     ┌──────────┐
                     │                                     │  VIEWED  │ (In Review)
                     │                                     └──────────┘
                     │                                          │
                     │                                          │ 1. Accept Declarations
                     │ 48-Hour Cutoff                           │ 2. Verify 6-Digit OTP
                     │ Elapsed                                  ▼
                     │                                     ┌───────────┐
                     └───────────────────────────────────> │ CONSENTED │ (Immutable Lock)
                                                           └───────────┘
                                                                │
                                                                ▼
                                                           ┌───────────┐
                                                           │  REVOKED  │ (Manual RIA Revoke
                                                           └───────────┘  or Expired Link)"""

    p = tf.paragraphs[0]; p.text = state_diag; p.font.name = "Consolas"; p.font.size = Pt(11); p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 16: Mandate-Specific Chat Rail (Why Chat != Consent)
    # =========================================================================
    s16 = add_blank_slide()
    add_header(s16, "Discussion Rail", "Mandate-Specific Chat: Advisory Clarification vs. Consent",
               "Why in-app discussion is vital for client trust, but legally distinct from trade consent.")

    add_image_safe(s16, "docs/visual-audit/mandate-security/04_client_chat_question.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 16.1: Rohan posts an inquiry regarding Tata Motors in the password-protected chat rail.")

    add_card(s16, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s16.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Statutory Separation of Communication & Consent"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Real-Time Contextual Discussion: Allows clients to ask specific allocation or yield questions directly within the mandate context, eliminating scattered WhatsApp threads.\n• Complete Audit Archiving: Every message posted by client or advisor is committed to the immutable audit log under CHAT_MESSAGE_SENT.\n• ⚠️ CHAT DOES NOT CONSTITUTE CONSENT: Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions.\n• Uncompromising Consent Rail: Trade execution strictly requires formal statutory declaration checkboxes followed by 6-digit Mobile OTP verification."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 17: Tax-Impact Transparency & Decision Support
    # =========================================================================
    s17 = add_blank_slide()
    add_header(s17, "Tax Engine", "Tax-Impact Transparency & Client Decision Support",
               "Eliminating investor tax shocks with pre-trade Union Budget 2024 calculations.")

    # Table on left
    add_card(s17, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.6))
    tb = s17.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Union Budget 2024 Statutory Engine"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Short-Term Capital Gains (STCG):\n  20.0% (Section 111A, Income Tax Act)\n  Applied to ₹55,000 gain on Tata Motors = ₹11,000\n\n• Long-Term Capital Gains (LTCG):\n  12.5% (Section 112A, Income Tax Act)\n  Applied above ₹1,25,000 exemption limit.\n  ₹1,25,000 gain on HDFC Bank is 100% exempt = ₹0\n\n• Health & Education Cess: 4% on base tax = ₹440\n\n• Total Rupee Tax Liability: ₹11,440"
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # Advance tax calendar on right
    add_card(s17, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.6))
    tb = s17.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advance Tax Compliance Calendar (Sec 234B & 234C)"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_AMBER
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "When net estimated gains exceed ₹1,00,000, FinConsent automatically generates an Advance Tax Banner detailing quarterly installment deadlines:\n\n• 1st Installment (15%): On or before 15th June\n• 2nd Installment (45%): On or before 15th September\n• 3rd Installment (75%): On or before 15th December\n• 4th Installment (100%): On or before 15th March\n\nProtects clients against 1% monthly statutory penal interest for deferred tax compliance."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 18: Multilingual Localization Capability
    # =========================================================================
    s18 = add_blank_slide()
    add_header(s18, "Accessibility & i18n", "Multilingual Localization: 8 Indian Languages",
               "Delivering advisory transparency in the investor's native language.")

    add_card(s18, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s18.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Multilingual Architecture & Legal Formatting Invariants"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(10)
    p.text = "• 8 Supported Indian Languages: English (en), Hindi (hi), Marathi (mr), Gujarati (gu), Tamil (ta), Telugu (te), Kannada (kn), Bengali (bn).\n• Universal Accessibility: HNIs across Tier 1, 2, and 3 wealth corridors review proposals, disclosures, and receipts in their preferred regional language.\n• Standardized Financial Numerals: Under regulatory standards, all rupee amounts (₹), trade quantities, percentages, and ISIN codes remain strictly in ASCII English numerals across all locales, eliminating ambiguity during legal disputes.\n• Profile Language Selection: Advisers and clients can switch languages seamlessly via navigation bar or profile settings."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 19: Technical Architecture Diagram
    # =========================================================================
    s19 = add_blank_slide()
    add_header(s19, "System Topology", "Technical Architecture Diagram: Security & Service Boundaries",
               "High-level system topology illustrating frontend, API, security engine, and storage tiers.")

    card = add_card(s19, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.8))
    tb = s19.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(11.133), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True

    arch_diag = """┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT & ADVISOR CLIENTS                             │
│   • Desktop Advisory Hub (React 18 / MUI / Vite)       • Mobile Client Review (360px)  │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │ HTTPS / TLS 1.3 (Helmet HSTS)
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             API GATEWAY & SECURITY MIDDLEWARE                          │
│   • Express REST API (Node.js ESM)                     • CORS Strict Whitelist         │
│   • JWT Auth & Distributed Session Blacklist           • Distributed Sliding Rate Limit│
│   • Tenancy Scoping Middleware (Firm Isolation)        • Input Sanitization & Masking  │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             FINCONSENT CORE BUSINESS ENGINES                           │
│   • Mandate State Machine Engine                       • Union Budget 2024 Tax Engine  │
│   • Dual-Envelope AES-256-GCM Crypto Engine            • PBKDF2 Client Key Derivation  │
│   • In-App Mandate Clarification Chat Rail             • OTP Verification & Lockout    │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                               PERSISTENT DATA & AUDIT TIERS                            │
│   • MongoDB Atlas (AWS Mumbai ap-south-1)              • Redis / Cluster SharedState   │
│   • Append-Only SHA-256 Chained Audit Ledger           • Point-in-Time Recovery (PITR) │
└────────────────────────────────────────────────────────────────────────────────────────┘"""

    p = tf.paragraphs[0]; p.text = arch_diag; p.font.name = "Consolas"; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_NAVY

    # =========================================================================
    # SLIDE 20: Security Threat Scenarios & Protections
    # =========================================================================
    s20 = add_blank_slide()
    add_header(s20, "Threat Modeling", "Security Threat Scenarios & Evidenced Protections",
               "Proven runtime boundary enforcement against malicious and accidental vectors.")

    add_image_safe(s20, "docs/visual-audit/security/17-otp-lockout-after-3-failures.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 20.1: Security Test Evidence — OTP lockout engaged after 3 failed verification attempts.")

    add_card(s20, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s20.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Threat Modeling & Defenses"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Credential Stuffing & OTP Brute-Force: Sliding-window rate limiters block rapid bursts; 3 failed OTPs permanently lock the token (HTTP 429).\n• Cross-Tenant IDOR: Tampering with mandate or client UUIDs across RIA practices rejected with HTTP 403 Forbidden.\n• Expired / Replay Attacks: Opening links past the 48-hour cutoff or after successful consent returns HTTP 410 Expired / Revoked.\n• Token Sniffing & Database Breaches: Plaintext magic tokens are never persisted in the database (stored strictly as SHA-256 hashes)."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 21: Operational/Testing/Security Validation
    # =========================================================================
    s21 = add_blank_slide()
    add_header(s21, "Evidence Base", "Operational & Testing Validation: Grounded in Real Runs",
               "Concrete evidence demonstrating zero regressions across automated and browser tests.")

    # 4 metric cards
    w_card = Inches(2.7)
    x_pos = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    metrics = [
        ("200 / 200", "Vitest Tests Passing", "15 automated test suites running across tax calculation, security, RBAC, i18n, and API regressions (100% pass rate).", COLOR_EMERALD),
        ("81 Screenshots", "Browser Visual Audit", "42 baseline, 25 security, and 14 mandate-security screenshots verifying desktop and mobile viewports.", COLOR_INDIGO),
        ("1,460 Records", "Disaster Recovery Drill", "Synthetic non-destructive restore drill verified 1,460 audit logs with zero broken cryptographic hash links.", COLOR_NAVY),
        ("0 Broken Chains", "SHA-256 Integrity", "Full mathematical continuity verified across all state changes, guaranteeing tamper-evident audit records.", COLOR_AMBER)
    ]

    for i, (stat, title, desc, col) in enumerate(metrics):
        x = x_pos[i]
        add_card(s21, x, Inches(2.0), w_card, Inches(4.6))
        tb = s21.shapes.add_textbox(x + Inches(0.2), Inches(2.3), w_card - Inches(0.4), Inches(4.0))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = stat; p.font.bold = True; p.font.size = Pt(22); p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = title; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 22: Deployment/Hosting Architecture
    # =========================================================================
    s22 = add_blank_slide()
    add_header(s22, "Infrastructure", "Deployment & Hosting Architecture: Indian Data Sovereignty",
               "Compliance with SEBI Cybersecurity Framework and RBI data localization mandates.")

    add_card(s22, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s22.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Infrastructure Specifications"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(10)
    p.text = "• Territorial Data Residency: In strict compliance with SEBI and RBI directives, all primary databases, cryptographic keys, and audit ledgers reside exclusively in AWS Asia Pacific (Mumbai) region (ap-south-1).\n• Multi-Stage Production Containers: Multi-stage Docker build packaging optimized Vite static assets and hardened Express Node.js runtime.\n• Orchestration: docker-compose.yml with production environment boundaries and health checks.\n• Zero Third-Party Tracking: Zero external advertising pixels, external analytics beacons, or overseas CDN assets."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 23: Business Value and Measurable Outcomes
    # =========================================================================
    s23 = add_blank_slide()
    add_header(s23, "Business Impact", "Business Value & Measurable Outcomes for Advisory Practices",
               "Quantifiable efficiency, compliance security, and investor satisfaction gains.")

    col_w = Inches(3.64)
    c1 = add_card(s23, Inches(0.8), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "100% Audit Readiness"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Pass SEBI regulatory inspections instantly with downloadable Section 65B compliance dossiers.\n• Eliminate 30+ hours of manual audit trail compilation per quarter.\n• Protect RIA license and principal officers from statutory liability."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s23, Inches(4.84), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Zero Client Tax Shocks"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Complete pre-trade capital gains tax visibility builds deep investor trust.\n• Protect clients from quarterly advance tax penalties (Sections 234B & 234C).\n• Elevate advisory relationship from transaction chasing to strategic planning."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s23, Inches(8.88), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "75% Faster Authorization"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Reduce client consent turnaround from 3–5 days to under 2 hours on mobile.\n• Minimize market slippage during high-volatility rebalancing windows.\n• Seamless 1-click WhatsApp delivery with zero login friction."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 24: Final End-to-End Story: What Changes
    # =========================================================================
    s24 = add_blank_slide()
    add_header(s24, "The Transformation", "The Transformation: What Changes for Advisor and Client",
               "Comparing legacy advisory friction with FinConsent's institutional digital rail.")

    # Comparison Table
    table_shape = s24.shapes.add_table(5, 3, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    table = table_shape.table
    table.columns[0].width = Inches(3.2)
    table.columns[1].width = Inches(4.2)
    table.columns[2].width = Inches(4.333)

    headers = ["Advisory Dimension", "Legacy Process (Informal / Dispersed)", "FinConsent Institutional Digital Rail"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_CARD_BG
        p = cell.text_frame.paragraphs[0]; p.text = h; p.font.bold = True; p.font.size = Pt(11); p.font.color.rgb = COLOR_NAVY

    rows = [
        ("Trade Authorization", "Fragmented WhatsApp texts or email replies; rejected during SEBI inspection.", "Explicit statutory declarations + 6-digit OTP verification with 48h market window."),
        ("Capital Gains Tax", "Post-trade surprise tax bill; penal interest under Sections 234B/C.", "Pre-trade Union Budget 2024 calculation with quarterly advance tax alert."),
        ("Client Security", "Confidential trade details sent over plain WhatsApp or email attachments.", "Dual-envelope AES-256-GCM encryption with PAN+DOB client password gate."),
        ("Audit & Legal Trail", "Scattered screenshots and PDFs; inadmissible under Section 65B.", "Append-only forward SHA-256 ledger emitting certified Section 65B compliance dossier.")
    ]

    for i, (dim, leg, fc) in enumerate(rows):
        r_idx = i + 1
        table.cell(r_idx, 0).text = dim
        table.cell(r_idx, 1).text = leg
        table.cell(r_idx, 2).text = fc
        for c_idx in range(3):
            cell = table.cell(r_idx, c_idx)
            cell.text_frame.paragraphs[0].font.size = Pt(10)
            cell.text_frame.paragraphs[0].font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 25: Closing / Next Steps
    # =========================================================================
    s25 = add_blank_slide()
    add_header(s25, "Next Steps", "Conclusion & Next Steps: Deploying FinConsent",
               "Accelerating advisory compliance, investor trust, and practice scalability.")

    add_card(s25, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s25.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Implementation & Onboarding Path"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(10)
    p.text = "1. Immediate Compliance Upgrade: Onboard RIA practice in under 10 minutes; configure SEBI INA registration number and firm compliance contacts.\n2. Client Roster Migration: Import advisory clients with validated PANs, mobile numbers, and DOB attributes.\n3. Pilot Rebalancing Run: Execute live mandates with select client families to demonstrate pre-trade tax transparency and frictionless mobile OTP consent.\n4. Regulatory Peace of Mind: Rest assured knowing every trade authorization is cryptographically preserved in AWS Mumbai under Section 65B standards."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 26: Appendix A — Cryptographic & Encryption Invariants
    # =========================================================================
    s26 = add_blank_slide()
    add_header(s26, "Appendix A", "Technical Deep-Dive: Cryptographic Invariants & Key Derivation",
               "Formal mathematical specifications for envelope encryption and PBKDF2 KDF.")

    add_card(s26, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s26.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Cryptographic Implementation Specifications"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Cipher: AES-256-GCM (Galois/Counter Mode) with 12-byte random IV and 16-byte authentication tag.\n• Key Derivation Function: PBKDF2 with SHA-256 digest, 100,000 rounds in production (1,000 in test mode), and 16-byte random salt.\n• Key Derivation Input: Normalized string concatenation of PAN last 4 digits + DOB in DDMMYYYY format.\n• Dual Wrapping: Server DEK wrapped with Master Key (JWT_SECRET derived); Client DEK wrapped with Client Derived Key.\n• Invariant: Server never stores client plaintext password or unencrypted DEK in database."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 27: Appendix B — Authorization Matrix & Tenant Isolation Rules
    # =========================================================================
    s27 = add_blank_slide()
    add_header(s27, "Appendix B", "Technical Deep-Dive: Role-Based Authorization & Tenant Scoping",
               "Detailed API permission matrix across all platform roles.")

    table_shape = s27.shapes.add_table(6, 4, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    table = table_shape.table
    table.columns[0].width = Inches(2.8)
    table.columns[1].width = Inches(2.9)
    table.columns[2].width = Inches(3.0)
    table.columns[3].width = Inches(3.033)

    headers = ["API Route / Resource", "RIA (sebi-ria)", "Client (hni-client)", "Compliance (compliance_officer)"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_CARD_BG
        p = cell.text_frame.paragraphs[0]; p.text = h; p.font.bold = True; p.font.size = Pt(10.5); p.font.color.rgb = COLOR_NAVY

    rows = [
        ("/api/mandates (POST / Create)", "ALLOWED (Scoped to firm)", "FORBIDDEN (HTTP 403)", "FORBIDDEN (Read-only)"),
        ("/api/mandates/:id/dispatch", "ALLOWED (Own mandates only)", "FORBIDDEN (HTTP 403)", "FORBIDDEN (Read-only)"),
        ("/api/public/mandates/:t/unlock", "N/A (Uses dashboard)", "ALLOWED (Valid password)", "N/A (Uses compliance hub)"),
        ("/api/public/mandates/:t/verify-otp", "FORBIDDEN", "ALLOWED (Valid 6-digit OTP)", "FORBIDDEN"),
        ("/api/requests (Scrutiny)", "ALLOWED (Submit requests)", "ALLOWED (View own requests)", "ALLOWED (Full Adjudication)")
    ]

    for i, r in enumerate(rows):
        r_idx = i + 1
        for c_idx in range(4):
            cell = table.cell(r_idx, c_idx)
            cell.text = r[c_idx]
            cell.text_frame.paragraphs[0].font.size = Pt(9.5)
            cell.text_frame.paragraphs[0].font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 28: Appendix C — Audit Event Schema & Section 65B Admissibility
    # =========================================================================
    s28 = add_blank_slide()
    add_header(s28, "Appendix C", "Technical Deep-Dive: Audit Schema & Section 65B Admissibility",
               "Evidentiary record structures required by Indian legal standards.")

    add_card(s28, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s28.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Section 65B Electronic Evidence Mandatory Attributes"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "Under the Indian Evidence Act, 1872 and Information Technology Act, 2000, secondary electronic records require:\n\n1. Origin Identification: Client IP Address (e.g. 49.36.110.12) and browser User-Agent recorded at execution time.\n2. Synchronized Timestamp: Server-side NTP timestamping localized to Indian Standard Time (IST).\n3. Hash Integrity Seal: SHA-256 payloadHash computed over the immutable consent certificate.\n4. Device Custody Proof: Evidence that the computer system was operating properly during the record generation.\n5. Regulation 19 Admissibility: Cryptographically chained forward hashes guarantee zero retroactive modifications."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 29: Appendix D — Known Operational Considerations & Roadmap
    # =========================================================================
    s29 = add_blank_slide()
    add_header(s29, "Appendix D", "Operational Considerations & Future Recommendations",
               "Clear demarcation between current implemented state and future roadmap.")

    # Two column comparison
    add_card(s29, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.6))
    tb = s29.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Implemented Production Capabilities"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Full non-discretionary mandate formulation & tax engine.\n• AES-256-GCM dual-envelope encryption & PBKDF2 password gate.\n• 256-bit magic links with SHA-256 database hashing & 48h cutoff.\n• In-app mandate chat with explicit non-consent separation.\n• Section 65B electronic compliance receipts with SHA-256 hash chaining.\n• Multi-tenant isolation, RBAC, TOTP MFA, and distributed rate limiting.\n• 8 Indian languages localization with English numerals."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    add_card(s29, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.6))
    tb = s29.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Future Recommendations / Roadmap"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Production TRAI DLT SMS Gateway: Current setup disables SMS by policy (using email/in-app). Commercial rollout requires onboarding a DLT-registered SMS provider (Twilio/Gupshup).\n• CloudHSM Key Management: Derives Server Master Key from JWT_SECRET; AWS CloudHSM or KMS recommended for institutional banking.\n• Automated Broker API Execution: Halts at locked Section 65B consent dossiers; direct broker execution (Kite/SmartAPI) planned for future phase.\n• External RFC 3161 Time Stamping: Anchoring ledger roots to an external Time Stamping Authority (TSA)."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    # Save to both docs and root
    prs.save(OUTPUT_PPTX)
    prs.save(OUTPUT_PPTX_ROOT)
    print(f"[SUCCESS] Presentation generated successfully: {len(prs.slides)} slides saved to:")
    print(f"  - {OUTPUT_PPTX}")
    print(f"  - {OUTPUT_PPTX_ROOT}")

if __name__ == "__main__":
    create_presentation()

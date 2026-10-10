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
    p.text = "Engineered to support SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, pre-trade capital gains tax transparency under Finance Act 2024, and Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA) tamper-evident electronic evidence."
    p.font.name = FONT_BODY
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_SLATE
    p.space_after = Pt(36)

    # Key highlights row
    add_card(s1, Inches(0.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t1 = s1.shapes.add_textbox(Inches(1.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t1.text_frame.word_wrap = True
    p = t1.text_frame.paragraphs[0]
    p.text = "SEBI Regulation 19 Record-Keeping"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t1.text_frame.add_paragraph()
    p.text = "Operationalizes non-discretionary prior client consent with an immutable 5-year cryptographic audit trail for investment advice and rationale."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    add_card(s1, Inches(4.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t2 = s1.shapes.add_textbox(Inches(5.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t2.text_frame.word_wrap = True
    p = t2.text_frame.paragraphs[0]
    p.text = "Finance Act 2024 Tax Engine"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t2.text_frame.add_paragraph()
    p.text = "Pre-computes STCG (20%) & LTCG (12.5% + 4% cess) with quarterly advance tax alerts (Section 208 / 234C)."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    add_card(s1, Inches(8.8), Inches(4.8), Inches(3.6), Inches(1.8))
    t3 = s1.shapes.add_textbox(Inches(9.0), Inches(5.0), Inches(3.2), Inches(1.4))
    t3.text_frame.word_wrap = True
    p = t3.text_frame.paragraphs[0]
    p.text = "Section 63 BSA Electronic Evidence"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = COLOR_NAVY
    p = t3.text_frame.add_paragraph()
    p.text = "Dual-envelope AES-256-GCM encryption, 6-digit OTP verification, and tamper-evident SHA-256 compliance receipts."
    p.font.size = Pt(10.5)
    p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 2: The Problem Advisors and Clients Face Today
    # =========================================================================
    s2 = add_blank_slide()
    add_header(s2, "Industry Landscape", "The Problem: High-Stakes Friction in Indian Wealth Advisory",
               "Why legacy approval channels fail both advisory practices and high-net-worth investors.")

    col_w = Inches(3.64)
    c1 = add_card(s2, Inches(0.8), Inches(2.0), col_w, Inches(4.6))
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "1. Informal WhatsApp Approvals"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_RED
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Advisers routinely collect approvals via WhatsApp texts, email replies, or unrecorded phone calls.\n• SEBI inspection teams reject informal text messages as non-compliant with Regulation 19 record-keeping rules.\n• Leaves advisers legally exposed to claims of discretionary or unauthorized trading.\n• Inadmissible under Section 63 BSA / Section 65B without certified cryptographic hash continuity and device provenance."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s2, Inches(4.84), Inches(2.0), col_w, Inches(4.6))
    tb = s2.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "2. Capital Gains Tax Shocks"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_AMBER
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Finance Act 2024 revised STCG to 20% and LTCG to 12.5% (+ 4% cess).\n• Rebalancing portfolios triggers significant capital gains without prior investor visibility.\n• Clients are blindsided by unexpected year-end tax liabilities.\n• Advance tax penal interest (Sections 208, 234B & 234C where liability >= ₹10,000) erodes investor trust and fee satisfaction."
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
    p = tf.add_paragraph(); p.text = "Principal Officer & Founder, Prudent Wealth Advisory (SEBI Reg: INA000088921)"; p.font.size = Pt(11); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(12)
    p = tf.add_paragraph()
    p.text = "• Background: Manages ₹180 Crores in AUM across 75 affluent families under a fee-only, non-discretionary advisory model.\n• Challenge: Equity markets surged post-budget; several client portfolios have drifted 15%+ away from risk mandates.\n• Regulatory Obligation: Must recommend selling equities and buying debt and gold ETF, but cannot execute without prior written consent, documented rationale, and 5-year record-keeping under SEBI Regulation 19.\n• Execution Boundary: FinConsent records consent and maintains audit evidence; trade execution is executed separately via client's broker.\n• Note: Illustrative persona for workflow demonstration."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # Persona 2: Client
    add_card(s3, Inches(6.8), Inches(2.0), p_w, Inches(4.6))
    tb = s3.shapes.add_textbox(Inches(7.1), Inches(2.2), p_w - Inches(0.6), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Rohan Mehta"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "HNI Advisory Client | Managing Director, Auto-Tech Firm, Pune (Masked PAN: XXXXX1234F)"; p.font.size = Pt(11); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(12)
    p = tf.add_paragraph()
    p.text = "• Background: Holds a ₹4.2 Crore portfolio. Extremely busy executive who reviews financial proposals on his mobile phone between meetings.\n• Expectation: Values Suresh's advice, but refuses to sign complex paper forms or guess tax liabilities.\n• Need: Demands a frictionless 2-minute mobile authorization flow that clearly explains why securities are being sold and the exact rupee tax liability.\n• Security: Accesses proposal securely via PAN-last-4 + DOB convenience verification PIN defended online by strict rate limiting.\n• Note: Illustrative persona with synthetic credentials."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 4: Why the Current Process Creates Risk and Friction
    # =========================================================================
    s4 = add_blank_slide()
    add_header(s4, "Friction & Risk Analysis", "Why Current Operational Approaches Break Down",
               "Evaluating the systemic vulnerabilities of informal, non-statutory consent channels.")

    card_h = Inches(1.1)
    y_starts = [Inches(1.9), Inches(3.2), Inches(4.5), Inches(5.8)]
    risks = [
        ("SEBI Regulation 19 Compliance Exposure", "Failing to maintain contemporaneous records of investment advice, rationale, and documented client agreement for 5 years leaves advisers vulnerable during mandatory SEBI inspections and dispute resolutions.", COLOR_RED),
        ("Advance Tax Penalties (Sec 208, 234B & 234C)", "Selling equities without advance tax warnings risks 1% monthly penal interest if net tax liability reaches ₹10,000; requires planning under Section 234C capital gains installment relief proviso.", COLOR_AMBER),
        ("Electronic Evidence Inadmissibility (BSA Sec 63 / Sec 65B)", "Under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (and erstwhile Section 65B), raw screenshots lack server hash continuity and device provenance required for court or tribunal admissibility.", COLOR_INDIGO),
        ("Operational Delay & Market Slippage", "Chasing clients across emails and phone calls causes days of delay, during which market prices drift and optimal rebalancing opportunities evaporate.", COLOR_NAVY)
    ]

    for i, (title, desc, color) in enumerate(risks):
        y = y_starts[i]
        add_card(s4, Inches(0.8), y, Inches(11.733), card_h)
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
        ("1. Pre-Trade Tax Transparency", "Dynamic Finance Act 2024 tax engine. Computes STCG (20%) and LTCG (12.5% + 4% cess) in real time, alerting clients to quarterly advance tax deadlines.", COLOR_INDIGO),
        ("2. Dual-Envelope Encryption", "AES-256-GCM encryption with dual key wrapping and isolated server master key. Protects sensitive financial assets until client unlocks via PAN last 4 digits and DOB.", COLOR_NAVY),
        ("3. Secure Mobile Consent Rail", "Direct password-protected 256-bit magic links. 360px responsive mobile layout, mandate clarification chat, and secure email/in-app 6-digit OTP verification.", COLOR_EMERALD),
        ("4. Section 63 BSA Audit Ledger", "Append-only forward SHA-256 hash chaining. Emits digitally fingerprinted Regulation 19 compliance dossiers with IP, user-agent, and IST timestamps.", COLOR_AMBER)
    ]

    for i, (p_title, p_desc, p_col) in enumerate(pillars):
        x = x_positions[i]
        add_card(s5, x, Inches(2.0), p_w, Inches(4.6))
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

    step_w = Inches(2.2)
    step_x = [Inches(0.8), Inches(3.2), Inches(5.6), Inches(8.0), Inches(10.4)]
    steps = [
        ("Phase 1: Drift & Formulation", "Suresh detects 15% equity drift. Drafts ₹11.10L rebalance into corporate debt ETF and Gold ETF (secondary market).", "RIA Workspace"),
        ("Phase 2: Tax Calculation", "Engine calculates ₹11,440 capital gains tax estimate. Generates 48-hour cutoff window and dispatch magic link.", "Tax Engine"),
        ("Phase 3: Secure Delivery", "Delivered via email magic link (WhatsApp on roadmap). Rohan opens link; sensitive data remains encrypted until PAN+DOB unlock.", "Mobile Delivery"),
        ("Phase 4: Review & Chat", "Rohan reviews trade baskets, asks a clarification in mandate chat. Suresh replies; Rohan accepts terms (Chat != Consent).", "Discussion Rail"),
        ("Phase 5: OTP & Evidence", "Rohan verifies 6-digit OTP. Token burned; Section 63 BSA compliance dossier locked immutably (trade execution by broker/client).", "Audit Ledger")
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
    # SLIDE 7: Process Flow Diagram (Regenerated via Graphviz)
    # =========================================================================
    s7 = add_blank_slide()
    add_header(s7, "Process Flow", "Statutory Process Flow Diagram",
               "Deterministic state progression from recommendation to immutable regulatory evidence.")

    add_image_safe(s7, "docs/diagrams/process-flow.png",
                   Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.1),
                   "Figure 7.1: Statutory Process Flow Diagram — SEBI Regulation 19 advisory formulation, Finance Act 2024 tax calculation, OTP authorization, and Section 63 BSA evidence lock.")

    # =========================================================================
    # SLIDE 8: Advisor/RIA Experience (with Existing Screenshots)
    # =========================================================================
    s8 = add_blank_slide()
    add_header(s8, "RIA Interface", "The Advisor (RIA) Experience: Formulation & Control",
               "Real screenshots from Prudent Wealth Advisory's institutional advisory center.")

    add_image_safe(s8, "docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.")

    add_card(s8, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s8.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advisor Capabilities & Controls"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Practice Workspace: Scoped view displaying active mandate statuses (Draft, Sent, Viewed, Consented, Expired, Revoked) with real-time 48-hour countdown badges.\n• Client Registry: Client management enforcing PAN syntax ([A-Z]{5}[0-9]{4}[A-Z]), masked presentation (XXXXX1234F), and mobile number formatting.\n• Integrated Rebalance Wizard: Simultaneous formulation of current vs. proposed allocations, sell baskets, buy baskets, and advisory rationale.\n• Instant Emergency Revocation: Single-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market volatility occurs."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 9: Client Experience (with Existing Screenshots)
    # =========================================================================
    s9 = add_blank_slide()
    add_header(s9, "Client Interface", "The Client Experience: Mobile-First Transparency",
               "Rohan Mehta's proposal review interface designed for executive clarity on smartphones.")

    add_image_safe(s9, "docs/visual-audit/mandate-security/03_client_mandate_unlocked.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 9.1: Rohan Mehta's unlocked proposal review showing trade allocations and pre-computed tax.")

    add_card(s9, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s9.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Key Client-Facing Elements"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Direct Magic Link Convenience: Clients tap the link received via email without remembering complex portal passwords or downloading an app.\n• Allocation Drift Visualization: High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%).\n• Transparent Trade Baskets: Exact share quantities, current market value, ISIN numbers, and transaction rationale displayed clearly (Tata Motors, HDFC Bank -> Bharat Bond, Gold ETF).\n• Tax Accountability: Pre-computes estimated rupee liability (₹11,440) so the client understands the net financial impact before consenting."
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
    p.text = "• Zero PII Exposure Prior to Unlock: If a magic link is forwarded, intercepted, or leaked, the recipient sees only the adviser's firm name. Zero stock holdings or tax figures are emitted.\n• Deterministic Verification PIN: Password formatted as Last 4 PAN digits + Date of Birth (DDMMYYYY). Example: Rohan's PAN XXXXX1234F + 14/08/1978 = 123414081978.\n• PBKDF2 Key Derivation: The password derives a 256-bit cryptographic key using 100,000 SHA-256 iterations to unwrap the Data Encryption Key (DEK).\n• Online & Offline Defenses: Acknowledges finite PIN entropy (~10^12 combinations); defended online by sliding-window rate limiters (5 failed attempts -> 15 min lockout) and offline by salted PBKDF2."
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
    p.text = "• Firm Tenancy Scoping: Every database query for clients, mandates, and audit logs is strictly partitioned by authenticated firm ID (req.user.firmName).\n• Zero Cross-RIA Data Leakage: RIA 1 attempting to query Client or Mandate of RIA 2 receives an immediate HTTP 403 Forbidden with zero data disclosure.\n• Role-Based Access Control (RBAC): Strict segregation across sebi-ria, hni-client, compliance_officer, admin, and guest personas.\n• Privilege Escalation Defense: Client users navigating to advisor creation or billing routes are intercepted by React Router ProtectedRoute and Express middleware."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 12: Data Security Architecture and Encryption
    # =========================================================================
    s12 = add_blank_slide()
    add_header(s12, "Cryptographic Core", "Data Security Architecture & Dual-Envelope Encryption",
               "Institutional cryptographic defense protecting financial mandates at rest and in transit.")

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
    p.text = "• Server Wrapping: DEK encrypted with isolated Server Master Key (SERVER_MASTER_KEY) via AES-256-GCM for RIA dashboard access.\n• Client Wrapping: DEK encrypted with key derived from PBKDF2(PAN_last_4 + DOB, salt, 100,000 rounds).\n• Zero Plaintext: Neither plaintext DEK nor client password stored in DB."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s12, Inches(8.88), Inches(2.0), col_w, Inches(4.6))
    tb = s12.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Transit & Storage"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Magic Token Hashing: 256-bit raw token stored in DB strictly as SHA-256 digest (magicTokenHash).\n• In-Transit Security: Forced TLS 1.3 with Helmet HSTS (1-year max-age: 31,536,000 seconds).\n• Zero Secret Logs: Passwords, OTPs, and bearer tokens sanitized from all logs."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 13: OTP and Consent Integrity
    # =========================================================================
    s13 = add_blank_slide()
    add_header(s13, "Consent Verification", "OTP & Consent Integrity: Anti-Tamper Authorization",
               "Statutory verification guaranteeing explicit non-discretionary consent.")

    add_image_safe(s13, "docs/visual-audit/security/06-client-otp-modal.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 13.1: 6-Digit Mobile OTP Verification Modal with 5-minute statutory countdown.")

    add_card(s13, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s13.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Statutory Authorization Safeguards"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Mandatory Declarations: Clients must actively check 3 statutory declarations (Regulation 19 Informed Consent, Capital Gains Acceptance, Section 63 BSA Electronic Evidence).\n• Dynamic 6-Digit OTP: Generated via CSPRNG with 5-minute Time-To-Live (TTL); delivered via registered email and in-app display (SMS disabled by policy; WhatsApp roadmap).\n• Brute-Force Lockout: Maximum 3 verification attempts permitted. A 3rd failed attempt immediately locks verification and burns the token (HTTP 429).\n• Single-Use Atomic Revocation: The instant consent succeeds, the magic token is burned. Re-accessing the URL returns HTTP 410 Gone, preventing replay attacks."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 14: Audit Trail / Compliance Evidence
    # =========================================================================
    s14 = add_blank_slide()
    add_header(s14, "Audit Infrastructure", "Audit Trail & Compliance Evidence: Cryptographic Proof",
               "Chained SHA-256 audit ledger meeting Section 63 BSA and SEBI Regulation 19 standards.")

    add_image_safe(s14, "docs/visual-audit/mandate-security/06_consent_locked_evidence.png",
                   Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8),
                   "Figure 14.1: Section 63 BSA / Section 65B Compliance Receipt issued upon successful consent.")

    add_card(s14, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.5))
    tb = s14.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.1))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Legal Admissibility & Hash Chaining"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Forward Hash Chaining: Each log entry hashes the previous record: payloadHash = SHA256(prevHash + timestamp + event + payload). Any retroactive tampering breaks the entire chain.\n• Section 63 BSA Certificate: Captures client device IP (RFC 5737 203.0.113.12), browser User-Agent, exact IST timestamp, and masked PAN (XXXXX1234F).\n• 5-Year Regulatory Preservation: Designed to satisfy SEBI Regulation 19 mandatory 5-year retention requirements for investment advice and rationale.\n• Verified Disaster Recovery: Non-destructive drill restored 1,460 audit logs with zero broken hash links."
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

    state_diag = """               ┌────────────────────────────────────────────────────────┐
               │                                                        │
               ▼                                                        │
          ┌─────────┐            RIA Dispatches Link       ┌──────────┐ │
          │  DRAFT  │ ───────────────────────────────────> │   SENT   │ │
          └─────────┘                                      └──────────┘ │
               │                                                │       │
               │                                                │ Client Inputs
               │                                                │ PAN + DOB Password
               │                                                ▼       │
               │                                           ┌──────────┐ │
               │                                           │  VIEWED  │ │ (In Review)
               │                                           └──────────┘ │
               │                                                │       │
               │                                                │ 1. Accept Declarations
               │ 48-Hour Cutoff                                 │ 2. Verify 6-Digit OTP
               │ Elapsed                                        ▼       │
               │                                           ┌───────────┐│
               ├─────────────────────────────────────────> │ CONSENTED ││ (Immutable Lock)
               │                                           └───────────┘│
               │                                                        │
               │ Advisory Revocation / Market Drift                     │
               ▼                                                        │
          ┌─────────┐                                                   │
          │ REVOKED │ <─────────────────────────────────────────────────┘ (Manual RIA Revoke)
          └─────────┘
               ▲
               │ Cutoff Elapsed Prior to Consent
          ┌─────────┐
          │ EXPIRED │ (48h Window Elapsed)
          └─────────┘"""

    p = tf.paragraphs[0]; p.text = state_diag; p.font.name = "Consolas"; p.font.size = Pt(10.5); p.font.color.rgb = COLOR_NAVY

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
    p.text = "• Real-Time Contextual Discussion: Allows clients to ask specific allocation or yield questions directly within the mandate context, eliminating scattered WhatsApp threads.\n• Complete Audit Archiving: Every message posted by client or advisor is committed to the immutable audit log under CHAT_MESSAGE_SENT.\n• ⚠️ CHAT DOES NOT CONSTITUTE CONSENT: Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions.\n• Uncompromising Consent Rail: Trade authorization strictly requires formal statutory declaration checkboxes followed by 6-digit OTP verification."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 17: Tax-Impact Transparency & Decision Support
    # =========================================================================
    s17 = add_blank_slide()
    add_header(s17, "Tax Engine", "Tax-Impact Transparency & Client Decision Support",
               "Eliminating investor tax shocks with pre-trade Finance Act 2024 calculations.")

    add_card(s17, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.6))
    tb = s17.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Finance Act 2024 Statutory Engine"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Short-Term Capital Gains (STCG):\n  20.0% (Section 111A, Income Tax Act)\n  Applied to ₹55,000 gain on Tata Motors = ₹11,000\n\n• Long-Term Capital Gains (LTCG):\n  12.5% (Section 112A, Income Tax Act)\n  Applied above annual aggregate ₹1,25,000 exemption limit.\n  ₹1,25,000 gain on HDFC Bank is exempt = ₹0\n\n• Health & Education Cess: 4% on base tax = ₹440\n\n• Estimated Rupee Tax Liability: ₹11,440\n\n• Tax Disclaimers: Excludes individual surcharges (up to 15% on equity capital gains) and prior carried-forward losses. Decision-support estimate only."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    add_card(s17, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.6))
    tb = s17.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advance Tax Planning & Caveats (Sec 208 & 234C)"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_AMBER
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "Advance tax applies when estimated net annual tax liability reaches or exceeds ₹10,000, displaying statutory installment deadlines:\n\n• 1st Installment (15%): On or before 15th June\n• 2nd Installment (45%): On or before 15th September\n• 3rd Installment (75%): On or before 15th December\n• 4th Installment (100%): On or before 15th March\n\n• Proviso to Section 234C: Relieves penal interest for installments prior to the capital gains realization date if remaining tax is paid in subsequent installments."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 18: Multilingual Localization Capability
    # =========================================================================
    s18 = add_blank_slide()
    add_header(s18, "Accessibility & i18n", "Multilingual Localization Capability: 8 Languages",
               "Delivering advisory transparency in regional and international languages.")

    add_card(s18, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s18.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Multilingual Architecture & Legal Formatting Invariants"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(10)
    p.text = "• 8 Supported Languages: English (en), Hindi (hi), Tamil (ta), Bengali (bn), Gujarati (gu), German (de), Japanese (ja), Korean (ko).\n• Universal Accessibility: HNIs review proposals, disclosures, and receipts in their preferred language.\n• Standardized Financial Numerals: Under regulatory standards, all rupee amounts (₹), trade quantities, percentages, and ISIN codes remain strictly in ASCII English numerals across all locales, eliminating ambiguity during legal disputes.\n• Profile Language Selection: Advisers and clients can switch languages seamlessly via navigation bar or profile settings."
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
│   • JWT Auth & TOTP Staff MFA                          • Distributed Sliding Rate Limit│
│   • Tenancy Scoping Middleware (Firm Isolation)        • Input Sanitization & Masking  │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                             FINCONSENT CORE BUSINESS ENGINES                           │
│   • Mandate State Machine Engine                       • Finance Act 2024 Tax Engine   │
│   • Dual-Envelope AES-256-GCM Crypto Engine            • PBKDF2 Client Key Derivation  │
│   • In-App Mandate Clarification Chat Rail             • OTP Verification & Lockout    │
└───────────────────────────────────────────▲────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                               PERSISTENT DATA & AUDIT TIERS                            │
│   • MongoDB Atlas (AWS Mumbai ap-south-1)              • Dedicated SERVER_MASTER_KEY   │
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
    p.text = "• Credential Stuffing & OTP Brute-Force: Sliding-window rate limiters block rapid bursts; 3 failed OTPs permanently lock the token (HTTP 429).\n• Cross-Tenant IDOR: Tampering with mandate or client UUIDs across RIA practices rejected with HTTP 403 Forbidden.\n• Expired / Replay Attacks: Opening links past the 48-hour cutoff or after successful consent returns HTTP 410 Gone / Revoked.\n• Token Sniffing & Database Breaches: Plaintext magic tokens are never persisted in the database (stored strictly as SHA-256 hashes)."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 21: Operational/Testing/Security Validation
    # =========================================================================
    s21 = add_blank_slide()
    add_header(s21, "Evidence Base", "Operational & Testing Validation: Grounded in Real Runs",
               "Concrete evidence demonstrating zero regressions across automated and browser tests.")

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
               "Compliance with SEBI Cybersecurity Framework (CSCRF) and DPDP directives.")

    add_card(s22, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s22.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Infrastructure Specifications"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(10)
    p.text = "• Territorial Data Residency: In strict compliance with SEBI CSCRF and DPDP Act directives, all primary databases, cryptographic keys, and audit ledgers reside exclusively in AWS Asia Pacific (Mumbai) region (ap-south-1).\n• Multi-Stage Production Containers: Multi-stage Docker build packaging optimized Vite static assets and hardened Express Node.js runtime.\n• Orchestration & Health: Container architecture with production environment boundaries and automated /api/health checks.\n• Key Isolation: Envelope Server Master Key (SERVER_MASTER_KEY) isolated from application authentication secrets (JWT_SECRET).\n• Zero Third-Party Tracking: Zero external advertising pixels, external analytics beacons, or overseas CDN assets, ensuring complete client privacy."
    p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 23: Business Value and Measurable Outcomes
    # =========================================================================
    s23 = add_blank_slide()
    add_header(s23, "Business Impact", "Business Value & Practice Impact for Advisory Firms",
               "Quantifiable efficiency, compliance security, and investor satisfaction gains.")

    col_w = Inches(3.64)
    c1 = add_card(s23, Inches(0.8), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Inspection-Ready Compliance"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Downloadable Section 63 BSA / Section 65B compliance dossiers provide contemporaneous regulatory evidence.\n• Replaces weeks of manual audit trail compilation with instantaneous verification.\n• Safeguards RIA practice and principal officers against claims of unauthorized or discretionary trading."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s23, Inches(4.84), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Pre-Trade Tax Transparency"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Complete pre-trade capital gains tax visibility eliminates investor surprise.\n• Proactively alerts clients to quarterly advance tax obligations under Section 208 and 234C.\n• Elevates advisory relationship from administrative chasing to high-trust strategic wealth planning."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s23, Inches(8.88), Inches(2.0), col_w, Inches(4.6))
    tb = s23.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Streamlined Mobile Turnaround"; p.font.bold = True; p.font.size = Pt(14); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Accelerates client review and consent turnaround to under 2 hours on mobile.\n• Minimizes market slippage during high-volatility rebalancing windows.\n• Secure password-protected magic link delivery without requiring client app installation."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 24: Final End-to-End Story: What Changes
    # =========================================================================
    s24 = add_blank_slide()
    add_header(s24, "The Transformation", "The Transformation: What Changes for Advisor and Client",
               "Comparing legacy advisory friction with FinConsent's institutional digital rail.")

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
        ("Capital Gains Tax", "Post-trade surprise tax bill; penal interest under Sections 208 & 234B/C.", "Pre-trade Finance Act 2024 calculation with quarterly advance tax alert."),
        ("Client Security", "Confidential trade details sent over plain WhatsApp or email attachments.", "Dual-envelope AES-256-GCM encryption with PAN+DOB client password gate."),
        ("Audit & Legal Trail", "Scattered screenshots and PDFs; inadmissible under Section 63 BSA.", "Append-only forward SHA-256 ledger emitting certified Section 63 BSA compliance dossier.")
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
    # SLIDE 25: Appendix A — Cryptographic & Encryption Invariants
    # =========================================================================
    s25 = add_blank_slide()
    add_header(s25, "Appendix A", "Technical Deep-Dive: Cryptographic Invariants & Key Derivation",
               "Formal mathematical specifications for envelope encryption and PBKDF2 KDF.")

    add_card(s25, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s25.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Cryptographic Implementation Specifications"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Cipher: AES-256-GCM (Galois/Counter Mode) with 12-byte random IV and 16-byte authentication tag.\n• Key Derivation Function: PBKDF2 with SHA-256 digest, 100,000 rounds in production (1,000 in test mode), and 16-byte random salt.\n• Key Derivation Input: Normalized string concatenation of PAN last 4 digits + DOB in DDMMYYYY format.\n• Dual Wrapping: Server DEK wrapped with isolated SERVER_MASTER_KEY; Client DEK wrapped with Client Derived Key.\n• Invariant: Server never stores client plaintext password or unencrypted DEK in database."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 26: Appendix B — Authorization Matrix & Tenant Isolation Rules
    # =========================================================================
    s26 = add_blank_slide()
    add_header(s26, "Appendix B", "Technical Deep-Dive: Role-Based Authorization & Tenant Scoping",
               "Detailed API permission matrix across all platform roles.")

    table_shape = s26.shapes.add_table(6, 4, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
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
    # SLIDE 27: Appendix C — Audit Event Schema & Section 63 BSA Admissibility
    # =========================================================================
    s27 = add_blank_slide()
    add_header(s27, "Appendix C", "Technical Deep-Dive: Audit Schema & Section 63 BSA Admissibility",
               "Evidentiary record structures required by Indian legal standards.")

    add_card(s27, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
    tb = s27.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Section 63 BSA Electronic Evidence Mandatory Attributes"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "Under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA) and Section 65B of erstwhile Indian Evidence Act, secondary electronic records require:\n\n1. Origin Identification: Client IP Address (RFC 5737 203.0.113.12) and browser User-Agent recorded at execution time.\n2. Synchronized Timestamp: Server-side NTP timestamping localized to Indian Standard Time (IST).\n3. Hash Integrity Seal: SHA-256 payloadHash computed over the immutable consent certificate.\n4. Device Custody Proof: Evidence that the computer system was operating properly during record generation.\n5. Regulation 19 Admissibility: Cryptographically chained forward hashes guarantee zero retroactive modifications."
    p.font.size = Pt(11); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 28: Appendix D — Known Operational Considerations & Roadmap
    # =========================================================================
    s28 = add_blank_slide()
    add_header(s28, "Appendix D", "Operational Considerations: Implemented State vs. Roadmap",
               "Clear demarcation between current production capabilities and future roadmap milestones.")

    add_card(s28, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.6))
    tb = s28.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Implemented Production Capabilities"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Full non-discretionary mandate formulation & tax engine.\n• AES-256-GCM dual-envelope encryption & PBKDF2 password gate.\n• 256-bit magic links with SHA-256 database hashing & 48h cutoff.\n• In-app mandate chat with explicit non-consent separation.\n• Section 63 BSA electronic compliance receipts with SHA-256 hash chaining.\n• Multi-tenant isolation, RBAC, staff TOTP MFA, and distributed rate limiting.\n• 8 supported languages with English ASCII numerals."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    add_card(s28, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.6))
    tb = s28.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Documented Scope & Future Roadmap"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Production TRAI DLT SMS Gateway: Current setup delivers OTP via email and in-app display (SMS disabled by policy); commercial SMS requires onboarding a TRAI DLT-registered aggregator.\n• WhatsApp Channel Delivery: Currently dispatched via secure email magic links; direct WhatsApp Business API delivery is on the product roadmap.\n• CloudHSM Key Management: Envelope Server Master Key isolated via environment config; AWS CloudHSM or KMS recommended for institutional banking tiers.\n• Direct Broker Execution: FinConsent intentionally halts at locked statutory consent; execution is handled by client/broker terminal (API execution on roadmap).\n• External RFC 3161 Time Stamping: Anchoring ledger roots to an external Time Stamping Authority (TSA)."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    # =========================================================================
    # SLIDE 29: Pilot Proposal, Implementation Timeline & Next Steps
    # =========================================================================
    s29 = add_blank_slide()
    add_header(s29, "Pilot Proposal & Next Steps", "Institutional Pilot Proposal & Implementation Roadmap",
               "Structured 4-week pilot deployment for fee-only advisory practices with verified commercial terms.")

    add_card(s29, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.6))
    tb = s29.shapes.add_textbox(Inches(1.0), Inches(2.2), Inches(5.2), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "4-Week Phased Implementation Roadmap"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Week 1: Practice Setup & Governance Configuration\n  Configure SEBI INA registration number (e.g. INA000088921), firm compliance contacts, and staff TOTP MFA.\n\n• Week 2: Client Roster Ingestion & Masked Verification\n  Import advisory client profiles with validated PAN syntax (XXXXX1234F), DOB attributes, and configure practice rebalancing templates.\n\n• Week 3: Controlled Pilot Rebalancing Run\n  Execute live mandates with 10–25 client families; demonstrate pre-trade tax visibility and frictionless mobile OTP consent.\n\n• Week 4: Compliance Officer Review & Production Rollout\n  Audit Section 63 BSA compliance receipts with firm Compliance Officer; transition full practice to automated FinConsent workflows."
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    add_card(s29, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.6))
    tb = s29.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.2))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Verified Commercial Terms & Pilot Inquiries"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO
    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Verified Pro Practice Tier: ₹2,499 / month (+ 18% GST statutory cess)\n  Includes up to 100 active mandates/month, unlimited client roster, complete tax engine, and statutory 5-year cryptographic audit ledger retention.\n\n• Zero Execution Surcharges: FinConsent charges no basis points (bps) or AUM percentages.\n\n• Synthetic Demonstration Data: All demonstration credentials and client examples are synthetic.\n\n• Practice Inquiries & Pilot Onboarding:\n  Official Inquiries: compliance@finconsent.in\n  Demonstration Workspace: Prudent Wealth Advisory (SEBI Reg: INA000088921)"
    p.font.size = Pt(10.5); p.font.color.rgb = COLOR_SLATE

    # Save to both docs and root
    prs.save(OUTPUT_PPTX)
    prs.save(OUTPUT_PPTX_ROOT)
    print(f"[SUCCESS] Presentation generated successfully: {len(prs.slides)} slides saved to:")
    print(f"  - {OUTPUT_PPTX}")
    print(f"  - {OUTPUT_PPTX_ROOT}")

if __name__ == "__main__":
    create_presentation()

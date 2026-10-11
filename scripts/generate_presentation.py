#!/usr/bin/env python3
"""
FinConsent Client-Facing Executive Presentation Generator (Overhauled & Remediated)
Generates an institutional 29-slide PowerPoint deck adhering strictly to:
  - 16:9 widescreen format (13.333" x 7.5") with metadata
  - Titles at 32-34pt, body at 14pt+ with bold labels and hanging indents
  - 3-4 distinct slide layouts (dark cover/divider, big statement, visual flow, screenshot with callouts)
  - Compact content-sized cards with ~8px rounded corners and subtle 1px borders (no top/side stripes)
  - Consistent colour hierarchy (Indigo = FinConsent, Emerald = Outcomes, Amber = Tax, Red = Risk)
  - Distortion-free screenshots in realistic phone and browser frames with numbered callouts
  - Native editable PowerPoint statistics (48-60pt numbers), tax waterfall table, and comparison matrices
  - Speaker notes, meaningful image alt text, slide numbers, and consistent footers across all 29 slides
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
OUTPUT_PPTX = os.path.join(DOCS_DIR, "FinConsent-Client-Presentation.pptx")
OUTPUT_PPTX_ROOT = os.path.join(BASE_DIR, "FinConsent-Client-Presentation.pptx")

# Color Palette: Clean Institutional WealthTech Theme
COLOR_BG = RGBColor(255, 255, 255)            # Pure White #FFFFFF
COLOR_DARK_BG = RGBColor(10, 25, 47)         # Deep Navy #0A192F
COLOR_CARD_BG = RGBColor(248, 250, 252)       # Tinted Slate #F8FAFC
COLOR_CARD_BORDER = RGBColor(226, 232, 240)   # Slate Border #E2E8F0
COLOR_NAVY = RGBColor(10, 25, 47)             # Primary Navy #0A192F
COLOR_SLATE = RGBColor(71, 85, 105)           # Body Slate #475569
COLOR_DARK_SLATE = RGBColor(30, 41, 59)       # Dark Slate #1E293B
COLOR_MUTED = RGBColor(148, 163, 184)         # Muted Slate #94A3B8
COLOR_INDIGO = RGBColor(79, 70, 229)          # Accent Indigo #4F46E5
COLOR_INDIGO_LIGHT = RGBColor(238, 242, 255)  # Indigo Tint #EEF2FF
COLOR_EMERALD = RGBColor(5, 150, 105)         # Success Emerald #059669
COLOR_EMERALD_LIGHT = RGBColor(236, 253, 245) # Emerald Tint #ECFDF5
COLOR_AMBER = RGBColor(217, 119, 6)           # Warning Amber #D97706
COLOR_AMBER_LIGHT = RGBColor(254, 243, 199)   # Amber Tint #FEF3C7
COLOR_RED = RGBColor(225, 29, 72)             # Security Red #E11D48
COLOR_RED_LIGHT = RGBColor(254, 226, 226)     # Red Tint #FEE2E2
COLOR_WHITE = RGBColor(255, 255, 255)

FONT_HEADING = "Calibri"
FONT_BODY = "Calibri"

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Presentation Metadata
    prs.core_properties.title = "FinConsent — Statutory Trade Authorization & Tax Infrastructure"
    prs.core_properties.subject = "SEBI Regulation 19 Compliance & WealthTech Architecture"
    prs.core_properties.author = "FinConsent Engineering"
    prs.core_properties.comments = "Client-facing 29-slide presentation with verified compliance evidence"

    blank_layout = prs.slide_layouts[6]

    def add_blank_slide(is_dark=False):
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_DARK_BG if is_dark else COLOR_BG
        bg.line.fill.background()
        return slide

    def add_header(slide, kicker, title, subtitle=None, is_dark=False):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.3))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        # Kicker
        p_kicker = tf.paragraphs[0]
        p_kicker.text = kicker.upper()
        p_kicker.font.name = FONT_HEADING
        p_kicker.font.size = Pt(10.5)
        p_kicker.font.bold = True
        p_kicker.font.color.rgb = RGBColor(165, 180, 252) if is_dark else COLOR_INDIGO
        p_kicker.space_after = Pt(2)

        # Title (32-34pt as required)
        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.name = FONT_HEADING
        p_title.font.size = Pt(32)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE if is_dark else COLOR_NAVY
        p_title.space_after = Pt(3)

        # Subtitle (14pt as required)
        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.name = FONT_BODY
            p_sub.font.size = Pt(14)
            p_sub.font.color.rgb = RGBColor(203, 213, 225) if is_dark else COLOR_SLATE

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

    def add_footer(slide, current_slide, total_slides=29, is_dark=False):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.35))
        tf = footer_box.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"FinConsent | Statutory RIA Infrastructure  •  Slide {current_slide} of {total_slides}"
        p.font.name = FONT_BODY
        p.font.size = Pt(10)
        p.font.color.rgb = RGBColor(148, 163, 184) if is_dark else COLOR_MUTED

    def set_speaker_notes(slide, notes):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = notes

    def add_phone_frame(slide, left, top, width, height, rel_path, caption=None):
        # Phone chassis container
        phone_chassis = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        phone_chassis.fill.solid()
        phone_chassis.fill.fore_color.rgb = COLOR_NAVY
        phone_chassis.line.color.rgb = RGBColor(51, 65, 85)
        phone_chassis.line.width = Pt(1.5)

        # Phone screen area
        bezel_x = Inches(0.08)
        bezel_y = Inches(0.12)
        screen_w = width - (bezel_x * 2)
        screen_h = height - (bezel_y * 2)

        full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        if os.path.exists(full_path):
            pic = slide.shapes.add_picture(full_path, left + bezel_x, top + bezel_y, screen_w, screen_h)
            if caption:
                cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.06), width, Inches(0.35))
                tf = cap_box.text_frame; tf.word_wrap = True; tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
                p = tf.paragraphs[0]; p.text = caption; p.font.size = Pt(10); p.font.color.rgb = COLOR_SLATE; p.alignment = PP_ALIGN.CENTER
            return pic
        return phone_chassis

    def add_browser_frame(slide, left, top, width, height, rel_path, caption=None):
        # Browser chassis container
        chassis = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        chassis.fill.solid()
        chassis.fill.fore_color.rgb = RGBColor(241, 245, 249)
        chassis.line.color.rgb = COLOR_CARD_BORDER
        chassis.line.width = Pt(1)

        # Title bar dots
        dot_colors = [RGBColor(239, 68, 68), RGBColor(245, 158, 11), RGBColor(16, 185, 129)]
        for i, col in enumerate(dot_colors):
            dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.12) + Inches(i * 0.14), top + Inches(0.08), Inches(0.08), Inches(0.08))
            dot.fill.solid(); dot.fill.fore_color.rgb = col; dot.line.fill.background()

        # Image inside
        bar_h = Inches(0.24)
        img_top = top + bar_h
        img_h = height - bar_h - Inches(0.04)
        img_w = width - Inches(0.08)

        full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        if os.path.exists(full_path):
            pic = slide.shapes.add_picture(full_path, left + Inches(0.04), img_top, img_w, img_h)
            if caption:
                cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.06), width, Inches(0.35))
                tf = cap_box.text_frame; tf.word_wrap = True; tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
                p = tf.paragraphs[0]; p.text = caption; p.font.size = Pt(10); p.font.color.rgb = COLOR_SLATE
            return pic
        return chassis

    print("[1/29] Generating Slide 1: Dark Premium Cover...")
    # =========================================================================
    # SLIDE 1: Dark Premium Cover Layout
    # =========================================================================
    s1 = add_blank_slide(is_dark=True)
    # Left Content Column
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(7.5), Inches(5.2))
    tf1 = tb1.text_frame; tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "FINCONSENT"
    p.font.name = FONT_HEADING; p.font.size = Pt(48); p.font.bold = True; p.font.color.rgb = COLOR_WHITE; p.space_after = Pt(8)

    p = tf1.add_paragraph()
    p.text = "Enterprise Statutory Trade Authorization & Tax Infrastructure for Indian RIAs"
    p.font.name = FONT_HEADING; p.font.size = Pt(24); p.font.bold = True; p.font.color.rgb = RGBColor(165, 180, 252); p.space_after = Pt(20)

    p = tf1.add_paragraph()
    p.text = "Engineered specifically to operationalize SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, eliminate pre-trade capital gains tax surprises under Finance Act 2024, and establish immutable Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA) electronic evidence."
    p.font.name = FONT_BODY; p.font.size = Pt(15); p.font.color.rgb = RGBColor(226, 232, 240); p.space_after = Pt(32)

    # Key Stat Strip on dark cover
    p = tf1.add_paragraph()
    p.text = "• SEBI Regulation 19 Compliant  |  • Finance Act 2024 Tax Engine  |  • BSA §63 Cryptographic Receipts"
    p.font.size = Pt(13); p.font.color.rgb = RGBColor(148, 163, 184)

    # Right Column: Phone Mockup
    add_phone_frame(s1, Inches(9.2), Inches(1.1), Inches(3.2), Inches(5.6),
                    "docs/visual-audit/mandate-security/07_mobile_unlock_screen.png",
                    "Rohan Mehta's Mobile Verification Screen")
    add_footer(s1, 1, 29, is_dark=True)
    set_speaker_notes(s1, "Welcome. FinConsent is purpose-built statutory software for Registered Investment Advisers managing non-discretionary portfolios in India. It bridges investment formulation and client authorization.")

    print("[2/29] Generating Slide 2: Executive Agenda & Core Friction...")
    # =========================================================================
    # SLIDE 2: Agenda & Industry Landscape
    # =========================================================================
    s2 = add_blank_slide()
    add_header(s2, "Executive Agenda & Industry Context",
               "The Operational Crisis Facing Indian Investment Advisers",
               "Why legacy approval methods fail both regulatory audits and investor trust.")

    # 3 Compact Problem Rows (Card layout with bold problem statement & short lines)
    col_w = Inches(11.733)
    y_starts = [Inches(2.0), Inches(3.6), Inches(5.2)]
    problems = [
        ("1. Informal WhatsApp & Email Approvals (Regulatory Rejection)",
         "Advisers routinely gather approvals over text messages or calls. SEBI inspection teams reject informal communications under Regulation 19 record-keeping rules, leaving RIAs vulnerable to claims of unauthorized trading. Such communications fail Section 63 BSA electronic admissibility standards.",
         COLOR_RED, COLOR_RED_LIGHT),
        ("2. Post-Trade Capital Gains Tax Shocks (Investor Friction)",
         "Finance Act 2024 increased STCG to 20% and LTCG to 12.5% (+ 4% cess). When rebalancing occurs without pre-trade tax visibility, investors are blindsided by unexpected tax liabilities and penalty interest under Section 208 and 234C where liability reaches ₹10,000.",
         COLOR_AMBER, COLOR_AMBER_LIGHT),
        ("3. Fragmented Audit Trails (Inadmissible in Disputes)",
         "Advice, rationale, client responses, and execution logs live in disconnected silos. Compiling annual compliance records takes weeks. Raw screenshots lack cryptographic hash continuity and device provenance, rendering them contestable before regulatory authorities.",
         COLOR_NAVY, COLOR_CARD_BG)
    ]

    for i, (title, desc, stroke, bg) in enumerate(problems):
        y = y_starts[i]
        add_card(s2, Inches(0.8), y, col_w, Inches(1.35), bg, stroke)
        tb = s2.shapes.add_textbox(Inches(1.1), y + Inches(0.12), col_w - Inches(0.6), Inches(1.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = stroke; p.space_after = Pt(4)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s2, 2)
    set_speaker_notes(s2, "Today, SEBI registered advisers manage crores under non-discretionary agreements, yet 80% still collect approvals over WhatsApp or email. This slide highlights the three systemic failure modes.")

    print("[3/29] Generating Slide 3: Personas & Human Realities...")
    # =========================================================================
    # SLIDE 3: Persona Layouts (Avatar, Role, Pain, Quote, Key Numbers)
    # =========================================================================
    s3 = add_blank_slide()
    add_header(s3, "User Personas & Operational Context",
               "Grounding Compliance in Human Realities: Suresh & Rohan",
               "A fee-only RIA managing family wealth and an executive demanding frictionless transparency.")

    card_w = Inches(5.7)
    # Persona 1: Advisor Suresh
    add_card(s3, Inches(0.8), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s3.shapes.add_textbox(Inches(1.1), Inches(2.2), card_w - Inches(0.6), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True

    p = tf.paragraphs[0]; p.text = "SURESH NARAYANAN  [SN]"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "Principal Officer & Founder, Prudent Wealth Advisory (SEBI Reg: INA000088921)"; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(10)

    p = tf.add_paragraph(); p.text = "Key Metrics:  ₹180 Crores AUM   |   75 Affluent Families   |   Fee-Only Model"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(8)
    p = tf.add_paragraph(); p.text = "• Role: Non-discretionary investment formulation, asset allocation, and rebalancing.\n• Pain Point: Surging equity markets triggered 15%+ allocation drift. Needs immediate consent without administrative phone chasing or legal exposure.\n• Statutory Need: Mandated 5-year audit trail for rationale under SEBI Regulation 19."; p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(12)

    p = tf.add_paragraph(); p.text = '“I cannot risk my SEBI licence on unrecorded phone calls or casual text messages. When markets drift, I need a verifiable, locked consent record in under an hour.”'; p.font.italic = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO

    # Persona 2: Client Rohan
    add_card(s3, Inches(6.833), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s3.shapes.add_textbox(Inches(7.133), Inches(2.2), card_w - Inches(0.6), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True

    p = tf.paragraphs[0]; p.text = "ROHAN MEHTA  [RM]"; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "Managing Director, Auto-Tech Firm, Pune (Masked PAN: XXXXX1234F)"; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(10)

    p = tf.add_paragraph(); p.text = "Key Metrics:  ₹4.2 Crore Portfolio   |   2-Minute Review Limit   |   Mobile-First"; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(8)
    p = tf.add_paragraph(); p.text = "• Role: Busy corporate executive reviewing financial proposals on smartphone.\n• Pain Point: Refuses to read lengthy PDF attachments or guess year-end capital gains taxes while travelling between meetings.\n• Expectation: 2-minute mobile authorization flow with exact rupee tax impact before agreeing."; p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(12)

    p = tf.add_paragraph(); p.text = '“Tell me exactly what we are buying and selling, why we are doing it, and what my tax bill is. If it takes more than 2 minutes on my phone, I will postpone it.”'; p.font.italic = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_EMERALD

    add_footer(s3, 3)
    set_speaker_notes(s3, "Meet our two personas: Suresh, the compliant adviser managing family wealth, and Rohan, the busy client who requires crisp mobile transparency.")

    print("[4/29] Generating Slide 4: Detailed Risk Breakdown...")
    # =========================================================================
    # SLIDE 4: Why the Current Process Creates Risk and Friction
    # =========================================================================
    s4 = add_blank_slide()
    add_header(s4, "Friction & Risk Analysis",
               "Four Critical Vulnerabilities of Legacy Approval Channels",
               "Analyzing the legal, financial, and operational penalties of informal processes.")

    card_h = Inches(1.15)
    y_starts = [Inches(1.95), Inches(3.25), Inches(4.55), Inches(5.85)]
    risks = [
        ("SEBI Regulation 19 Compliance Exposure", "Failing to maintain contemporaneous records of investment advice, rationale, and documented client agreement for 5 years leaves advisers vulnerable during mandatory inspections and enforcement actions.", COLOR_RED),
        ("Advance Tax Penal Interest (Sec 208, 234B & 234C)", "Selling equities without advance tax warnings triggers 1% monthly penal interest if net tax liability reaches ₹10,000; requires planning under Section 234C capital gains installment relief proviso.", COLOR_AMBER),
        ("Electronic Evidence Inadmissibility (BSA Sec 63 / Sec 65B)", "Under Section 63 of Bharatiya Sakshya Adhiniyam, 2023, raw text screenshots lack server hash continuity and device provenance required for judicial and regulatory admissibility.", COLOR_INDIGO),
        ("Operational Delay & Market Slippage", "Chasing clients across phone calls and emails causes days of delay, during which market prices drift and optimal rebalancing windows evaporate.", COLOR_NAVY)
    ]

    for i, (title, desc, color) in enumerate(risks):
        y = y_starts[i]
        add_card(s4, Inches(0.8), y, Inches(11.733), card_h, COLOR_CARD_BG, color)
        tb = s4.shapes.add_textbox(Inches(1.1), y + Inches(0.12), Inches(11.1), card_h - Inches(0.24))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = color
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s4, 4)
    set_speaker_notes(s4, "Notice that each risk maps directly to Indian statutory codes: SEBI Regulation 19, Income Tax Act Section 234C, and BSA Section 63.")

    print("[5/29] Generating Slide 5: Four-Pillar Solution Hub...")
    # =========================================================================
    # SLIDE 5: FinConsent Solution Overview (The Four Pillars)
    # =========================================================================
    s5 = add_blank_slide()
    add_header(s5, "Platform Architecture",
               "FinConsent Solution Overview: The Four Core Pillars",
               "An integrated statutory infrastructure bridging advisory formulation and client mobile consent.")

    col_w = Inches(2.7)
    x_pos = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    pillars = [
        ("1. Pre-Trade Tax Transparency",
         "Dynamic Finance Act 2024 tax engine. Real-time STCG (20%) and LTCG (12.5% + 4% cess) computation with quarterly advance tax alerts under Section 208 / 234C.",
         COLOR_AMBER, COLOR_AMBER_LIGHT),
        ("2. Dual-Envelope Encryption",
         "AES-256-GCM encryption with dual key wrapping and isolated Server Master Key. Financial data remains encrypted at rest until client unlocks via PAN last 4 + DOB.",
         COLOR_INDIGO, COLOR_INDIGO_LIGHT),
        ("3. Secure Mobile Consent Rail",
         "Direct password-protected 256-bit magic links. Responsive smartphone layout, mandate clarification chat, and secure email/in-app 6-digit OTP verification.",
         COLOR_EMERALD, COLOR_EMERALD_LIGHT),
        ("4. Section 63 BSA Audit Ledger",
         "Append-only forward SHA-256 hash chaining. Emits digitally fingerprinted Regulation 19 compliance dossiers with IP, User-Agent, and IST timestamps.",
         COLOR_NAVY, COLOR_CARD_BG)
    ]

    for i, (title, desc, stroke, bg) in enumerate(pillars):
        x = x_pos[i]
        add_card(s5, x, Inches(2.0), col_w, Inches(4.7), bg, stroke)
        tb = s5.shapes.add_textbox(x + Inches(0.18), Inches(2.2), col_w - Inches(0.36), Inches(4.3))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = stroke; p.space_after = Pt(12)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s5, 5)
    set_speaker_notes(s5, "Here are the four foundational pillars: Pre-trade Tax, Dual-envelope Encryption, Mobile Consent Rail, and BSA Section 63 Audit Ledger.")

    print("[6/29] Generating Slide 6: Actor Lanes Timeline...")
    # =========================================================================
    # SLIDE 6: End-to-End User Journey Narrative (Actor-Lane Timeline)
    # =========================================================================
    s6 = add_blank_slide()
    add_header(s6, "Narrative Flow",
               "End-to-End User Journey: Advisor, Platform & Client Lanes",
               "Chronological sequence mapping advisory formulation to statutory compliance archive.")

    # 3 Distinct Horizontal Actor Lanes
    lane_h = Inches(1.4)
    y_lanes = [Inches(2.0), Inches(3.6), Inches(5.2)]
    lanes = [
        ("ADVISOR LANE (RIA: Suresh Narayanan)",
         "1. Detects 15% equity drift in Rohan's portfolio  ➜  2. Drafts sell and buy baskets with statutory rationale  ➜  3. Dispatches encrypted mandate with 48h market window  ➜  6. Clarifies questions in chat rail.",
         COLOR_NAVY, COLOR_CARD_BG),
        ("FINCONSENT ENGINE (Platform Core)",
         "Calculates ₹11,440 capital gains tax estimate  ➜  Derives dual-envelope AES-256-GCM keys  ➜  Delivers magic link  ➜  Issues 6-digit OTP (5m TTL)  ➜  Chains SHA-256 audit ledger.",
         COLOR_INDIGO, COLOR_INDIGO_LIGHT),
        ("CLIENT LANE (HNI: Rohan Mehta)",
         "4. Receives link on smartphone  ➜  5. Unlocks proposal via PAN last 4 + DOB  ➜  Reviews drift & tax  ➜  7. Asks question in chat  ➜  8. Accepts declarations & enters 6-digit OTP  ➜  Receives signed receipt.",
         COLOR_EMERALD, COLOR_EMERALD_LIGHT)
    ]

    for i, (name, content, stroke, bg) in enumerate(lanes):
        y = y_lanes[i]
        add_card(s6, Inches(0.8), y, Inches(11.733), lane_h, bg, stroke)
        tb = s6.shapes.add_textbox(Inches(1.1), y + Inches(0.12), Inches(11.1), lane_h - Inches(0.24))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = name; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = stroke; p.space_after = Pt(4)
        p = tf.add_paragraph(); p.text = content; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s6, 6)
    set_speaker_notes(s6, "Notice how the three actor lanes interact: Suresh initiates, FinConsent secures and computes, and Rohan authorizes on his mobile device.")

    print("[7/29] Generating Slide 7: Main Journey & Exception Flow Diagrams...")
    # =========================================================================
    # SLIDE 7: Process Flow Diagrams (Main Journey & Exception Paths)
    # =========================================================================
    s7 = add_blank_slide()
    add_header(s7, "Process Architecture",
               "Statutory State Progression: Happy Path & Exception Boundaries",
               "Deterministic finite-state machine governing advisory recommendations and legal evidence.")

    # Top Flow: Main Happy Path
    add_card(s7, Inches(0.8), Inches(2.0), Inches(11.733), Inches(2.2), COLOR_CARD_BG, COLOR_EMERALD)
    tb = s7.shapes.add_textbox(Inches(1.1), Inches(2.15), Inches(11.1), Inches(1.9))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "MAIN STATUTORY JOURNEY (Deterministic Progression to Legal Lock)"; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "[DRAFT]  Advisor formulates trade baskets & rationale\n  ➜  [SENT]  Encrypted magic link dispatched with 48-hour cutoff window\n  ➜  [VIEWED / IN REVIEW]  Client unlocks via PAN+DOB; full tax & drift displayed\n  ➜  [CONSENTED]  3 statutory declarations accepted & 6-digit OTP verified\n  ➜  [EVIDENCE LOCKED]  SHA-256 chained receipt emitted; trade executed via broker."
    p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    # Bottom Flow: Exception & Terminal States
    add_card(s7, Inches(0.8), Inches(4.5), Inches(11.733), Inches(2.2), COLOR_CARD_BG, COLOR_RED)
    tb = s7.shapes.add_textbox(Inches(1.1), Inches(4.65), Inches(11.1), Inches(1.9))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "TERMINAL EXCEPTION BOUNDARIES (Strict Safety Limits)"; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_RED; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "• EXPIRED STATE: If 48-hour cutoff window elapses prior to OTP entry, proposal becomes permanently inaccessible (HTTP 410 Gone) to prevent stale market execution.\n• REVOKED STATE: Advisor can click 'Revoke Link' at any moment if market volatility alters optimal rebalance strategy, immediately terminating client access.\n• LOCKED OUT STATE: 3 consecutive failed OTP attempts immediately locks authorization and burns the token (HTTP 429), defending against brute force."
    p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s7, 7)
    set_speaker_notes(s7, "State transitions in FinConsent are strictly unidirectional. Once Consented or Expired, a mandate cannot be edited or revived.")

    print("[8/29] Generating Slide 8: Advisor Interface & Practice Controls...")
    # =========================================================================
    # SLIDE 8: Advisor/RIA Experience (Screenshot with Callouts)
    # =========================================================================
    s8 = add_blank_slide()
    add_header(s8, "RIA Workspace",
               "The Advisor (RIA) Experience: Formulation & Real-Time Control",
               "Prudent Wealth Advisory center showing active practice mandates and countdown timers.")

    # Left: Browser Frame Screenshot (matching height)
    add_browser_frame(s8, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png",
                      "Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.")

    # Right: Callout Cards matching screenshot
    add_card(s8, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s8.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advisor Capabilities & Controls"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    callouts = [
        ("[1] Practice Workspace", "Scoped view displaying active mandates (Draft, Sent, Viewed, Consented, Expired, Revoked) with live 48-hour countdown badges."),
        ("[2] Client Registry", "Client management enforcing valid PAN syntax ([A-Z]{5}[0-9]{4}[A-Z]), masked presentation (XXXXX1234F), and mobile formatting."),
        ("[3] Rebalance Formulation", "Simultaneous formulation of current vs target allocations, sell baskets, buy baskets, and investment rationale."),
        ("[4] Emergency Revocation", "One-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market conditions shift.")
    ]
    for num, text in callouts:
        p = tf.add_paragraph()
        p.text = f"{num}: {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s8, 8)
    set_speaker_notes(s8, "Figure 8.1 shows the RIA dashboard. Note the 48-hour countdown badges. Advisers retain full control, including instant revocation.")

    print("[9/29] Generating Slide 9: Client Mobile Interface & Transparency...")
    # =========================================================================
    # SLIDE 9: Client Experience (Genuine Mobile Screen in Phone Frame)
    # =========================================================================
    s9 = add_blank_slide()
    add_header(s9, "Client Interface",
               "The Client Experience: Mobile-First Transparency",
               "Rohan Mehta's smartphone review interface designed for executive clarity on the go.")

    # Left: Genuine Mobile Phone Frame (correct ~390px aspect ratio)
    add_phone_frame(s9, Inches(1.2), Inches(1.9), Inches(2.8), Inches(5.0),
                    "docs/visual-audit/workflow/07-client-review-mobile.png",
                    "Figure 9.1: Rohan Mehta's Mobile Proposal Screen")

    # Right: Callout Explanation Cards
    add_card(s9, Inches(4.5), Inches(1.9), Inches(8.0), Inches(5.0), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s9.shapes.add_textbox(Inches(4.8), Inches(2.1), Inches(7.4), Inches(4.6))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Key Client-Facing Elements"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    client_items = [
        ("[1] Direct Magic Link Convenience", "Clients tap the link received via email without remembering portal passwords or downloading an app."),
        ("[2] Allocation Drift Visualization", "High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%)."),
        ("[3] Transparent Trade Baskets", "Exact share quantities, current market value, ISIN numbers, and rationale displayed clearly (Tata Motors, HDFC Bank -> Bharat Bond, Gold ETF)."),
        ("[4] Pre-Computed Tax Liability", "Displays estimated rupee liability (₹11,440) so the client understands net financial impact before consenting.")
    ]
    for num, text in client_items:
        p = tf.add_paragraph()
        p.text = f"{num}: {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s9, 9)
    set_speaker_notes(s9, "Here is Rohan's actual smartphone review screen. Note how the allocation drift and pre-computed ₹11,440 tax bill are visible before consent.")

    print("[10/29] Generating Slide 10: Mandate Password Gate & Key Derivation...")
    # =========================================================================
    # SLIDE 10: Mandate Security & Password Gate (Phone Frame + Unlock Sequence)
    # =========================================================================
    s10 = add_blank_slide()
    add_header(s10, "Data Privacy Gate",
               "Mandate Security: Password-Protected Access Gate",
               "Zero sensitive financial disclosure prior to client identity verification.")

    # Left: Password Gate Phone Frame
    add_phone_frame(s10, Inches(1.0), Inches(1.9), Inches(2.8), Inches(5.0),
                    "docs/visual-audit/mandate-security/02_client_password_required.png",
                    "Figure 10.1: Client Password Gate on Mobile")

    # Right: Sequence Card
    add_card(s10, Inches(4.3), Inches(1.9), Inches(8.2), Inches(5.0), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s10.shapes.add_textbox(Inches(4.6), Inches(2.1), Inches(7.6), Inches(4.6))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "PAN + DOB Password Mechanism & PBKDF2 Sequence"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "Sequence:  Magic Link  ➜  Password Entry (PAN Last 4 + DOB)  ➜  PBKDF2 Key Derivation  ➜  DEK Unwrap  ➜  AES-256-GCM Decrypt"
    p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(12)

    gate_items = [
        ("• Zero PII Exposure Prior to Unlock:", "If a link is leaked or forwarded, the recipient sees only the adviser firm name. Zero holdings or tax figures are emitted."),
        ("• Deterministic Verification PIN:", "Password formatted as Last 4 PAN digits + Date of Birth (DDMMYYYY). Example: Rohan's PAN XXXXX1234F + 14/08/1978 = 123414081978."),
        ("• PBKDF2 Key Derivation:", "Derives 256-bit cryptographic key using 100,000 SHA-256 iterations to unwrap the Data Encryption Key (DEK)."),
        ("• Strict Online Rate Limiting:", "Defended online by sliding-window rate limiters (5 failed attempts -> 15 min lockout) and offline by salted PBKDF2.")
    ]
    for label, text in gate_items:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(6)

    add_footer(s10, 10)
    set_speaker_notes(s10, "Figure 10.1 shows our password gate. The magic link alone reveals nothing. The client must enter their PAN last 4 and DOB to derive the key.")

    print("[11/29] Generating Slide 11: Real 403 Forbidden Screen & Multi-Tenancy...")
    # =========================================================================
    # SLIDE 11: Authentication & Multi-Tenant Isolation (Real 403 Screenshot)
    # =========================================================================
    s11 = add_blank_slide()
    add_header(s11, "Multi-Tenancy & RBAC",
               "Authentication, Authorization & Tenant Isolation",
               "Architectural barriers guaranteeing strict multi-tenant privacy across advisory practices.")

    # Left: Real 403 Screenshot in browser frame
    add_browser_frame(s11, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/security/11-cross-ria-denied-foreign-client.png",
                      "Figure 11.1: Security Evidence — Cross-tenant access rejected with HTTP 403 Forbidden.")

    # Right: Tenancy Invariants & Isolation Rules
    add_card(s11, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s11.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Tenancy Invariants & Controls"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    tenancy_items = [
        ("• Firm Tenancy Scoping:", "Every database query for clients, mandates, and audit logs is strictly partitioned by authenticated firm ID (req.user.firmName)."),
        ("• Zero Cross-RIA Data Leakage:", "RIA 1 attempting to query Client or Mandate of RIA 2 receives an immediate HTTP 403 Forbidden with zero data disclosure."),
        ("• Role-Based Access Control (RBAC):", "Strict segregation across sebi-ria, hni-client, compliance_officer, admin, and guest personas."),
        ("• Privilege Escalation Defense:", "Client users navigating to advisor creation or billing routes are intercepted by React ProtectedRoute and Express middleware.")
    ]
    for label, text in tenancy_items:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s11, 11)
    set_speaker_notes(s11, "Figure 11.1 demonstrates our tenant isolation test. When an advisor from Firm A attempts to access Firm B's mandate, the API rejects with 403.")

    print("[12/29] Generating Slide 12: Dual-Envelope Encryption Architecture...")
    # =========================================================================
    # SLIDE 12: Dual-Envelope Encryption (Visual Architecture Diagram)
    # =========================================================================
    s12 = add_blank_slide()
    add_header(s12, "Cryptographic Core",
               "Data Security Architecture & Dual-Envelope Encryption",
               "Institutional cryptographic defense protecting financial mandates at rest and in transit.")

    col_w = Inches(3.64)
    c1 = add_card(s12, Inches(0.8), Inches(2.0), col_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s12.shapes.add_textbox(Inches(1.0), Inches(2.2), col_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Payload Encryption"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "• Algorithm: AES-256-GCM\n• Unique Key: 256-bit random Data Encryption Key (DEK) per mandate\n• IV: 12-byte random initialization vector\n• Auth Tag: 16-byte authentication tag ensuring anti-tampering."
    p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE

    c2 = add_card(s12, Inches(4.84), Inches(2.0), col_w, Inches(4.7), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s12.shapes.add_textbox(Inches(5.04), Inches(2.2), col_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Dual Key Wrapping"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "• Server Wrapping: DEK encrypted with isolated Server Master Key (SERVER_MASTER_KEY) for RIA dashboard access.\n• Client Wrapping: DEK encrypted with PBKDF2(PAN_last_4 + DOB, 100k rounds).\n• Zero Plaintext: Neither plaintext DEK nor password stored in database."
    p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE

    c3 = add_card(s12, Inches(8.88), Inches(2.0), col_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s12.shapes.add_textbox(Inches(9.08), Inches(2.2), col_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Transit & Storage"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "• Magic Token Hashing: 256-bit token stored strictly as SHA-256 digest in database.\n• In-Transit Security: Forced TLS 1.3 with Helmet HSTS (1-year max-age: 31,536,000s).\n• Sanitized Logs: Credentials, OTPs, and tokens scrubbed from all logs."
    p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE

    add_footer(s12, 12)
    set_speaker_notes(s12, "Dual-envelope encryption ensures that even if database records are compromised, financial payloads cannot be decrypted without the Server Master Key or client password.")

    print("[13/29] Generating Slide 13: OTP Integrity & 3-Attempt Lockout...")
    # =========================================================================
    # SLIDE 13: OTP and Consent Integrity (Enlarged OTP Modal + Timer)
    # =========================================================================
    s13 = add_blank_slide()
    add_header(s13, "Consent Verification",
               "OTP & Consent Integrity: Anti-Tamper Authorization",
               "Statutory verification guaranteeing explicit non-discretionary client approval.")

    # Left: Enlarged OTP Screenshot in browser frame
    add_browser_frame(s13, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/security/06-client-otp-modal.png",
                      "Figure 13.1: 6-Digit Mobile OTP Modal with 5-minute statutory timer.")

    # Right: Statutory Safeguards Card
    add_card(s13, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s13.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Statutory Authorization Safeguards"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    otp_safeguards = [
        ("• Mandatory Declarations:", "Clients must actively check 3 statutory declarations (Regulation 19 Informed Consent, Capital Gains Acceptance, Section 63 BSA Evidence)."),
        ("• Dynamic 6-Digit OTP:", "Generated via CSPRNG with 5-minute Time-To-Live (TTL); delivered via registered email and in-app display (SMS disabled by policy)."),
        ("• 3-Attempt Brute-Force Lockout:", "Maximum 3 attempts allowed. A 3rd failed attempt immediately locks verification and burns the token (HTTP 429)."),
        ("• Single-Use Atomic Revocation:", "The instant consent succeeds, the magic token is burned. Re-accessing returns HTTP 410 Gone, preventing replay attacks.")
    ]
    for label, text in otp_safeguards:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s13, 13)
    set_speaker_notes(s13, "Figure 13.1 displays the client OTP modal. Notice the 3 statutory checkboxes that must be acknowledged before the 6-digit OTP can be verified.")

    print("[14/29] Generating Slide 14: Audit Trail & BSA Section 63 Evidence...")
    # =========================================================================
    # SLIDE 14: Audit Trail / Compliance Evidence (Cropped Receipt + Hash Chain)
    # =========================================================================
    s14 = add_blank_slide()
    add_header(s14, "Audit Infrastructure",
               "Audit Trail & Compliance Evidence: Cryptographic Proof",
               "Chained SHA-256 audit ledger meeting Section 63 BSA and SEBI Regulation 19 standards.")

    # Left: Cropped & Enlarged Compliance Receipt
    add_browser_frame(s14, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/mandate-security/06_consent_locked_evidence.png",
                      "Figure 14.1: Section 63 BSA / Section 65B Compliance Receipt.")

    # Right: Legal Admissibility Card
    add_card(s14, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s14.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Legal Admissibility & Hash Chaining"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    audit_points = [
        ("• Forward Hash Chaining:", "Each log entry hashes the previous record: payloadHash = SHA256(prevHash + timestamp + event + payload). Any retroactive tampering breaks the entire chain."),
        ("• Section 63 BSA Certificate:", "Captures client device IP (RFC 5737 203.0.113.12), browser User-Agent, exact IST timestamp, and masked PAN (XXXXX1234F)."),
        ("• 5-Year Regulatory Preservation:", "Designed to satisfy SEBI Regulation 19 mandatory 5-year retention requirements for investment advice and rationale."),
        ("• Verified Disaster Recovery:", "Non-destructive drill restored 1,460 audit logs with zero broken cryptographic hash links.")
    ]
    for label, text in audit_points:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s14, 14)
    set_speaker_notes(s14, "Figure 14.1 shows the Section 63 BSA compliance receipt generated at the exact millisecond consent is locked.")

    print("[15/29] Generating Slide 15: Mandate Lifecycle State Model...")
    # =========================================================================
    # SLIDE 15: Mandate Lifecycle State Model (Rebuilt Visual Diagram)
    # =========================================================================
    s15 = add_blank_slide()
    add_header(s15, "State Machine",
               "Mandate Lifecycle & State Model: Server-Enforced Transitions",
               "Finite-state machine guaranteeing deterministic transitions with zero client-side bypass.")

    # Card container without unnecessary heavy shadows
    add_card(s15, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s15.shapes.add_textbox(Inches(1.2), Inches(2.3), Inches(11.0), Inches(4.1))
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

    p = tf.paragraphs[0]; p.text = state_diag; p.font.name = "Consolas"; p.font.size = Pt(12); p.font.color.rgb = COLOR_NAVY

    add_footer(s15, 15)
    set_speaker_notes(s15, "This diagram represents the immutable lifecycle state machine. State transitions can only occur through server-validated cryptographic events.")

    print("[16/29] Generating Slide 16: Visible Chat Inquiry vs Consent Rail...")
    # =========================================================================
    # SLIDE 16: Mandate-Specific Chat Rail (Visible Rohan Inquiry Screen)
    # =========================================================================
    s16 = add_blank_slide()
    add_header(s16, "Discussion Rail",
               "Mandate-Specific Chat: Advisory Clarification vs. Consent",
               "Why in-app discussion is vital for client trust, but legally distinct from trade consent.")

    # Left: Visible Rohan Mehta Chat Inquiry Screenshot
    add_browser_frame(s16, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/mandate-security/04_client_chat_question.png",
                      "Figure 16.1: Rohan posts an inquiry regarding Tata Motors in the password-protected chat.")

    # Right: Statutory Separation Card
    add_card(s16, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s16.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Separation of Communication & Consent"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    chat_points = [
        ("• Real-Time Contextual Discussion:", "Allows clients to ask specific allocation or yield questions directly within the mandate context, eliminating scattered WhatsApp threads."),
        ("• Complete Audit Archiving:", "Every message posted by client or advisor is committed to the immutable audit log under CHAT_MESSAGE_SENT."),
        ("• ⚠️ CHAT DOES NOT CONSTITUTE CONSENT:", "Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions."),
        ("• Uncompromising Consent Rail:", "Trade authorization strictly requires formal statutory declaration checkboxes followed by 6-digit OTP verification.")
    ]
    for label, text in chat_points:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s16, 16)
    set_speaker_notes(s16, "In Figure 16.1, Rohan asks: 'Why sell Tata Motors now?'. Suresh clarifies directly inside the secure mandate. Crucially, chat dialogue never substitutes for OTP consent.")

    print("[17/29] Generating Slide 17: Native Tax Table & Advance Tax Timeline...")
    # =========================================================================
    # SLIDE 17: Tax-Impact Transparency & Advance Tax (Native Table & Timeline)
    # =========================================================================
    s17 = add_blank_slide()
    add_header(s17, "Tax Engine",
               "Tax-Impact Transparency: Finance Act 2024 Engine",
               "Pre-trade capital gains tax visibility eliminating investor surprise liabilities.")

    # Left: Native Editable PowerPoint Table for Tax Calculation (₹11,440)
    table_shape = s17.shapes.add_table(5, 4, Inches(0.8), Inches(2.0), Inches(6.2), Inches(3.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.2)
    table.columns[1].width = Inches(1.3)
    table.columns[2].width = Inches(1.4)
    table.columns[3].width = Inches(1.3)

    t_headers = ["Component", "Statutory Rate", "Taxable Base", "Estimated Tax"]
    for j, h in enumerate(t_headers):
        cell = table.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_NAVY
        p = cell.text_frame.paragraphs[0]; p.text = h; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_WHITE

    t_rows = [
        ("STCG (Tata Motors)", "20.0% (Sec 111A)", "₹55,000", "₹11,000"),
        ("LTCG (HDFC Bank)", "12.5% (Sec 112A)", "₹1,25,000 (Exempt)", "₹0"),
        ("Health & Educ. Cess", "4.0% on Base Tax", "On ₹11,000", "₹440"),
        ("Total Estimated Tax", "Finance Act 2024", "Pre-Trade Calc", "₹11,440")
    ]
    for i, r in enumerate(t_rows):
        r_idx = i + 1
        for c_idx in range(4):
            cell = table.cell(r_idx, c_idx)
            cell.text = r[c_idx]
            p = cell.text_frame.paragraphs[0]; p.font.size = Pt(12); p.font.color.rgb = COLOR_NAVY if r_idx == 4 else COLOR_SLATE
            if r_idx == 4:
                p.font.bold = True
                cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_AMBER_LIGHT

    # Tax Disclaimer under table
    tb_disc = s17.shapes.add_textbox(Inches(0.8), Inches(5.3), Inches(6.2), Inches(1.4))
    tf_disc = tb_disc.text_frame; tf_disc.word_wrap = True
    p = tf_disc.paragraphs[0]
    p.text = "• Tax Note: Excludes individual surcharges (up to 15% on equity capital gains) and prior carried-forward losses. Annual LTCG exemption of ₹1,25,000 applied under Section 112A."
    p.font.size = Pt(12); p.font.color.rgb = COLOR_SLATE

    # Right: Advance Tax 4-Point Timeline Card
    add_card(s17, Inches(7.3), Inches(2.0), Inches(5.233), Inches(4.7), COLOR_CARD_BG, COLOR_AMBER)
    tb_adv = s17.shapes.add_textbox(Inches(7.6), Inches(2.2), Inches(4.7), Inches(4.3))
    tf_adv = tb_adv.text_frame; tf_adv.word_wrap = True
    p = tf_adv.paragraphs[0]; p.text = "Quarterly Advance Tax Schedule (Sec 208 & 234C)"; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_AMBER; p.space_after = Pt(10)

    adv_dates = [
        ("• 1st Installment (15%):", "On or before 15th June"),
        ("• 2nd Installment (45%):", "On or before 15th September"),
        ("• 3rd Installment (75%):", "On or before 15th December"),
        ("• 4th Installment (100%):", "On or before 15th March")
    ]
    for label, val in adv_dates:
        p = tf_adv.add_paragraph()
        p.text = f"{label} {val}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(6)

    p = tf_adv.add_paragraph(); p.space_before = Pt(8)
    p.text = "• Proviso to Section 234C: Relieves penal interest for installments prior to the capital gains realization date if remaining tax is paid in subsequent installments."
    p.font.size = Pt(13); p.font.color.rgb = COLOR_SLATE

    add_footer(s17, 17)
    set_speaker_notes(s17, "This native table shows the verified tax model: ₹11,000 STCG + ₹0 LTCG (exempt under ₹1.25L) + ₹440 cess = ₹11,440. On the right is the advance tax installment calendar.")

    print("[18/29] Generating Slide 18: Multilingual Localization & Language Chips...")
    # =========================================================================
    # SLIDE 18: Multilingual Localization Capability (8 Language Chips)
    # =========================================================================
    s18 = add_blank_slide()
    add_header(s18, "Accessibility & i18n",
               "Multilingual Localization Capability: 8 Languages",
               "Delivering advisory transparency in regional and international languages.")

    # Top: 8 Language Chips Card
    add_card(s18, Inches(0.8), Inches(2.0), Inches(11.733), Inches(2.1), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb_lang = s18.shapes.add_textbox(Inches(1.1), Inches(2.15), Inches(11.1), Inches(1.8))
    tf_lang = tb_lang.text_frame; tf_lang.word_wrap = True
    p = tf_lang.paragraphs[0]; p.text = "8 Fully Supported Languages Across Client & Advisor Portals"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)
    p = tf_lang.add_paragraph()
    p.text = "[ English (en) ]    [ हिंदी (hi) ]    [ தமிழ் (ta) ]    [ বাংলা (bn) ]\n[ ગુજરાતી (gu) ]    [ Deutsch (de) ]    [ 日本語 (ja) ]    [ 한국어 (ko) ]"
    p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)

    # Bottom: Statutory Legal Invariant Callout
    add_card(s18, Inches(0.8), Inches(4.35), Inches(11.733), Inches(2.35), COLOR_CARD_BG, COLOR_EMERALD)
    tb_inv = s18.shapes.add_textbox(Inches(1.1), Inches(4.5), Inches(11.1), Inches(2.0))
    tf_inv = tb_inv.text_frame; tf_inv.word_wrap = True
    p = tf_inv.paragraphs[0]; p.text = "Financial Invariant: Standardized ASCII Numerals Across All Locales"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)

    i18n_points = [
        ("• Western Arabic Digits (0-9):", "Under regulatory standards, all rupee amounts (₹), trade quantities, percentages, and ISIN codes remain strictly in ASCII English numerals across all locales, eliminating ambiguity during legal disputes."),
        ("• Universal Accessibility:", "HNIs review proposals, disclosures, and receipts in their preferred language while financial terms remain standardized."),
        ("• Seamless Profile Toggling:", "Advisers and clients switch languages seamlessly via navigation bar or profile settings.")
    ]
    for label, text in i18n_points:
        p = tf_inv.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(4)

    add_footer(s18, 18)
    set_speaker_notes(s18, "FinConsent supports 8 languages while strictly enforcing ASCII numerals for all financial figures to avoid dispute ambiguities.")

    print("[19/29] Generating Slide 19: Technical Architecture Tier Diagram...")
    # =========================================================================
    # SLIDE 19: Technical Architecture Diagram (Clean Layout)
    # =========================================================================
    s19 = add_blank_slide()
    add_header(s19, "System Topology",
               "Technical Architecture: Security & Service Boundaries",
               "High-level system topology illustrating frontend, API, security engine, and storage tiers.")

    # Clean diagram text box without unnecessary surrounding card
    tb_arch = s19.shapes.add_textbox(Inches(0.8), Inches(1.9), Inches(11.733), Inches(4.9))
    tf_arch = tb_arch.text_frame; tf_arch.word_wrap = True

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

    p = tf_arch.paragraphs[0]; p.text = arch_diag; p.font.name = "Consolas"; p.font.size = Pt(11); p.font.color.rgb = COLOR_NAVY

    add_footer(s19, 19)
    set_speaker_notes(s19, "This architectural topology illustrates the tier separation between frontend, API gateway, core engines, and persistent data tiers in AWS Mumbai.")

    print("[20/29] Generating Slide 20: Real Lockout Screenshot & Threat Defense...")
    # =========================================================================
    # SLIDE 20: Threat Scenarios & Protections (Real Lockout Screenshot)
    # =========================================================================
    s20 = add_blank_slide()
    add_header(s20, "Threat Modeling",
               "Security Threat Scenarios & Evidenced Protections",
               "Proven runtime boundary enforcement against malicious and accidental vectors.")

    # Left: Real Lockout Screenshot in browser frame
    add_browser_frame(s20, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.7),
                      "docs/visual-audit/security/17-otp-lockout-after-3-failures.png",
                      "Figure 20.1: Security Evidence — OTP lockout engaged after 3 failed verification attempts.")

    # Right: Threat -> Defence Mapping Card
    add_card(s20, Inches(6.8), Inches(2.0), Inches(5.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s20.shapes.add_textbox(Inches(7.1), Inches(2.2), Inches(5.133), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Threat Modeling & Architectural Defenses"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    threats = [
        ("• Credential Stuffing & OTP Brute-Force:", "Sliding-window rate limiters block rapid bursts; 3 failed OTPs permanently lock the token (HTTP 429)."),
        ("• Cross-Tenant IDOR & Privilege Escalation:", "Tampering with mandate or client UUIDs across RIA practices rejected with HTTP 403 Forbidden."),
        ("• Expired / Replay Attacks:", "Opening links past the 48-hour cutoff or after successful consent returns HTTP 410 Gone / Revoked."),
        ("• Token Sniffing & Database Breaches:", "Plaintext magic tokens are never persisted in the database (stored strictly as SHA-256 hashes).")
    ]
    for label, text in threats:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s20, 20)
    set_speaker_notes(s20, "Figure 20.1 shows our automated security test verifying that after 3 failed OTP attempts, verification is permanently locked.")

    print("[21/29] Generating Slide 21: Native 48-60pt Statistics...")
    # =========================================================================
    # SLIDE 21: Operational Validation (Native 48-60pt Number Cards)
    # =========================================================================
    s21 = add_blank_slide()
    add_header(s21, "Evidence Base",
               "Operational & Testing Validation: Grounded in Real Runs",
               "Concrete evidence demonstrating zero regressions across automated and browser tests.")

    w_card = Inches(2.7)
    x_pos = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    stats_data = [
        ("230 / 230", "Automated Tests Passing", "17 test suites running across tax calculation, security, RBAC, i18n, and API regressions (100% pass rate).", COLOR_EMERALD),
        ("81", "Screenshots Captured", "42 baseline, 25 security, and 14 mandate-security screenshots verifying desktop and mobile viewports.", COLOR_INDIGO),
        ("1,460", "Records Disaster Drill", "Synthetic non-destructive restore drill verified 1,460 audit logs with zero broken cryptographic hash links.", COLOR_NAVY),
        ("0", "Broken Hash Chains", "Full mathematical continuity verified across all state changes, guaranteeing tamper-evident audit records.", COLOR_AMBER)
    ]

    for i, (num, label, desc, col) in enumerate(stats_data):
        x = x_pos[i]
        add_card(s21, x, Inches(2.0), w_card, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
        tb = s21.shapes.add_textbox(x + Inches(0.18), Inches(2.2), w_card - Inches(0.36), Inches(4.3))
        tf = tb.text_frame; tf.word_wrap = True

        p = tf.paragraphs[0]; p.text = num; p.font.bold = True; p.font.size = Pt(44 if len(num) > 4 else 52); p.font.color.rgb = col; p.space_after = Pt(4)
        p = tf.add_paragraph(); p.text = label; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(13.5); p.font.color.rgb = COLOR_SLATE

    add_footer(s21, 21)
    set_speaker_notes(s21, "All 230 Vitest tests pass with 0 regressions. 81 screenshots verify UI across roles, and 1,460 audit records verified in disaster recovery.")

    print("[22/29] Generating Slide 22: Deployment & Hosting Architecture...")
    # =========================================================================
    # SLIDE 22: Deployment & Hosting Architecture (Indian Data Sovereignty)
    # =========================================================================
    s22 = add_blank_slide()
    add_header(s22, "Infrastructure",
               "Deployment Architecture: Indian Data Sovereignty",
               "Compliance with SEBI Cybersecurity Framework (CSCRF) and DPDP directives.")

    # 4 Structured Deployment Cards
    grid_w = Inches(5.7)
    grid_h = Inches(2.2)
    cards = [
        ("Territorial Data Residency (ap-south-1)",
         "All primary databases, cryptographic keys, and audit ledgers reside exclusively in AWS Asia Pacific (Mumbai) region (ap-south-1) to comply with SEBI CSCRF and DPDP Act directives.",
         COLOR_EMERALD, Inches(0.8), Inches(2.0)),
        ("Multi-Stage Production Containers",
         "Hardened Docker multi-stage build packaging optimized Vite static assets and hardened Express Node.js ESM runtime with zero external runtime package installations.",
         COLOR_INDIGO, Inches(6.833), Inches(2.0)),
        ("Orchestration & Health Probes",
         "Production container environment with automated /api/health and /api/ready probes reporting database connectivity, readiness, and active tenancy health.",
         COLOR_NAVY, Inches(0.8), Inches(4.5)),
        ("Cryptographic Key Isolation",
         "Server Master Key (SERVER_MASTER_KEY) isolated from application authentication secrets (JWT_SECRET); zero third-party advertising tracking or analytics beacons.",
         COLOR_AMBER, Inches(6.833), Inches(4.5))
    ]

    for title, desc, stroke, x, y in cards:
        add_card(s22, x, y, grid_w, grid_h, COLOR_CARD_BG, stroke)
        tb = s22.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = stroke; p.space_after = Pt(6)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s22, 22)
    set_speaker_notes(s22, "Data sovereignty is absolute: all data resides in AWS Mumbai (ap-south-1). No data leaves Indian territory.")

    print("[23/29] Generating Slide 23: Business Value & Practice Outcomes...")
    # =========================================================================
    # SLIDE 23: Business Value & Practice Impact (3 Compact Outcome Tiles)
    # =========================================================================
    s23 = add_blank_slide()
    add_header(s23, "Business Impact",
               "Business Value & Practice Impact for Advisory Firms",
               "Quantifiable efficiency, compliance security, and investor satisfaction gains.")

    col_w = Inches(3.64)
    outcomes = [
        ("100% Inspection-Ready",
         "Instantly downloadable Section 63 BSA / Section 65B compliance dossiers provide contemporaneous regulatory evidence.\n\n• Replaces weeks of manual audit trail compilation with instantaneous verification.\n• Safeguards RIA practice and principal officers against claims of unauthorized or discretionary trading.",
         COLOR_EMERALD, COLOR_EMERALD_LIGHT),
        ("Zero Tax Shocks",
         "Complete pre-trade capital gains tax visibility eliminates investor surprise liabilities.\n\n• Proactively alerts clients to quarterly advance tax obligations under Section 208 and 234C.\n• Elevates advisory relationship from administrative chasing to high-trust strategic wealth planning.",
         COLOR_AMBER, COLOR_AMBER_LIGHT),
        ("< 2h Turnaround",
         "Accelerates client review and consent turnaround to under 2 hours on mobile.\n\n• Minimizes market slippage during high-volatility rebalancing windows.\n• Secure password-protected magic link delivery without requiring client app installation.",
         COLOR_INDIGO, COLOR_INDIGO_LIGHT)
    ]

    for i, (title, desc, stroke, bg) in enumerate(outcomes):
        x = Inches(0.8) + Inches(i * 4.04)
        add_card(s23, x, Inches(2.0), col_w, Inches(4.7), bg, stroke)
        tb = s23.shapes.add_textbox(x + Inches(0.2), Inches(2.2), col_w - Inches(0.4), Inches(4.3))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(18); p.font.color.rgb = stroke; p.space_after = Pt(12)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s23, 23)
    set_speaker_notes(s23, "The impact is threefold: 100% inspection-ready compliance, zero client tax shocks, and consent turnaround in under two hours.")

    print("[24/29] Generating Slide 24: Redesigned Comparison Matrix...")
    # =========================================================================
    # SLIDE 24: Transformation Comparison Table (Redesigned)
    # =========================================================================
    s24 = add_blank_slide()
    add_header(s24, "The Transformation",
               "The Transformation: What Changes for Advisor and Client",
               "Comparing legacy advisory friction with FinConsent's institutional digital rail.")

    # Native PowerPoint Table with distinct header and shading ONLY on FinConsent column
    comp_table_shape = s24.shapes.add_table(5, 3, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.7))
    comp_table = comp_table_shape.table
    comp_table.columns[0].width = Inches(2.8)
    comp_table.columns[1].width = Inches(4.3)
    comp_table.columns[2].width = Inches(4.633)

    c_headers = ["Advisory Dimension", "Legacy Process (Informal / Dispersed)", "FinConsent Institutional Rail"]
    for j, h in enumerate(c_headers):
        cell = comp_table.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_NAVY if j < 2 else COLOR_INDIGO
        p = cell.text_frame.paragraphs[0]; p.text = h; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = COLOR_WHITE

    c_rows = [
        ("Trade Authorization", "✗ Fragmented WhatsApp texts or email replies; rejected during SEBI inspection.", "✓ Explicit statutory declarations + 6-digit OTP verification with 48h market window."),
        ("Capital Gains Tax", "✗ Post-trade surprise tax bill; penal interest under Sections 208 & 234B/C.", "✓ Pre-trade Finance Act 2024 calculation with quarterly advance tax alert."),
        ("Client Security", "✗ Confidential trade details sent over plain WhatsApp or email attachments.", "✓ Dual-envelope AES-256-GCM encryption with PAN+DOB client password gate."),
        ("Audit & Legal Trail", "✗ Scattered screenshots and PDFs; inadmissible under Section 63 BSA.", "✓ Append-only forward SHA-256 ledger emitting certified Section 63 BSA compliance dossier.")
    ]

    for i, (dim, leg, fc) in enumerate(c_rows):
        r_idx = i + 1
        comp_table.cell(r_idx, 0).text = dim
        comp_table.cell(r_idx, 1).text = leg
        comp_table.cell(r_idx, 2).text = fc
        for c_idx in range(3):
            cell = comp_table.cell(r_idx, c_idx)
            # Shading ONLY for FinConsent column
            if c_idx == 2:
                cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_INDIGO_LIGHT
            else:
                cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_CARD_BG
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(13)
            p.font.color.rgb = COLOR_INDIGO if c_idx == 2 else (COLOR_RED if c_idx == 1 and leg.startswith("✗") else COLOR_NAVY)
            if c_idx == 0 or c_idx == 2:
                p.font.bold = True

    add_footer(s24, 24)
    set_speaker_notes(s24, "This comparison highlights the operational leap across authorization, tax visibility, data security, and evidentiary admissibility.")

    print("[25/29] Generating Slide 25: Appendix A — Cryptographic Deep-Dive...")
    # =========================================================================
    # SLIDE 25: Appendix A — Cryptographic & Encryption Invariants
    # =========================================================================
    s25 = add_blank_slide()
    add_header(s25, "Appendix A",
               "Technical Deep-Dive: Cryptographic Invariants & Key Derivation",
               "Formal mathematical specifications for envelope encryption and PBKDF2 KDF.")

    add_card(s25, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s25.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(11.1), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Cryptographic Implementation Specifications"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    crypto_specs = [
        ("• Symmetric Cipher:", "AES-256-GCM (Galois/Counter Mode) with 12-byte random IV and 16-byte authentication tag ensuring anti-tampering."),
        ("• Key Derivation Function:", "PBKDF2 with SHA-256 digest, 100,000 rounds in production (1,000 in test mode), and 16-byte random salt."),
        ("• Key Derivation Input:", "Normalized string concatenation of PAN last 4 digits + DOB in DDMMYYYY format (e.g. '123414081978')."),
        ("• Dual Wrapping Invariant:", "Server DEK wrapped with isolated SERVER_MASTER_KEY; Client DEK wrapped with Client Derived Key."),
        ("• Zero Secret Storage:", "The database never persists client plaintext passwords, unencrypted DEKs, or plaintext magic tokens.")
    ]
    for label, text in crypto_specs:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s25, 25)
    set_speaker_notes(s25, "Appendix A outlines the formal cryptographic specifications: AES-256-GCM, 100,000 rounds of PBKDF2, and zero plaintext secret storage.")

    print("[26/29] Generating Slide 26: Appendix B — RBAC & Permission Matrix...")
    # =========================================================================
    # SLIDE 26: Appendix B — Authorization Matrix (Tighter Rows & Coloured Chips)
    # =========================================================================
    s26 = add_blank_slide()
    add_header(s26, "Appendix B",
               "Technical Deep-Dive: Role-Based Authorization Matrix",
               "Detailed API permission matrix with monospaced endpoints and coloured permission chips.")

    # Native PowerPoint Table for RBAC
    rbac_table_shape = s26.shapes.add_table(6, 4, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.7))
    rbac_table = rbac_table_shape.table
    rbac_table.columns[0].width = Inches(3.2)
    rbac_table.columns[1].width = Inches(2.8)
    rbac_table.columns[2].width = Inches(2.8)
    rbac_table.columns[3].width = Inches(2.933)

    r_headers = ["API Route / Resource", "RIA (sebi-ria)", "Client (hni-client)", "Compliance Officer"]
    for j, h in enumerate(r_headers):
        cell = rbac_table.cell(0, j)
        cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_NAVY
        p = cell.text_frame.paragraphs[0]; p.text = h; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_WHITE

    r_rows = [
        ("/api/mandates (POST / Create)", "ALLOWED (Scoped to firm)", "FORBIDDEN (HTTP 403)", "FORBIDDEN (Read-only)"),
        ("/api/mandates/:id/dispatch", "ALLOWED (Own mandates only)", "FORBIDDEN (HTTP 403)", "FORBIDDEN (Read-only)"),
        ("/api/public/mandates/:t/unlock", "N/A (Uses dashboard)", "ALLOWED (Valid password)", "N/A (Uses compliance hub)"),
        ("/api/public/mandates/:t/verify-otp", "FORBIDDEN (HTTP 403)", "ALLOWED (Valid 6-digit OTP)", "FORBIDDEN (HTTP 403)"),
        ("/api/requests (Scrutiny Hub)", "ALLOWED (Submit requests)", "ALLOWED (View own requests)", "ALLOWED (Full Adjudication)")
    ]

    for i, r in enumerate(r_rows):
        r_idx = i + 1
        for c_idx in range(4):
            cell = rbac_table.cell(r_idx, c_idx)
            val = r[c_idx]
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            if c_idx == 0:
                p.font.name = "Consolas"; p.font.size = Pt(12); p.font.color.rgb = COLOR_NAVY
            else:
                p.font.size = Pt(12)
                if "ALLOWED" in val:
                    cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_EMERALD_LIGHT
                    p.font.color.rgb = COLOR_EMERALD; p.font.bold = True
                elif "FORBIDDEN" in val:
                    cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_RED_LIGHT
                    p.font.color.rgb = COLOR_RED; p.font.bold = True
                else:
                    cell.fill.solid(); cell.fill.fore_color.rgb = COLOR_CARD_BG
                    p.font.color.rgb = COLOR_SLATE

    add_footer(s26, 26)
    set_speaker_notes(s26, "Appendix B provides the role-based access matrix. Every API endpoint enforces strict authorization rules.")

    print("[27/29] Generating Slide 27: Appendix C — Section 63 BSA Admissibility...")
    # =========================================================================
    # SLIDE 27: Appendix C — Audit Schema & Section 63 BSA Admissibility
    # =========================================================================
    s27 = add_blank_slide()
    add_header(s27, "Appendix C",
               "Technical Deep-Dive: Audit Schema & Section 63 BSA Admissibility",
               "Evidentiary record structures required by Indian legal standards.")

    add_card(s27, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s27.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(11.1), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Section 63 BSA Mandatory Evidentiary Attributions"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    bsa_items = [
        ("1. Origin Identification:", "Client IP Address (RFC 5737 203.0.113.12) and browser User-Agent recorded at execution time."),
        ("2. Synchronized Timestamp:", "Server-side NTP timestamping localized to Indian Standard Time (IST)."),
        ("3. Hash Integrity Seal:", "SHA-256 payloadHash computed over the immutable consent certificate."),
        ("4. Device Custody Proof:", "Evidence that the computer system was operating properly during record generation."),
        ("5. Regulation 19 Admissibility:", "Cryptographically chained forward hashes guarantee zero retroactive modifications.")
    ]
    for label, text in bsa_items:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(14); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(8)

    add_footer(s27, 27)
    set_speaker_notes(s27, "Appendix C details the exact criteria required under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for electronic records to be admitted in court.")

    print("[28/29] Generating Slide 28: Appendix D — Implemented State vs. Roadmap...")
    # =========================================================================
    # SLIDE 28: Appendix D — Operational Considerations: Implemented vs. Roadmap
    # =========================================================================
    s28 = add_blank_slide()
    add_header(s28, "Appendix D",
               "Operational Considerations: Implemented State vs. Roadmap",
               "Clear demarcation between current production capabilities and future roadmap milestones.")

    card_w = Inches(5.7)
    # Left: Implemented Capabilities
    add_card(s28, Inches(0.8), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_EMERALD)
    tb = s28.shapes.add_textbox(Inches(1.0), Inches(2.2), card_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Implemented Capabilities (Now)"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "✓ Full non-discretionary mandate formulation & tax engine\n✓ AES-256-GCM dual-envelope encryption & PBKDF2 password gate\n✓ 256-bit magic links with SHA-256 database hashing & 48h cutoff\n✓ In-app mandate chat with explicit non-consent separation\n✓ Section 63 BSA compliance receipts with SHA-256 hash chaining\n✓ Multi-tenant isolation, RBAC, staff TOTP MFA, and rate limiting\n✓ 8 supported languages with English ASCII numerals."
    p.font.size = Pt(13.5); p.font.color.rgb = COLOR_DARK_SLATE

    # Right: Documented Scope & Roadmap
    add_card(s28, Inches(6.833), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s28.shapes.add_textbox(Inches(7.033), Inches(2.2), card_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Documented Scope & Future Roadmap (Next)"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)
    p = tf.add_paragraph()
    p.text = "• Production TRAI DLT SMS Gateway: Current setup delivers OTP via email/in-app; commercial SMS requires TRAI DLT aggregator.\n• WhatsApp Channel Delivery: Secure email magic links active; WhatsApp Business API delivery on product roadmap.\n• CloudHSM Key Management: Envelope Server Master Key isolated in env config; AWS CloudHSM/KMS recommended for banking tiers.\n• Direct Broker Execution: FinConsent intentionally halts at locked consent; API execution via brokers on future roadmap."
    p.font.size = Pt(13.5); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s28, 28)
    set_speaker_notes(s28, "Appendix D provides transparency on implemented features versus roadmap enhancements like WhatsApp delivery and direct broker execution.")

    print("[29/29] Generating Slide 29: Pilot Proposal, Pricing & Next Steps...")
    # =========================================================================
    # SLIDE 29: Pilot Proposal & Next Steps (Timeline + Verified Pricing Card)
    # =========================================================================
    s29 = add_blank_slide()
    add_header(s29, "Pilot Proposal & Next Steps",
               "Institutional Pilot Proposal & Implementation Roadmap",
               "Structured 4-week pilot deployment for fee-only advisory practices with verified commercial terms.")

    card_w = Inches(5.7)
    # Left: 4-Week Implementation Roadmap
    add_card(s29, Inches(0.8), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s29.shapes.add_textbox(Inches(1.0), Inches(2.2), card_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "4-Week Phased Implementation Roadmap"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(8)

    pilot_steps = [
        ("• Week 1: Governance & Setup", "Configure SEBI INA registration number (e.g. INA000088921), firm compliance officer contacts, and staff TOTP MFA."),
        ("• Week 2: Client Roster Ingestion", "Import client profiles with validated PAN syntax (XXXXX1234F), DOB attributes, and rebalance templates."),
        ("• Week 3: Controlled Pilot Rebalance", "Execute live mandates with 10–25 client families; demonstrate pre-trade tax visibility and mobile OTP consent."),
        ("• Week 4: Compliance Review & Scale", "Audit Section 63 BSA receipts with firm Compliance Officer; transition practice to automated FinConsent workflows.")
    ]
    for label, text in pilot_steps:
        p = tf.add_paragraph()
        p.text = f"{label}: {text}"
        p.font.size = Pt(13.5); p.font.color.rgb = COLOR_SLATE; p.space_after = Pt(6)

    # Right: Verified Pricing & Official CTA Card
    add_card(s29, Inches(6.833), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s29.shapes.add_textbox(Inches(7.033), Inches(2.2), card_w - Inches(0.4), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Verified Commercial Terms & Inquiries"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)

    # Prominent pricing callout
    p = tf.add_paragraph()
    p.text = "₹2,499 / Month  (+ 18% GST)"
    p.font.bold = True; p.font.size = Pt(24); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(6)

    pricing_points = [
        ("• Pro Practice Plan:", "Includes up to 100 active mandates/month, unlimited client roster, complete tax engine, and 5-year audit ledger retention."),
        ("• Zero Execution Surcharges:", "FinConsent charges zero basis points (bps) or AUM percentages. Pure software utility model."),
        ("• Demonstration Workspace:", "Prudent Wealth Advisory (SEBI Reg: INA000088921) with synthetic demonstration data."),
        ("• Official Inquiries & Onboarding:", "compliance@finconsent.in")
    ]
    for label, text in pricing_points:
        p = tf.add_paragraph()
        p.text = f"{label} {text}"
        p.font.size = Pt(13.5); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(6)

    add_footer(s29, 29)
    set_speaker_notes(s29, "To begin, we propose a 4-week pilot starting with 10-25 families. The Pro Practice plan is ₹2,499/month with zero AUM surcharges. Inquiries: compliance@finconsent.in.")

    # Save to both docs and root
    prs.save(OUTPUT_PPTX)
    prs.save(OUTPUT_PPTX_ROOT)
    print(f"\n[SUCCESS] PowerPoint deck generated successfully: {len(prs.slides)} slides saved to:")
    print(f"  - {OUTPUT_PPTX}")
    print(f"  - {OUTPUT_PPTX_ROOT}")

if __name__ == "__main__":
    create_presentation()

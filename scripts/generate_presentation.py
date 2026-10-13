#!/usr/bin/env python3
"""
FinConsent Client-Facing Executive Presentation Generator (Fully Remediated)
Generates an institutional 30-slide PowerPoint deck adhering strictly to:
  - 16:9 widescreen format (13.333" x 7.5") with core presentation metadata
  - Slide titles at 32-34pt (bold, message-led, shortened on slides 7 & 28)
  - Body text at 14pt+ with native PowerPoint bullets, hanging indents, and bold labels
  - No typed raw bullet characters on slides 3, 7, 10–14, 16–18, 23, 26, 28, 29, 30
  - Restored high-res Graphviz lifecycle diagram on Slide 15 and visual architecture on Slide 19
  - Genuine distortion-free screenshots in matched phone (~390px mobile view) and browser frames
  - Dedicated Appendix section divider (Slide 25) cleanly separating core slides from deep-dives
  - Standardised tighter card style with subtle 1px borders, small corners, and minimal shadows
  - Aligned tax table & advance tax schedule edges on Slide 17; rounded language chips on Slide 18
  - Native editable 48-60pt statistics on Slide 21; visual 4-step pilot timeline on Slide 30
  - Complete speaker notes and slide numbers (Slide X of 30) across all 30 slides
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.xmlchemy import OxmlElement

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
DIAGRAMS_DIR = os.path.join(DOCS_DIR, "diagrams")
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

TOTAL_SLIDES = 30

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Presentation Metadata
    prs.core_properties.title = "FinConsent — Advisory Proposal Consent & Tax Infrastructure"
    prs.core_properties.subject = "SEBI Regulation 19 Compliance & WealthTech Architecture"
    prs.core_properties.author = "FinConsent Engineering"
    prs.core_properties.comments = "Client-facing 30-slide presentation with verified compliance evidence"

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

    def add_footer(slide, current_slide, total_slides=TOTAL_SLIDES, is_dark=False):
        footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.32))
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

    def add_bullet_point(tf, label, text, font_size=13.5, bold_label=True, space_after=Pt(6)):
        p = tf.add_paragraph()
        pPr = p._pPr
        pPr.set("marL", "342900")    # Left margin (~0.375")
        pPr.set("indent", "-228600") # Hanging indent (-0.25")
        buChar = OxmlElement("a:buChar")
        buChar.set("char", "•")
        pPr.append(buChar)

        if label:
            r1 = p.add_run()
            r1.text = label + (": " if not label.endswith(":") else " ")
            r1.font.bold = bold_label
            r1.font.size = Pt(font_size)
            r1.font.name = FONT_BODY
            r1.font.color.rgb = COLOR_NAVY if bold_label else COLOR_DARK_SLATE

        r2 = p.add_run()
        r2.text = text
        r2.font.bold = False
        r2.font.size = Pt(font_size)
        r2.font.name = FONT_BODY
        r2.font.color.rgb = COLOR_SLATE

        if space_after:
            p.space_after = space_after
        return p

    def add_phone_frame(slide, left, top, width, height, rel_path, caption=None):
        phone_chassis = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        phone_chassis.fill.solid()
        phone_chassis.fill.fore_color.rgb = COLOR_NAVY
        phone_chassis.line.color.rgb = RGBColor(51, 65, 85)
        phone_chassis.line.width = Pt(1.5)

        bezel_x = Inches(0.08)
        bezel_y = Inches(0.12)
        screen_w = width - (bezel_x * 2)
        screen_h = height - (bezel_y * 2)

        full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        if os.path.exists(full_path):
            pic = slide.shapes.add_picture(full_path, left + bezel_x, top + bezel_y, screen_w, screen_h)
            if caption:
                cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.04), width, Inches(0.22))
                tf = cap_box.text_frame; tf.word_wrap = True; tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
                p = tf.paragraphs[0]; p.text = caption; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_SLATE; p.alignment = PP_ALIGN.CENTER
            return pic
        return phone_chassis

    def add_browser_frame(slide, left, top, width, height, rel_path, caption=None):
        chassis = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        chassis.fill.solid()
        chassis.fill.fore_color.rgb = RGBColor(241, 245, 249)
        chassis.line.color.rgb = COLOR_CARD_BORDER
        chassis.line.width = Pt(1)

        dot_colors = [RGBColor(239, 68, 68), RGBColor(245, 158, 11), RGBColor(16, 185, 129)]
        for i, col in enumerate(dot_colors):
            dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.12) + Inches(i * 0.14), top + Inches(0.08), Inches(0.08), Inches(0.08))
            dot.fill.solid(); dot.fill.fore_color.rgb = col; dot.line.fill.background()

        bar_h = Inches(0.24)
        img_top = top + bar_h
        img_h = height - bar_h - Inches(0.04)
        img_w = width - Inches(0.08)

        full_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
        if os.path.exists(full_path):
            pic = slide.shapes.add_picture(full_path, left + Inches(0.04), img_top, img_w, img_h)
            if caption:
                cap_box = slide.shapes.add_textbox(left, top + height + Inches(0.04), width, Inches(0.22))
                tf = cap_box.text_frame; tf.word_wrap = True; tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
                p = tf.paragraphs[0]; p.text = caption; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_SLATE
            return pic
        return chassis

    print(f"[1/{TOTAL_SLIDES}] Generating Slide 1: Dark Premium Cover...")
    # =========================================================================
    # SLIDE 1: Dark Premium Cover Layout
    # =========================================================================
    s1 = add_blank_slide(is_dark=True)
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(7.8), Inches(5.2))
    tf1 = tb1.text_frame; tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "FINCONSENT"
    p.font.name = FONT_HEADING; p.font.size = Pt(48); p.font.bold = True; p.font.color.rgb = COLOR_WHITE; p.space_after = Pt(8)

    p = tf1.add_paragraph()
    p.text = "Enterprise Advisory Proposal Consent & Tax Infrastructure for Indian RIAs"
    p.font.name = FONT_HEADING; p.font.size = Pt(24); p.font.bold = True; p.font.color.rgb = RGBColor(165, 180, 252); p.space_after = Pt(20)

    p = tf1.add_paragraph()
    p.text = "Engineered specifically to operationalize SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, eliminate pre-trade capital gains tax surprises under Finance Act 2024, and establish immutable Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA) electronic evidence."
    p.font.name = FONT_BODY; p.font.size = Pt(15); p.font.color.rgb = RGBColor(226, 232, 240); p.space_after = Pt(32)

    p = tf1.add_paragraph()
    p.text = "SEBI Regulation 19 Compliant   |   Finance Act 2024 Tax Engine   |   BSA §63 Cryptographic Receipts"
    p.font.size = Pt(13); p.font.color.rgb = RGBColor(148, 163, 184)

    add_phone_frame(s1, Inches(9.2), Inches(1.1), Inches(3.2), Inches(5.3),
                    "docs/visual-audit/mandate-security/07_mobile_unlock_screen.png",
                    "Rohan Mehta's Mobile Verification Screen")
    add_footer(s1, 1, is_dark=True)
    set_speaker_notes(s1, "Welcome. FinConsent is purpose-built statutory software for Registered Investment Advisers managing non-discretionary portfolios in India. It bridges investment formulation and client authorization.")

    print(f"[2/{TOTAL_SLIDES}] Generating Slide 2: Executive Agenda & Core Friction...")
    # =========================================================================
    # SLIDE 2: Agenda & Industry Landscape (Consistent Tint + Distinct Icons)
    # =========================================================================
    s2 = add_blank_slide()
    add_header(s2, "Executive Agenda & Industry Context",
               "The Operational Crisis Facing Indian Investment Advisers",
               "Why legacy approval methods fail both regulatory audits and investor trust.")

    col_w = Inches(11.733)
    y_starts = [Inches(2.0), Inches(3.6), Inches(5.2)]
    problems = [
        ("1. Informal Communication & Evidentiary Fragmentation",
         "Advisers frequently communicate rebalancing proposals over chat or email. While discoverable, these unstructured records fragment rationale and create administrative collation overhead during SEBI Regulation 19 audits, failing Section 63 BSA electronic admissibility standards.",
         COLOR_RED),
        ("2. Post-Trade Capital Gains Tax Shocks (Investor Friction)",
         "Finance Act 2024 increased STCG to 20% and LTCG to 12.5% (+ 4% cess). When rebalancing occurs without pre-trade tax visibility, investors are blindsided by unexpected tax liabilities and penalty interest under Section 208 and 234C where liability reaches ₹10,000.",
         COLOR_AMBER),
        ("3. Fragmented Audit Trails (Inadmissible in Disputes)",
         "Advice, rationale, client responses, and execution logs live in disconnected silos. Compiling annual compliance records takes weeks. Raw screenshots lack cryptographic hash continuity and device provenance, rendering them contestable before regulatory authorities.",
         COLOR_NAVY)
    ]

    for i, (title, desc, icon_color) in enumerate(problems):
        y = y_starts[i]
        add_card(s2, Inches(0.8), y, col_w, Inches(1.35), COLOR_CARD_BG, COLOR_CARD_BORDER)
        # Small icon badge on left
        badge = s2.shapes.add_shape(MSO_SHAPE.OVAL, Inches(1.1), y + Inches(0.25), Inches(0.4), Inches(0.4))
        badge.fill.solid(); badge.fill.fore_color.rgb = icon_color; badge.line.fill.background()
        
        tb = s2.shapes.add_textbox(Inches(1.65), y + Inches(0.12), col_w - Inches(1.0), Inches(1.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(15.5); p.font.color.rgb = icon_color; p.space_after = Pt(4)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s2, 2)
    set_speaker_notes(s2, "Today, SEBI registered advisers manage crores under non-discretionary agreements, yet 80% still collect approvals over WhatsApp or email. This slide highlights the three systemic failure modes.")

    print(f"[3/{TOTAL_SLIDES}] Generating Slide 3: Personas & Human Realities...")
    # =========================================================================
    # SLIDE 3: Persona Layouts (Native Bullets + Hanging Indents)
    # =========================================================================
    s3 = add_blank_slide()
    add_header(s3, "User Personas & Operational Context",
               "Grounding Compliance in Human Realities: Suresh & Rohan",
               "A fee-only RIA managing family wealth and an executive demanding frictionless transparency.")

    card_w = Inches(5.7)
    # Persona 1: Advisor Suresh
    add_card(s3, Inches(0.8), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s3.shapes.add_textbox(Inches(1.05), Inches(2.2), card_w - Inches(0.5), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True

    p = tf.paragraphs[0]; p.text = "SURESH NARAYANAN  [SN]"; p.font.bold = True; p.font.size = Pt(17); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "Principal Officer & Founder, Prudent Wealth Advisory (SEBI Reg: INA000088921)"; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)
    p = tf.add_paragraph(); p.text = "Key Metrics:  ₹180 Crores AUM   |   75 Affluent Families   |   Fee-Only Model"; p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(8)

    add_bullet_point(tf, "Role", "Non-discretionary investment formulation, asset allocation, and rebalancing.")
    add_bullet_point(tf, "Pain Point", "Surging equity markets triggered 15%+ allocation drift. Needs immediate consent without administrative phone chasing.")
    add_bullet_point(tf, "Statutory Need", "Mandated 5-year audit trail for rationale under SEBI Regulation 19.")

    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = '“I cannot risk my SEBI licence on unrecorded phone calls or casual text messages. When markets drift, I need a verifiable, locked consent record in under an hour.”'
    p.font.italic = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_INDIGO

    # Persona 2: Client Rohan
    add_card(s3, Inches(6.833), Inches(2.0), card_w, Inches(4.7), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s3.shapes.add_textbox(Inches(7.083), Inches(2.2), card_w - Inches(0.5), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True

    p = tf.paragraphs[0]; p.text = "ROHAN MEHTA  [RM]"; p.font.bold = True; p.font.size = Pt(17); p.font.color.rgb = COLOR_NAVY
    p = tf.add_paragraph(); p.text = "Managing Director, Auto-Tech Firm, Pune (Masked PAN: XXXXX1234F)"; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)
    p = tf.add_paragraph(); p.text = "Key Metrics:  ₹4.2 Crore Portfolio   |   2-Minute Review Limit   |   Mobile-First"; p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_DARK_SLATE; p.space_after = Pt(8)

    add_bullet_point(tf, "Role", "Busy corporate executive reviewing financial proposals on smartphone between meetings.")
    add_bullet_point(tf, "Pain Point", "Refuses to read lengthy PDF attachments or guess year-end capital gains taxes while travelling.")
    add_bullet_point(tf, "Expectation", "2-minute mobile authorization flow with exact rupee tax impact before agreeing.")

    p = tf.add_paragraph(); p.space_before = Pt(8)
    p.text = '“Tell me exactly what we are buying and selling, why we are doing it, and what my tax bill is. If it takes more than 2 minutes on my phone, I will postpone it.”'
    p.font.italic = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_EMERALD

    add_footer(s3, 3)
    set_speaker_notes(s3, "Meet our two personas: Suresh, the compliant adviser managing family wealth, and Rohan, the busy client who requires crisp mobile transparency.")

    print(f"[4/{TOTAL_SLIDES}] Generating Slide 4: Detailed Risk Breakdown...")
    # =========================================================================
    # SLIDE 4: Why Current Process Creates Risk and Friction (Tighter Cards)
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

    print(f"[5/{TOTAL_SLIDES}] Generating Slide 5: Four-Pillar Solution Hub...")
    # =========================================================================
    # SLIDE 5: FinConsent Solution Overview (Hub & 4 Tightened Pillar Cards)
    # =========================================================================
    s5 = add_blank_slide()
    add_header(s5, "Platform Architecture",
               "FinConsent Solution Overview: The Four Core Pillars",
               "An integrated statutory infrastructure bridging advisory formulation and client mobile consent.")

    # Top Central Hub Card
    hub = add_card(s5, Inches(2.8), Inches(1.9), Inches(7.733), Inches(1.1), COLOR_NAVY, COLOR_NAVY)
    tb_hub = s5.shapes.add_textbox(Inches(3.0), Inches(2.0), Inches(7.333), Inches(0.9))
    tf_hub = tb_hub.text_frame; tf_hub.word_wrap = True
    p = tf_hub.paragraphs[0]; p.text = "FINCONSENT CORE STATUTORY PLATFORM"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_WHITE; p.alignment = PP_ALIGN.CENTER
    p = tf_hub.add_paragraph(); p.text = "Unified Architecture for SEBI Reg 19  |  Finance Act 2024  |  BSA 2023 Sec 63"; p.font.size = Pt(13); p.font.color.rgb = RGBColor(165, 180, 252); p.alignment = PP_ALIGN.CENTER

    # 4 Pillar Cards Below (Tightened spacing, zero empty space)
    col_w = Inches(2.7)
    x_pos = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    pillars = [
        ("1. Pre-Trade Tax Engine",
         "Dynamic Finance Act 2024 tax computation. Real-time STCG (20%) & LTCG (12.5% + 4% cess) computation with quarterly advance tax alerts under Section 208 / 234C.",
         COLOR_AMBER),
        ("2. Dual-Envelope Encryption",
         "AES-256-GCM encryption with dual key wrapping and isolated Server Master Key. Financial data remains encrypted at rest until client unlocks via PAN last 4 + DOB.",
         COLOR_INDIGO),
        ("3. Mobile Consent Rail",
         "Direct password-protected 256-bit magic links. Responsive smartphone layout, mandate clarification chat, and secure email/in-app 6-digit OTP verification.",
         COLOR_EMERALD),
        ("4. Section 63 BSA Ledger",
         "Append-only forward SHA-256 hash chaining. Emits digitally fingerprinted Regulation 19 compliance dossiers with IP, User-Agent, and IST timestamps.",
         COLOR_NAVY)
    ]

    for i, (title, desc, stroke) in enumerate(pillars):
        x = x_pos[i]
        add_card(s5, x, Inches(3.25), col_w, Inches(3.5), COLOR_CARD_BG, stroke)
        tb = s5.shapes.add_textbox(x + Inches(0.18), Inches(3.4), col_w - Inches(0.36), Inches(3.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = stroke; p.space_after = Pt(10)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(13.5); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s5, 5)
    set_speaker_notes(s5, "Here are the four foundational pillars: Pre-trade Tax, Dual-envelope Encryption, Mobile Consent Rail, and BSA Section 63 Audit Ledger.")

    print(f"[6/{TOTAL_SLIDES}] Generating Slide 6: Actor Lanes Timeline...")
    # =========================================================================
    # SLIDE 6: End-to-End User Journey (3 Connected Actor Lanes)
    # =========================================================================
    s6 = add_blank_slide()
    add_header(s6, "Narrative Flow",
               "End-to-End User Journey: Advisor, Platform & Client Lanes",
               "Chronological sequence mapping advisory formulation to statutory compliance archive.")

    lane_h = Inches(1.48)
    y_lanes = [Inches(1.95), Inches(3.58), Inches(5.21)]
    lanes = [
        ("ADVISOR (RIA)\nSuresh Narayanan",
         [("1. Drift Detected", "Identifies 15% equity excess"),
          ("2. Formulation", "Drafts sell/buy & rationale"),
          ("3. Dispatches Link", "Enforces 48h market window"),
          ("6. In-App Chat", "Clarifies allocation in rail")],
         COLOR_NAVY),
        ("FINCONSENT CORE\nPlatform Engine",
         [("Pre-Trade Tax", "Calculates ₹11,440 liability"),
          ("Envelope Crypto", "AES-256 dual key wrapping"),
          ("6-Digit OTP Rail", "5m TTL & 3-attempt lockout"),
          ("Chained Ledger", "Forward SHA-256 BSA dossier")],
         COLOR_INDIGO),
        ("CLIENT (HNI)\nRohan Mehta",
         [("4. Password Unlock", "Enters PAN last-4 + DOB"),
          ("5. Reviews Mandate", "Checks drift, baskets & tax"),
          ("7. Enters OTP", "Checks 3 declarations"),
          ("8. Locks Evidence", "Receives signed receipt")],
         COLOR_EMERALD)
    ]

    for i, (lane_title, steps, lane_color) in enumerate(lanes):
        y = y_lanes[i]
        # Outer lane container
        add_card(s6, Inches(0.8), y, Inches(11.733), lane_h, COLOR_CARD_BG, COLOR_CARD_BORDER)
        
        # Lane Header Box
        h_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), y + Inches(0.12), Inches(2.2), lane_h - Inches(0.24))
        h_box.fill.solid(); h_box.fill.fore_color.rgb = lane_color
        h_box.line.fill.background()
        tf_h = h_box.text_frame; tf_h.word_wrap = True
        p = tf_h.paragraphs[0]; p.text = lane_title; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_WHITE; p.alignment = PP_ALIGN.CENTER
        
        # 4 Step Boxes with connected Right Arrows
        box_w = Inches(1.98)
        box_h = lane_h - Inches(0.26)
        start_x = Inches(3.25)
        arrow_w = Inches(0.18)
        
        for j, (step_title, step_desc) in enumerate(steps):
            bx = start_x + Inches(j * (1.98 + 0.28))
            b_shape = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, y + Inches(0.13), box_w, box_h)
            b_shape.fill.solid(); b_shape.fill.fore_color.rgb = COLOR_WHITE
            b_shape.line.color.rgb = COLOR_CARD_BORDER; b_shape.line.width = Pt(1)
            tf_b = b_shape.text_frame; tf_b.word_wrap = True
            p = tf_b.paragraphs[0]; p.text = step_title; p.font.bold = True; p.font.size = Pt(11); p.font.color.rgb = lane_color; p.space_after = Pt(2)
            p = tf_b.add_paragraph(); p.text = step_desc; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_SLATE
            
            # Add Right Arrow between boxes
            if j < 3:
                ax = bx + box_w + Inches(0.05)
                arrow = s6.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, ax, y + Inches(0.6), arrow_w, Inches(0.2))
                arrow.fill.solid(); arrow.fill.fore_color.rgb = RGBColor(148, 163, 184)
                arrow.line.fill.background()

    add_footer(s6, 6)
    set_speaker_notes(s6, "Notice how the three actor lanes interact: Suresh initiates, FinConsent secures and computes, and Rohan authorizes on his mobile device.")

    print(f"[7/{TOTAL_SLIDES}] Generating Slide 7: Main Journey & Exception Flow...")
    # =========================================================================
    # SLIDE 7: Process Architecture (Shortened Title, Legible Main & Exception Flows)
    # =========================================================================
    s7 = add_blank_slide()
    add_header(s7, "Process Architecture",
               "Statutory State Progression: Journey & Exception Paths",
               "Deterministic finite-state machine governing advisory recommendations and legal evidence.")

    # Top Card: Main Happy Path (5 Connected Step Boxes with Arrows)
    add_card(s7, Inches(0.8), Inches(1.95), Inches(11.733), Inches(2.25), COLOR_CARD_BG, COLOR_EMERALD)
    tb_m = s7.shapes.add_textbox(Inches(1.05), Inches(2.05), Inches(11.2), Inches(0.35))
    tf_m = tb_m.text_frame; tf_m.word_wrap = True
    p = tf_m.paragraphs[0]; p.text = "MAIN STATUTORY JOURNEY: UNIDIRECTIONAL PROGRESSION TO EVIDENCE LOCK"; p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_EMERALD

    m_steps = [
        ("1. DRAFT", "Advisor selects drift baskets & rationale", COLOR_SLATE),
        ("2. SENT", "Encrypted link dispatched with 48h cutoff", COLOR_INDIGO),
        ("3. VIEWED", "Unlocked via PAN last-4 + DOB password", COLOR_AMBER),
        ("4. CONSENTED", "Declarations verified via 6-digit OTP", COLOR_EMERALD),
        ("5. LOCKED", "Chained SHA-256 BSA §63 receipt emitted", COLOR_NAVY),
    ]
    m_box_w = Inches(1.98)
    m_box_h = Inches(1.3)
    m_start_x = Inches(1.05)
    for j, (st_name, st_desc, col) in enumerate(m_steps):
        bx = m_start_x + Inches(j * (1.98 + 0.30))
        b = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, Inches(2.45), m_box_w, m_box_h)
        b.fill.solid(); b.fill.fore_color.rgb = COLOR_WHITE
        b.line.color.rgb = col; b.line.width = Pt(1.5)
        tf_b = b.text_frame; tf_b.word_wrap = True
        p = tf_b.paragraphs[0]; p.text = st_name; p.font.bold = True; p.font.size = Pt(11.5); p.font.color.rgb = col; p.space_after = Pt(2)
        p = tf_b.add_paragraph(); p.text = st_desc; p.font.size = Pt(10); p.font.color.rgb = COLOR_DARK_SLATE
        if j < 4:
            ax = bx + m_box_w + Inches(0.06)
            arr = s7.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, ax, Inches(2.95), Inches(0.18), Inches(0.2))
            arr.fill.solid(); arr.fill.fore_color.rgb = COLOR_EMERALD
            arr.line.fill.background()

    # Bottom Card: Terminal Exception Boundaries
    add_card(s7, Inches(0.8), Inches(4.35), Inches(11.733), Inches(2.35), COLOR_CARD_BG, COLOR_RED)
    tb_e = s7.shapes.add_textbox(Inches(1.05), Inches(4.45), Inches(11.2), Inches(0.35))
    tf_e = tb_e.text_frame; tf_e.word_wrap = True
    p = tf_e.paragraphs[0]; p.text = "TERMINAL EXCEPTION BOUNDARIES (STRICT SAFETY LIMITS & ACCESS HALTS)"; p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_RED

    # Root active box
    root_b = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(4.9), Inches(2.5), Inches(1.4))
    root_b.fill.solid(); root_b.fill.fore_color.rgb = COLOR_WHITE
    root_b.line.color.rgb = COLOR_INDIGO; root_b.line.width = Pt(1.5)
    tf_r = root_b.text_frame; tf_r.word_wrap = True
    p = tf_r.paragraphs[0]; p.text = "ACTIVE MANDATE"; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(2)
    p = tf_r.add_paragraph(); p.text = "Dispatched proposal in Sent or In-Review state."; p.font.size = Pt(10); p.font.color.rgb = COLOR_DARK_SLATE

    # 3 Exception Boxes with connecting arrows
    exc_boxes = [
        ("EXPIRED (HTTP 410)", "48-Hour Cutoff Elapses", "Proposal permanently invalidated to prevent stale execution."),
        ("REVOKED (HTTP 410)", "Advisor Retracts Mandate", "Emergency cancellation if market volatility alters investment drift."),
        ("LOCKED OUT (HTTP 429)", "3 Failed OTP Attempts", "Token burned immediately to neutralize brute-force attacks.")
    ]
    exc_w = Inches(2.65)
    for k, (ex_title, ex_sub, ex_desc) in enumerate(exc_boxes):
        ex_x = Inches(4.0) + Inches(k * 2.8)
        # Connecting Arrow
        arr = s7.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, ex_x - Inches(0.35), Inches(5.5), Inches(0.25), Inches(0.18))
        arr.fill.solid(); arr.fill.fore_color.rgb = COLOR_RED
        arr.line.fill.background()

        eb = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ex_x, Inches(4.9), exc_w, Inches(1.4))
        eb.fill.solid(); eb.fill.fore_color.rgb = COLOR_WHITE
        eb.line.color.rgb = COLOR_RED; eb.line.width = Pt(1.5)
        tf_eb = eb.text_frame; tf_eb.word_wrap = True
        p = tf_eb.paragraphs[0]; p.text = ex_title; p.font.bold = True; p.font.size = Pt(11); p.font.color.rgb = COLOR_RED; p.space_after = Pt(1)
        p = tf_eb.add_paragraph(); p.text = ex_sub; p.font.bold = True; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(2)
        p = tf_eb.add_paragraph(); p.text = ex_desc; p.font.size = Pt(9); p.font.color.rgb = COLOR_SLATE

    add_footer(s7, 7)
    set_speaker_notes(s7, "State transitions in FinConsent are strictly unidirectional. Once Consented or Expired, a mandate cannot be edited or revived.")

    print(f"[8/{TOTAL_SLIDES}] Generating Slide 8: Advisor Interface & Controls...")
    # =========================================================================
    # SLIDE 8: Advisor RIA Workspace (Matched Heights & Tightened Cards)
    # =========================================================================
    s8 = add_blank_slide()
    add_header(s8, "RIA Workspace",
               "The Advisor (RIA) Experience: Formulation & Real-Time Control",
               "Prudent Wealth Advisory center showing active practice mandates and countdown timers.")

    # Left: Browser Frame Screenshot
    add_browser_frame(s8, Inches(0.8), Inches(1.95), Inches(5.6), Inches(4.65),
                      "docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png",
                      "Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.")

    # Right: Callout Card with Native Bullets
    add_card(s8, Inches(6.8), Inches(1.95), Inches(5.733), Inches(4.65), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s8.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Advisor Capabilities & Controls"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "[1] Practice Workspace", "Scoped view displaying active mandates (Draft, Sent, Viewed, Consented, Expired, Revoked) with live 48-hour countdown badges.", font_size=13.5)
    add_bullet_point(tf, "[2] Client Registry", "Client management enforcing valid PAN syntax ([A-Z]{5}[0-9]{4}[A-Z]), masked presentation (XXXXX1234F), and mobile formatting.", font_size=13.5)
    add_bullet_point(tf, "[3] Rebalance Formulation", "Simultaneous formulation of current vs target allocations, sell baskets, buy baskets, and investment rationale.", font_size=13.5)
    add_bullet_point(tf, "[4] Emergency Revocation", "One-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market conditions shift.", font_size=13.5)

    add_footer(s8, 8)
    set_speaker_notes(s8, "Figure 8.1 shows the RIA dashboard. Note the 48-hour countdown badges. Advisers retain full control, including instant revocation.")

    print(f"[9/{TOTAL_SLIDES}] Generating Slide 9: Client Mobile Interface...")
    # =========================================================================
    # SLIDE 9: Client Mobile Screen (~390px View & Caption Clear of Footer)
    # =========================================================================
    s9 = add_blank_slide()
    add_header(s9, "Client Interface",
               "The Client Experience: Mobile-First Transparency",
               "Rohan Mehta's smartphone review interface designed for executive clarity on the go.")

    # Left: Genuine ~390px Mobile Phone Frame
    add_phone_frame(s9, Inches(1.2), Inches(1.85), Inches(2.7), Inches(4.65),
                    "docs/visual-audit/workflow/07-client-review-mobile.png",
                    "Figure 9.1: Rohan Mehta's Mobile Screen")

    # Right: Tightened Callout Card with Native Bullets
    add_card(s9, Inches(4.5), Inches(1.85), Inches(8.0), Inches(4.85), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s9.shapes.add_textbox(Inches(4.75), Inches(2.05), Inches(7.5), Inches(4.45))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Key Client-Facing Elements"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "[1] Direct Magic Link Convenience", "Clients tap the link received via email without remembering portal passwords or downloading an app.", font_size=13.5)
    add_bullet_point(tf, "[2] Allocation Drift Visualization", "High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%).", font_size=13.5)
    add_bullet_point(tf, "[3] Transparent Trade Baskets", "Exact share quantities, market values, ISIN numbers, and rationale displayed clearly (Tata Motors, HDFC Bank -> Bharat Bond, Gold ETF).", font_size=13.5)
    add_bullet_point(tf, "[4] Pre-Computed Tax Liability", "Displays estimated rupee liability (₹11,440) so the client understands net financial impact before consenting.", font_size=13.5)

    add_footer(s9, 9)
    set_speaker_notes(s9, "Here is Rohan's actual smartphone review screen. Note how the allocation drift and pre-computed ₹11,440 tax bill are visible before consent.")

    print(f"[10/{TOTAL_SLIDES}] Generating Slide 10: Password Gate & Key Derivation...")
    # =========================================================================
    # SLIDE 10: Mandate Password Gate (Genuine Mobile Capture + Sequence Flow)
    # =========================================================================
    s10 = add_blank_slide()
    add_header(s10, "Data Privacy Gate",
               "Mandate Security: Password-Protected Access Gate",
               "Zero sensitive financial disclosure prior to client identity verification.")

    # Left: Password Gate Phone Frame (Genuine ~390px Mobile Capture)
    add_phone_frame(s10, Inches(1.0), Inches(1.85), Inches(2.7), Inches(4.65),
                    "docs/visual-audit/mandate-security/07_mobile_unlock_screen.png",
                    "Figure 10.1: Client Password Gate on Mobile")

    # Right: Sequence Card with Native Bullets
    add_card(s10, Inches(4.3), Inches(1.9), Inches(8.2), Inches(4.85), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s10.shapes.add_textbox(Inches(4.55), Inches(2.1), Inches(7.7), Inches(4.45))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "PAN + DOB Password Mechanism & PBKDF2 Sequence"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(6)

    p = tf.add_paragraph()
    p.text = "Sequence: Magic Link ➜ Password Entry (PAN Last 4 + DOB) ➜ PBKDF2 Key Derivation ➜ DEK Unwrap ➜ Decrypt"
    p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(10)

    add_bullet_point(tf, "Zero PII Exposure Prior to Unlock", "If a link is leaked or forwarded, recipient sees only firm name; zero holdings or tax figures are emitted.", font_size=13)
    add_bullet_point(tf, "Deterministic Verification PIN", "Formatted as Last 4 PAN digits + Date of Birth (DDMMYYYY). Example: Rohan's PAN XXXXX1234F + 14/08/1978 = 123414081978.", font_size=13)
    add_bullet_point(tf, "PBKDF2 Key Derivation", "Derives 256-bit key using 100,000 SHA-256 iterations to unwrap Data Encryption Key (DEK).", font_size=13)
    add_bullet_point(tf, "Strict Online Rate Limiting", "Defended online by sliding-window rate limiters (5 failed attempts -> 15 min lockout) and offline by salted PBKDF2.", font_size=13)

    add_footer(s10, 10)
    set_speaker_notes(s10, "Figure 10.1 shows our password gate. The magic link alone reveals nothing. The client must enter their PAN last 4 and DOB to derive the key.")

    print(f"[11/{TOTAL_SLIDES}] Generating Slide 11: Real 403 Forbidden Screen...")
    # =========================================================================
    # SLIDE 11: Authentication & Tenant Isolation (Real 403 Screenshot)
    # =========================================================================
    s11 = add_blank_slide()
    add_header(s11, "Multi-Tenancy & RBAC",
               "Authentication, Authorization & Tenant Isolation",
               "Architectural barriers guaranteeing strict multi-tenant privacy across advisory practices.")

    # Left: Real 403 Screenshot in browser frame
    add_browser_frame(s11, Inches(0.8), Inches(1.95), Inches(5.6), Inches(4.65),
                      "docs/visual-audit/security/11-cross-ria-denied-foreign-client.png",
                      "Figure 11.1: Security Evidence — Cross-tenant access rejected with HTTP 403 Forbidden.")

    # Right: Tenancy Invariants Card with Native Bullets
    add_card(s11, Inches(6.8), Inches(1.95), Inches(5.733), Inches(4.65), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s11.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Tenancy Invariants & Controls"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Firm Tenancy Scoping", "Every database query for clients, mandates, and audit logs is strictly partitioned by authenticated firm ID (req.user.firmName).", font_size=13.5)
    add_bullet_point(tf, "Zero Cross-RIA Data Leakage", "RIA 1 attempting to query Client or Mandate of RIA 2 receives an immediate HTTP 403 Forbidden with zero data disclosure.", font_size=13.5)
    add_bullet_point(tf, "Role-Based Access Control (RBAC)", "Strict segregation across sebi-ria, hni-client, compliance_officer, admin, and guest personas.", font_size=13.5)
    add_bullet_point(tf, "Privilege Escalation Defense", "Client users navigating to advisor creation or billing routes are intercepted by React ProtectedRoute and Express middleware.", font_size=13.5)

    add_footer(s11, 11)
    set_speaker_notes(s11, "Figure 11.1 demonstrates our tenant isolation test. When an advisor from Firm A attempts to access Firm B's mandate, the API rejects with 403.")

    print(f"[12/{TOTAL_SLIDES}] Generating Slide 12: Dual-Envelope Encryption Flow...")
    # =========================================================================
    # SLIDE 12: Dual-Envelope Encryption (Visual Flow & Tightened Cards)
    # =========================================================================
    s12 = add_blank_slide()
    add_header(s12, "Cryptographic Core",
               "Data Security Architecture & Dual-Envelope Encryption",
               "Institutional cryptographic defense protecting financial mandates at rest and in transit.")

    col_w = Inches(3.64)
    # Card 1: Payload Encryption
    add_card(s12, Inches(0.8), Inches(1.95), col_w, Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s12.shapes.add_textbox(Inches(1.0), Inches(2.15), col_w - Inches(0.4), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Payload Encryption"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(8)
    add_bullet_point(tf, "Cipher", "AES-256-GCM authenticated cipher.", font_size=13)
    add_bullet_point(tf, "DEK", "256-bit random Data Encryption Key generated per mandate via CSPRNG.", font_size=13)
    add_bullet_point(tf, "IV Vector", "12-byte random initialization vector.", font_size=13)
    add_bullet_point(tf, "Auth Tag", "16-byte authentication tag ensuring ciphertext integrity and anti-tampering.", font_size=13)

    # Card 2: Dual Key Wrapping
    add_card(s12, Inches(4.84), Inches(1.95), col_w, Inches(4.8), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s12.shapes.add_textbox(Inches(5.04), Inches(2.15), col_w - Inches(0.4), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Dual Key Wrapping"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)
    add_bullet_point(tf, "Server Wrapping", "DEK encrypted with isolated Server Master Key (SERVER_MASTER_KEY) for RIA dashboard access.", font_size=13)
    add_bullet_point(tf, "Client Wrapping", "DEK encrypted with key derived from PBKDF2(PAN_last_4 + DOB, salt, 100k rounds).", font_size=13)
    add_bullet_point(tf, "Zero Plaintext", "Neither plaintext DEK nor client password stored in database.", font_size=13)

    # Card 3: Transit & Storage
    add_card(s12, Inches(8.88), Inches(1.95), col_w, Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s12.shapes.add_textbox(Inches(9.08), Inches(2.15), col_w - Inches(0.4), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Transit & Storage"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)
    add_bullet_point(tf, "Token Hashing", "256-bit raw token stored in DB strictly as SHA-256 digest.", font_size=13)
    add_bullet_point(tf, "In-Transit Security", "Forced TLS 1.3 with Helmet HSTS (1-year max-age: 31,536,000s).", font_size=13)
    add_bullet_point(tf, "Zero Secret Logs", "Passwords, OTPs, and tokens sanitized from all logs.", font_size=13)

    add_footer(s12, 12)
    set_speaker_notes(s12, "Dual-envelope encryption ensures that even if database records are compromised, financial payloads cannot be decrypted without the Server Master Key or client password.")

    print(f"[13/{TOTAL_SLIDES}] Generating Slide 13: OTP Integrity & Lockout...")
    # =========================================================================
    # SLIDE 13: OTP Verification & Attempt Lockout (Tightened Cards)
    # =========================================================================
    s13 = add_blank_slide()
    add_header(s13, "Consent Verification",
               "OTP & Consent Integrity: Anti-Tamper Authorization",
               "Statutory verification guaranteeing explicit non-discretionary client approval.")

    # Left: OTP Modal Screenshot
    add_browser_frame(s13, Inches(0.8), Inches(1.95), Inches(5.6), Inches(4.65),
                      "docs/visual-audit/security/06-client-otp-modal.png",
                      "Figure 13.1: 6-Digit Mobile OTP Modal with 5-minute statutory timer.")

    # Right: Safeguards Card with Native Bullets
    add_card(s13, Inches(6.8), Inches(1.95), Inches(5.733), Inches(4.65), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s13.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Statutory Authorization Safeguards"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Mandatory Declarations", "Clients must actively check 3 statutory declarations (Regulation 19 Informed Consent, Capital Gains Acceptance, Section 63 BSA Evidence).", font_size=13.5)
    add_bullet_point(tf, "Dynamic 6-Digit OTP", "Generated via CSPRNG with 5-minute TTL; delivered via registered email and in-app display (SMS disabled by policy).", font_size=13.5)
    add_bullet_point(tf, "3-Attempt Brute-Force Lockout", "Maximum 3 verification attempts permitted. A 3rd failed attempt immediately locks verification and burns token (HTTP 429).", font_size=13.5)
    add_bullet_point(tf, "Single-Use Atomic Revocation", "The instant consent succeeds, the magic token is burned. Re-accessing returns HTTP 410 Gone, preventing replay attacks.", font_size=13.5)

    add_footer(s13, 13)
    set_speaker_notes(s13, "Figure 13.1 displays the client OTP modal. Notice the 3 statutory checkboxes that must be acknowledged before the 6-digit OTP can be verified.")

    print(f"[14/{TOTAL_SLIDES}] Generating Slide 14: Audit Trail & Hash Chain...")
    # =========================================================================
    # SLIDE 14: Audit Trail / Compliance Evidence (Cropped Receipt + Hash Chain)
    # =========================================================================
    s14 = add_blank_slide()
    add_header(s14, "Audit Infrastructure",
               "Audit Trail & Compliance Evidence: Cryptographic Proof",
               "Chained SHA-256 audit ledger meeting Section 63 BSA and SEBI Regulation 19 standards.")

    # Left: Cropped & Enlarged Compliance Receipt
    add_browser_frame(s14, Inches(0.8), Inches(1.95), Inches(5.6), Inches(4.65),
                      "docs/visual-audit/mandate-security/06_consent_locked_evidence.png",
                      "Figure 14.1: Section 63 BSA / Section 65B Compliance Receipt.")

    # Right: Hash Chain & Admissibility Card with Native Bullets
    add_card(s14, Inches(6.8), Inches(1.95), Inches(5.733), Inches(4.65), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s14.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Legal Admissibility & Hash Chaining"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Forward Hash Chaining", "Each log entry hashes the previous record: payloadHash = SHA256(prevHash + timestamp + event + payload). Any retroactive tampering breaks chain.", font_size=13.5)
    add_bullet_point(tf, "Section 63 BSA Certificate", "Captures client device IP (RFC 5737 203.0.113.12), browser User-Agent, exact IST timestamp, and masked PAN (XXXXX1234F).", font_size=13.5)
    add_bullet_point(tf, "5-Year Regulatory Preservation", "Designed to satisfy SEBI Regulation 19 mandatory 5-year retention requirements for investment advice and rationale.", font_size=13.5)
    add_bullet_point(tf, "Verified Disaster Recovery", "Non-destructive drill restored 1,460 audit logs with zero broken cryptographic hash links.", font_size=13.5)

    add_footer(s14, 14)
    set_speaker_notes(s14, "Figure 14.1 shows the Section 63 BSA compliance receipt generated at the exact millisecond consent is locked.")

    print(f"[15/{TOTAL_SLIDES}] Generating Slide 15: Restored Graphviz Lifecycle...")
    # =========================================================================
    # SLIDE 15: Mandate Lifecycle (Restored Graphviz Diagram - No Footer Collision)
    # =========================================================================
    s15 = add_blank_slide()
    add_header(s15, "State Machine",
               "Mandate Lifecycle & State Model: Server-Enforced Transitions",
               "Finite-state machine guaranteeing deterministic transitions with zero client-side bypass.")

    # Insert High-Res Graphviz Diagram cleanly within boundaries
    diag_path = os.path.join(DIAGRAMS_DIR, "process-flow.png")
    if os.path.exists(diag_path):
        # 3104 x 1432 -> ratio ~ 2.167
        img_h = Inches(4.75)
        img_w = Inches(10.3)
        img_left = Inches(1.51)
        img_top = Inches(1.95)
        s15.shapes.add_picture(diag_path, img_left, img_top, img_w, img_h)

    add_footer(s15, 15)
    set_speaker_notes(s15, "This restored Graphviz state diagram illustrates the immutable lifecycle transitions: Draft to Sent, Viewed upon password entry, Consented upon OTP verification, or terminated via Expiry or RIA Revocation.")

    print(f"[16/{TOTAL_SLIDES}] Generating Slide 16: Visible Chat vs Consent Rail...")
    # =========================================================================
    # SLIDE 16: Mandate-Specific Chat Rail (Actual Chat Question + Native Bullets)
    # =========================================================================
    s16 = add_blank_slide()
    add_header(s16, "Discussion Rail",
               "Mandate-Specific Chat: Advisory Clarification vs. Consent",
               "Why in-app discussion is vital for client trust, but legally distinct from trade consent.")

    # Left: Genuine Chat Question Phone Frame (No Mid-Page Nav Artefact)
    add_phone_frame(s16, Inches(1.0), Inches(1.85), Inches(2.7), Inches(4.65),
                    "docs/visual-audit/mandate-security/09_mobile_chat_discussion.png",
                    "Figure 16.1: Rohan posts an inquiry regarding Tata Motors.")

    # Right: Statutory Separation Card with Native Bullets
    add_card(s16, Inches(4.3), Inches(1.85), Inches(8.2), Inches(4.85), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s16.shapes.add_textbox(Inches(4.55), Inches(2.05), Inches(7.7), Inches(4.45))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Separation of Communication & Consent"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Real-Time Contextual Discussion", "Allows clients to ask specific allocation or yield questions directly within mandate context, eliminating scattered WhatsApp threads.", font_size=13.5)
    add_bullet_point(tf, "Complete Audit Archiving", "Every message posted by client or advisor is committed to immutable audit log under CHAT_MESSAGE_SENT.", font_size=13.5)
    add_bullet_point(tf, "⚠️ CHAT DOES NOT CONSTITUTE CONSENT", "Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions.", font_size=13.5)
    add_bullet_point(tf, "Uncompromising Consent Rail", "Trade authorization strictly requires formal statutory declaration checkboxes followed by 6-digit OTP verification.", font_size=13.5)

    add_footer(s16, 16)
    set_speaker_notes(s16, "In Figure 16.1, Rohan asks: 'Why sell Tata Motors now?'. Suresh clarifies directly inside the secure mandate. Crucially, chat dialogue never substitutes for OTP consent.")

    print(f"[17/{TOTAL_SLIDES}] Generating Slide 17: Aligned Tax Table & Schedule...")
    # =========================================================================
    # SLIDE 17: Tax-Impact Transparency (Native Table & Schedule Aligned Perfectly)
    # =========================================================================
    s17 = add_blank_slide()
    add_header(s17, "Tax Engine",
               "Tax-Impact Transparency: Finance Act 2024 Engine",
               "Pre-trade capital gains tax visibility eliminating investor surprise liabilities.")

    # Left: Native Editable PowerPoint Table for Tax Calculation (top: 1.95", height: 4.8")
    table_shape = s17.shapes.add_table(5, 4, Inches(0.8), Inches(1.95), Inches(6.0), Inches(3.2))
    table = table_shape.table
    table.columns[0].width = Inches(2.1)
    table.columns[1].width = Inches(1.3)
    table.columns[2].width = Inches(1.3)
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

    tb_disc = s17.shapes.add_textbox(Inches(0.8), Inches(5.35), Inches(6.0), Inches(1.4))
    tf_disc = tb_disc.text_frame; tf_disc.word_wrap = True
    add_bullet_point(tf_disc, "Tax Invariant Note", "Excludes individual surcharges (up to 15% on equity capital gains) and prior carried-forward losses. Annual aggregate LTCG exemption of ₹1,25,000 applied under Section 112A.", font_size=12)

    # Right: Advance Tax Schedule Card (top: 1.95", height: 4.8" - Aligned to exact top and bottom!)
    add_card(s17, Inches(7.1), Inches(1.95), Inches(5.433), Inches(4.8), COLOR_CARD_BG, COLOR_AMBER)
    tb_adv = s17.shapes.add_textbox(Inches(7.35), Inches(2.15), Inches(4.9), Inches(4.4))
    tf_adv = tb_adv.text_frame; tf_adv.word_wrap = True
    p = tf_adv.paragraphs[0]; p.text = "Quarterly Advance Tax Schedule (Sec 208 & 234C)"; p.font.bold = True; p.font.size = Pt(15); p.font.color.rgb = COLOR_AMBER; p.space_after = Pt(10)

    add_bullet_point(tf_adv, "1st Installment (15%)", "On or before 15th June", font_size=13.5)
    add_bullet_point(tf_adv, "2nd Installment (45%)", "On or before 15th September", font_size=13.5)
    add_bullet_point(tf_adv, "3rd Installment (75%)", "On or before 15th December", font_size=13.5)
    add_bullet_point(tf_adv, "4th Installment (100%)", "On or before 15th March", font_size=13.5)

    add_bullet_point(tf_adv, "Proviso to Section 234C", "Relieves penal interest for installments prior to the capital gains realization date if remaining tax is paid in subsequent installments.", font_size=12.5)

    add_footer(s17, 17)
    set_speaker_notes(s17, "This native table shows the verified tax model: ₹11,000 STCG + ₹0 LTCG (exempt under ₹1.25L) + ₹440 cess = ₹11,440. On the right is the advance tax installment calendar.")

    print(f"[18/{TOTAL_SLIDES}] Generating Slide 18: Rounded Language Chips...")
    # =========================================================================
    # SLIDE 18: Multilingual Localization (Actual Rounded PowerPoint Chips)
    # =========================================================================
    s18 = add_blank_slide()
    add_header(s18, "Accessibility & i18n",
               "Multilingual Localization Capability: 8 Languages",
               "Delivering advisory transparency in regional and international languages.")

    # Top Card: 8 Rounded Language Chips
    add_card(s18, Inches(0.8), Inches(1.95), Inches(11.733), Inches(2.2), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb_lh = s18.shapes.add_textbox(Inches(1.05), Inches(2.1), Inches(11.2), Inches(0.4))
    tf_lh = tb_lh.text_frame
    p = tf_lh.paragraphs[0]; p.text = "8 Fully Supported Languages Across Client & Advisor Portals"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY

    languages = [
        ("English (en)", Inches(1.05), Inches(2.6)),
        ("हिंदी (hi)", Inches(3.85), Inches(2.6)),
        ("தமிழ் (ta)", Inches(6.65), Inches(2.6)),
        ("বাংলা (bn)", Inches(9.45), Inches(2.6)),
        ("ગુજરાતી (gu)", Inches(1.05), Inches(3.4)),
        ("Deutsch (de)", Inches(3.85), Inches(3.4)),
        ("日本語 (ja)", Inches(6.65), Inches(3.4)),
        ("한국어 (ko)", Inches(9.45), Inches(3.4))
    ]
    for lang_text, chip_x, chip_y in languages:
        chip = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, chip_x, chip_y, Inches(2.5), Inches(0.6))
        chip.fill.solid(); chip.fill.fore_color.rgb = COLOR_INDIGO_LIGHT
        chip.line.color.rgb = COLOR_INDIGO; chip.line.width = Pt(1)
        tf_chip = chip.text_frame; tf_chip.word_wrap = False
        p_c = tf_chip.paragraphs[0]; p_c.text = lang_text; p_c.font.bold = True; p_c.font.size = Pt(13); p_c.font.color.rgb = COLOR_INDIGO; p_c.alignment = PP_ALIGN.CENTER

    # Bottom Card: Financial Invariant with Native Bullets
    add_card(s18, Inches(0.8), Inches(4.35), Inches(11.733), Inches(2.45), COLOR_CARD_BG, COLOR_EMERALD)
    tb_inv = s18.shapes.add_textbox(Inches(1.05), Inches(4.5), Inches(11.2), Inches(2.15))
    tf_inv = tb_inv.text_frame; tf_inv.word_wrap = True
    p = tf_inv.paragraphs[0]; p.text = "Financial Invariant: Standardized ASCII Numerals Across All Locales"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)

    add_bullet_point(tf_inv, "Western Arabic Digits (0-9)", "Under regulatory standards, all rupee amounts (₹), trade quantities, percentages, and ISIN codes remain strictly in ASCII English numerals across all locales, eliminating ambiguity during legal disputes.", font_size=13.5)
    add_bullet_point(tf_inv, "Universal Accessibility", "HNIs review proposals, disclosures, and receipts in their preferred language while financial terms remain standardized.", font_size=13.5)
    add_bullet_point(tf_inv, "Seamless Profile Toggling", "Advisers and clients switch languages seamlessly via navigation bar or profile settings.", font_size=13.5)

    add_footer(s18, 18)
    set_speaker_notes(s18, "FinConsent supports 8 languages while strictly enforcing ASCII numerals for all financial figures to avoid dispute ambiguities.")

    print(f"[19/{TOTAL_SLIDES}] Generating Slide 19: Restored Visual Architecture...")
    # =========================================================================
    # SLIDE 19: Technical Architecture (Visual Tier Layout - No Footer Collision)
    # =========================================================================
    s19 = add_blank_slide()
    add_header(s19, "System Topology",
               "Technical Architecture: Security & Service Boundaries",
               "High-level system topology illustrating frontend, API, security engine, and storage tiers.")

    # Outer Dashed VPC Boundary Box (AWS Mumbai Region ap-south-1)
    vpc_box = s19.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.95), Inches(11.733), Inches(4.8))
    vpc_box.fill.solid(); vpc_box.fill.fore_color.rgb = COLOR_CARD_BG
    vpc_box.line.color.rgb = COLOR_INDIGO; vpc_box.line.width = Pt(1.5)

    # 4 Structured Tiers inside (Guaranteed to fit without clipping)
    tiers = [
        ("CLIENT TIER: Desktop Advisory Hub (React 18 / MUI) & Mobile Review Screen (360px)",
         "TLS 1.3 / HTTPS Ingress Gateway with Helmet HSTS (1-Year Max Age Header)",
         Inches(1.05), Inches(2.1), Inches(11.233), Inches(0.95), COLOR_NAVY, COLOR_WHITE),
        ("API GATEWAY & SECURITY TIER: Express Node.js REST API",
         "Strict Firm Tenancy Middleware  |  TOTP Staff MFA  |  Sliding-Window Rate Limiting  |  Sanitization",
         Inches(1.05), Inches(3.2), Inches(11.233), Inches(0.95), COLOR_INDIGO_LIGHT, COLOR_NAVY),
        ("CORE BUSINESS ENGINES: State Machine Engine & Tax Calculation Core",
         "Finance Act 2024 Engine (STCG 20%, LTCG 12.5%)  |  Dual-Envelope AES-256-GCM  |  In-App Chat Rail",
         Inches(1.05), Inches(4.3), Inches(11.233), Inches(0.95), COLOR_CARD_BG, COLOR_DARK_SLATE),
        ("PERSISTENT DATA & AUDIT TIER: MongoDB Atlas (AWS Mumbai ap-south-1)",
         "Dedicated SERVER_MASTER_KEY Isolation  |  Append-Only SHA-256 Chained Ledger  |  PITR Recovery",
         Inches(1.05), Inches(5.4), Inches(11.233), Inches(0.95), COLOR_EMERALD_LIGHT, COLOR_NAVY)
    ]

    for title, subtitle, tx, ty, tw, th, bg_col, text_col in tiers:
        t_card = s19.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty, tw, th)
        t_card.fill.solid(); t_card.fill.fore_color.rgb = bg_col
        t_card.line.color.rgb = COLOR_CARD_BORDER; t_card.line.width = Pt(1)
        tb_t = s19.shapes.add_textbox(tx + Inches(0.15), ty + Inches(0.1), tw - Inches(0.3), th - Inches(0.2))
        tf_t = tb_t.text_frame; tf_t.word_wrap = True
        p = tf_t.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(13); p.font.color.rgb = text_col
        p = tf_t.add_paragraph(); p.text = subtitle; p.font.size = Pt(11.5); p.font.color.rgb = COLOR_SLATE if bg_col != COLOR_NAVY else RGBColor(165, 180, 252)

    add_footer(s19, 19)
    set_speaker_notes(s19, "This architectural topology illustrates our 4-tier separation between frontend, API gateway, core engines, and persistent data tiers in AWS Mumbai.")

    print(f"[20/{TOTAL_SLIDES}] Generating Slide 20: Real Lockout & Threat Modeling...")
    # =========================================================================
    # SLIDE 20: Threat Scenarios & Protections (Real Lockout Screenshot)
    # =========================================================================
    s20 = add_blank_slide()
    add_header(s20, "Threat Modeling",
               "Security Threat Scenarios & Evidenced Protections",
               "Proven runtime boundary enforcement against malicious and accidental vectors.")

    # Left: Real Lockout Screenshot in browser frame
    add_browser_frame(s20, Inches(0.8), Inches(1.95), Inches(5.6), Inches(4.65),
                      "docs/visual-audit/security/17-otp-lockout-after-3-failures.png",
                      "Figure 20.1: Security Evidence — OTP lockout engaged after 3 failed verification attempts.")

    # Right: Threat -> Defence Mapping Card with Native Bullets
    add_card(s20, Inches(6.8), Inches(1.95), Inches(5.733), Inches(4.65), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s20.shapes.add_textbox(Inches(7.05), Inches(2.15), Inches(5.2), Inches(4.3))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Threat Modeling & Architectural Defenses"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Credential Stuffing & OTP Brute-Force", "Sliding-window rate limiters block rapid bursts; 3 failed OTPs permanently lock the token (HTTP 429).", font_size=13.5)
    add_bullet_point(tf, "Cross-Tenant IDOR & Privilege Escalation", "Tampering with mandate or client UUIDs across RIA practices rejected with HTTP 403 Forbidden.", font_size=13.5)
    add_bullet_point(tf, "Expired / Replay Attacks", "Opening links past the 48-hour cutoff or after successful consent returns HTTP 410 Gone / Revoked.", font_size=13.5)
    add_bullet_point(tf, "Token Sniffing & Database Breaches", "Plaintext magic tokens are never persisted in the database (stored strictly as SHA-256 hashes).", font_size=13.5)

    add_footer(s20, 20)
    set_speaker_notes(s20, "Figure 20.1 shows our automated security test verifying that after 3 failed OTP attempts, verification is permanently locked.")

    print(f"[21/{TOTAL_SLIDES}] Generating Slide 21: Consistent-Color Statistics...")
    # =========================================================================
    # SLIDE 21: Operational Validation (Consistent Color, '230 / 230' on 1 Line)
    # =========================================================================
    s21 = add_blank_slide()
    add_header(s21, "Evidence Base",
               "Operational & Testing Validation: Grounded in Real Runs",
               "Concrete evidence demonstrating zero regressions across automated and browser tests.")

    w_card = Inches(2.7)
    x_pos = [Inches(0.8), Inches(3.8), Inches(6.8), Inches(9.8)]
    stats_data = [
        ("230 / 230", "Automated Tests Passing", "17 test suites running across tax calculation, security, RBAC, i18n, and API regressions (100% pass rate)."),
        ("81", "Screenshots Captured", "42 baseline, 25 security, and 14 mandate-security screenshots verifying desktop and mobile viewports."),
        ("1,460", "Records Disaster Drill", "Synthetic non-destructive restore drill verified 1,460 audit logs with zero broken cryptographic hash links."),
        ("0", "Broken Hash Chains", "Full mathematical continuity verified across all state changes, guaranteeing tamper-evident audit records.")
    ]

    for i, (num, label, desc) in enumerate(stats_data):
        x = x_pos[i]
        add_card(s21, x, Inches(1.95), w_card, Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
        tb = s21.shapes.add_textbox(x + Inches(0.12), Inches(2.15), w_card - Inches(0.24), Inches(4.4))
        tf = tb.text_frame; tf.word_wrap = True

        p = tf.paragraphs[0]; p.text = num; p.font.bold = True; p.font.size = Pt(36 if len(num) > 4 else 48); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(6)
        p = tf.add_paragraph(); p.text = label; p.font.bold = True; p.font.size = Pt(14.5); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(13); p.font.color.rgb = COLOR_SLATE

    add_footer(s21, 21)
    set_speaker_notes(s21, "All 230 Vitest tests pass with 0 regressions. 81 screenshots verify UI across roles, and 1,460 audit records verified in disaster recovery.")

    print(f"[22/{TOTAL_SLIDES}] Generating Slide 22: Deployment & Hosting...")
    # =========================================================================
    # SLIDE 22: Deployment & Hosting Architecture (Tighter Card Style)
    # =========================================================================
    s22 = add_blank_slide()
    add_header(s22, "Infrastructure",
               "Deployment Architecture: Indian Data Sovereignty",
               "Compliance with SEBI Cybersecurity Framework (CSCRF) and DPDP directives.")

    grid_w = Inches(5.7)
    grid_h = Inches(2.25)
    cards = [
        ("Territorial Data Residency (ap-south-1)",
         "All primary databases, cryptographic keys, and audit ledgers reside exclusively in AWS Asia Pacific (Mumbai) region (ap-south-1) to comply with SEBI CSCRF and DPDP Act directives.",
         COLOR_EMERALD, Inches(0.8), Inches(1.95)),
        ("Multi-Stage Production Containers",
         "Hardened Docker multi-stage build packaging optimized Vite static assets and hardened Express Node.js ESM runtime with zero external runtime package installations.",
         COLOR_INDIGO, Inches(6.833), Inches(1.95)),
        ("Orchestration & Health Probes",
         "Production container environment with automated /api/health and /api/ready probes reporting database connectivity, readiness, and active tenancy health.",
         COLOR_NAVY, Inches(0.8), Inches(4.45)),
        ("Cryptographic Key Isolation",
         "Server Master Key (SERVER_MASTER_KEY) isolated from application authentication secrets (JWT_SECRET); zero third-party advertising tracking or analytics beacons.",
         COLOR_AMBER, Inches(6.833), Inches(4.45))
    ]

    for title, desc, stroke, x, y in cards:
        add_card(s22, x, y, grid_w, grid_h, COLOR_CARD_BG, stroke)
        tb = s22.shapes.add_textbox(x + Inches(0.2), y + Inches(0.15), grid_w - Inches(0.4), grid_h - Inches(0.3))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = stroke; p.space_after = Pt(6)
        p = tf.add_paragraph(); p.text = desc; p.font.size = Pt(14); p.font.color.rgb = COLOR_DARK_SLATE

    add_footer(s22, 22)
    set_speaker_notes(s22, "Data sovereignty is absolute: all data resides in AWS Mumbai (ap-south-1). No data leaves Indian territory.")

    print(f"[23/{TOTAL_SLIDES}] Generating Slide 23: Business Value & Practice Outcomes...")
    # =========================================================================
    # SLIDE 23: Business Value & Practice Impact (Tighter Style, Native Bullets)
    # =========================================================================
    s23 = add_blank_slide()
    add_header(s23, "Business Impact",
               "Business Value & Practice Impact for Advisory Firms",
               "Quantifiable efficiency, compliance security, and investor satisfaction gains.")

    col_w = Inches(3.64)
    outcomes = [
        ("100% Inspection-Ready",
         [("Instant Dossiers", "Downloadable Section 63 BSA compliance dossiers provide contemporaneous regulatory evidence."),
          ("Time Savings", "Replaces weeks of manual audit trail compilation with instantaneous verification."),
          ("Legal Protection", "Safeguards RIA practice against claims of unauthorized or discretionary trading.")],
         COLOR_EMERALD),
        ("Zero Tax Shocks",
         [("Pre-Trade Visibility", "Complete pre-trade capital gains tax visibility eliminates investor surprise liabilities."),
          ("Statutory Alerts", "Proactively alerts clients to quarterly advance tax obligations under Section 208 and 234C."),
          ("Client Trust", "Elevates advisory relationship from administrative chasing to high-trust strategic planning.")],
         COLOR_AMBER),
        ("< 2h Turnaround",
         [("Mobile Acceleration", "Accelerates client review and consent turnaround to under 2 hours on mobile."),
          ("Reduced Slippage", "Minimizes market slippage during high-volatility rebalancing windows."),
          ("Frictionless", "Secure password-protected magic link delivery without requiring app installation.")],
         COLOR_INDIGO)
    ]

    for i, (title, points, stroke) in enumerate(outcomes):
        x = Inches(0.8) + Inches(i * 4.04)
        add_card(s23, x, Inches(1.95), col_w, Inches(4.8), COLOR_CARD_BG, stroke)
        tb = s23.shapes.add_textbox(x + Inches(0.18), Inches(2.15), col_w - Inches(0.36), Inches(4.4))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = title; p.font.bold = True; p.font.size = Pt(17); p.font.color.rgb = stroke; p.space_after = Pt(10)
        for lbl, txt in points:
            add_bullet_point(tf, lbl, txt, font_size=13)

    add_footer(s23, 23)
    set_speaker_notes(s23, "The impact is threefold: 100% inspection-ready compliance, zero client tax shocks, and consent turnaround in under two hours.")

    print(f"[24/{TOTAL_SLIDES}] Generating Slide 24: Redesigned Comparison Matrix...")
    # =========================================================================
    # SLIDE 24: Transformation Comparison Table (Redesigned with ✓/✗)
    # =========================================================================
    s24 = add_blank_slide()
    add_header(s24, "The Transformation",
               "The Transformation: What Changes for Advisor and Client",
               "Comparing legacy advisory friction with FinConsent's institutional digital rail.")

    comp_table_shape = s24.shapes.add_table(5, 3, Inches(0.8), Inches(1.95), Inches(11.733), Inches(4.8))
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

    print(f"[25/{TOTAL_SLIDES}] Generating Slide 25: Appendix Section Divider...")
    # =========================================================================
    # SLIDE 25: NEW Appendix Section Divider (Dark Layout)
    # =========================================================================
    s25 = add_blank_slide(is_dark=True)
    tb_div = s25.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.733), Inches(4.5))
    tf_div = tb_div.text_frame; tf_div.word_wrap = True

    p = tf_div.paragraphs[0]
    p.text = "SECTION II • ARCHITECTURAL & STATUTORY SPECIFICATIONS"
    p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = RGBColor(165, 180, 252); p.space_after = Pt(12)

    p = tf_div.add_paragraph()
    p.text = "Technical & Regulatory Appendices"
    p.font.bold = True; p.font.size = Pt(40); p.font.color.rgb = COLOR_WHITE; p.space_after = Pt(16)

    p = tf_div.add_paragraph()
    p.text = "Comprehensive formal specifications, mathematical invariants, access control matrices, and evidentiary frameworks supporting FinConsent's compliance architecture."
    p.font.size = Pt(16); p.font.color.rgb = RGBColor(226, 232, 240); p.space_after = Pt(32)

    # 4 Overview Cards on Dark Divider
    app_tiles = [
        ("Appendix A: Cryptography", "AES-256-GCM, 100k-round PBKDF2 & dual-envelope key wrapping specifications."),
        ("Appendix B: Access Matrix", "Granular API route permissions and firm tenancy scoping invariants across roles."),
        ("Appendix C: BSA §63 Ledger", "Mandatory electronic evidence attributes, hash chaining schema & court admissibility."),
        ("Appendix D: Operational Scope", "Strict demarcation of implemented production state vs future product roadmap.")
    ]
    tile_w = Inches(2.7)
    for i, (t_title, t_desc) in enumerate(app_tiles):
        tx = Inches(0.8) + Inches(i * 3.0)
        c_tile = s25.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, Inches(4.8), tile_w, Inches(1.8))
        c_tile.fill.solid(); c_tile.fill.fore_color.rgb = RGBColor(15, 23, 42)
        c_tile.line.color.rgb = RGBColor(51, 65, 85); c_tile.line.width = Pt(1)
        tb_tile = s25.shapes.add_textbox(tx + Inches(0.12), Inches(4.9), tile_w - Inches(0.24), Inches(1.6))
        tf_t = tb_tile.text_frame; tf_t.word_wrap = True
        p = tf_t.paragraphs[0]; p.text = t_title; p.font.bold = True; p.font.size = Pt(12.5); p.font.color.rgb = RGBColor(165, 180, 252); p.space_after = Pt(4)
        p = tf_t.add_paragraph(); p.text = t_desc; p.font.size = Pt(11); p.font.color.rgb = RGBColor(203, 213, 225)

    add_footer(s25, 25, is_dark=True)
    set_speaker_notes(s25, "This divider introduces the technical appendices, detailing formal cryptographic proofs, RBAC matrices, and legal evidentiary standards.")

    print(f"[26/{TOTAL_SLIDES}] Generating Slide 26: Appendix A — Cryptographic Deep-Dive...")
    # =========================================================================
    # SLIDE 26: Appendix A — Cryptographic Invariants (Native Bullets)
    # =========================================================================
    s26 = add_blank_slide()
    add_header(s26, "Appendix A",
               "Technical Deep-Dive: Cryptographic Invariants & Key Derivation",
               "Formal mathematical specifications for envelope encryption and PBKDF2 KDF.")

    add_card(s26, Inches(0.8), Inches(1.95), Inches(11.733), Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s26.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(11.2), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Cryptographic Implementation Specifications"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "Symmetric Cipher", "AES-256-GCM (Galois/Counter Mode) with 12-byte random IV and 16-byte authentication tag ensuring anti-tampering.", font_size=13.5)
    add_bullet_point(tf, "Key Derivation Function", "PBKDF2 with SHA-256 digest, 100,000 rounds in production (1,000 in test mode), and 16-byte random salt.", font_size=13.5)
    add_bullet_point(tf, "Key Derivation Input", "Normalized string concatenation of PAN last 4 digits + DOB in DDMMYYYY format (e.g. '123414081978').", font_size=13.5)
    add_bullet_point(tf, "Dual Wrapping Invariant", "Server DEK wrapped with isolated SERVER_MASTER_KEY; Client DEK wrapped with Client Derived Key.", font_size=13.5)
    add_bullet_point(tf, "Zero Secret Storage", "The database never persists client plaintext passwords, unencrypted DEKs, or plaintext magic tokens.", font_size=13.5)

    add_footer(s26, 26)
    set_speaker_notes(s26, "Appendix A outlines the formal cryptographic specifications: AES-256-GCM, 100,000 rounds of PBKDF2, and zero plaintext secret storage.")

    print(f"[27/{TOTAL_SLIDES}] Generating Slide 27: Appendix B — RBAC & Permission Matrix...")
    # =========================================================================
    # SLIDE 27: Appendix B — Authorization Matrix (Native Table with Chips)
    # =========================================================================
    s27 = add_blank_slide()
    add_header(s27, "Appendix B",
               "Role-Based Authorization Matrix (RBAC)",
               "Detailed API permission matrix with monospaced endpoints and coloured permission chips.")

    rbac_table_shape = s27.shapes.add_table(6, 4, Inches(0.8), Inches(1.95), Inches(11.733), Inches(4.8))
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

    add_footer(s27, 27)
    set_speaker_notes(s27, "Appendix B provides the role-based access matrix. Every API endpoint enforces strict authorization rules.")

    print(f"[28/{TOTAL_SLIDES}] Generating Slide 28: Appendix C — Section 63 BSA Admissibility...")
    # =========================================================================
    # SLIDE 28: Appendix C — Audit Schema (Shortened Title, Native Bullets)
    # =========================================================================
    s28 = add_blank_slide()
    add_header(s28, "Appendix C",
               "Audit Schema & Section 63 BSA Admissibility",
               "Evidentiary record structures required by Indian legal standards.")

    add_card(s28, Inches(0.8), Inches(1.95), Inches(11.733), Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s28.shapes.add_textbox(Inches(1.05), Inches(2.15), Inches(11.2), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Section 63 BSA Mandatory Evidentiary Attributions"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(10)

    add_bullet_point(tf, "1. Origin Identification", "Client IP Address (RFC 5737 203.0.113.12) and browser User-Agent recorded at execution time.", font_size=13.5)
    add_bullet_point(tf, "2. Synchronized Timestamp", "Server-side NTP timestamping localized to Indian Standard Time (IST).", font_size=13.5)
    add_bullet_point(tf, "3. Hash Integrity Seal", "SHA-256 payloadHash computed over immutable consent certificate.", font_size=13.5)
    add_bullet_point(tf, "4. Device Custody Proof", "Evidence that the computer system was operating properly during record generation.", font_size=13.5)
    add_bullet_point(tf, "5. Regulation 19 Admissibility", "Cryptographically chained forward hashes guarantee zero retroactive modifications.", font_size=13.5)

    add_footer(s28, 28)
    set_speaker_notes(s28, "Appendix C details the exact criteria required under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for electronic records to be admitted in court.")

    print(f"[29/{TOTAL_SLIDES}] Generating Slide 29: Appendix D — Implemented vs Roadmap...")
    # =========================================================================
    # SLIDE 29: Appendix D — Implemented vs. Roadmap (Tightened Cards, Native Bullets)
    # =========================================================================
    s29 = add_blank_slide()
    add_header(s29, "Appendix D",
               "Operational Considerations: Implemented State vs. Roadmap",
               "Clear demarcation between current production capabilities and future roadmap milestones.")

    card_w = Inches(5.7)
    # Left Card: Implemented Capabilities
    add_card(s29, Inches(0.8), Inches(1.95), card_w, Inches(4.8), COLOR_CARD_BG, COLOR_EMERALD)
    tb = s29.shapes.add_textbox(Inches(1.05), Inches(2.15), card_w - Inches(0.5), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Implemented Capabilities (Now)"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_EMERALD; p.space_after = Pt(8)

    add_bullet_point(tf, "Non-Discretionary Mandates", "Formulation & Finance Act 2024 tax engine.", font_size=13)
    add_bullet_point(tf, "Dual-Envelope Encryption", "AES-256-GCM cipher with PBKDF2 client password gate.", font_size=13)
    add_bullet_point(tf, "256-bit Magic Links", "SHA-256 database hashing with 48h cutoff timer.", font_size=13)
    add_bullet_point(tf, "In-App Mandate Chat", "Contextual discussion with explicit non-consent separation.", font_size=13)
    add_bullet_point(tf, "Section 63 BSA Dossiers", "Compliance receipts with chained SHA-256 hash ledger.", font_size=13)
    add_bullet_point(tf, "Institutional Security", "Multi-tenant isolation, RBAC, TOTP staff MFA, and rate limiting.", font_size=13)
    add_bullet_point(tf, "8 Supported Languages", "Complete UI localization with English ASCII financial numerals.", font_size=13)

    # Right Card: Documented Scope & Roadmap
    add_card(s29, Inches(6.833), Inches(1.95), card_w, Inches(4.8), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s29.shapes.add_textbox(Inches(7.083), Inches(2.15), card_w - Inches(0.5), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Documented Scope & Future Roadmap (Next)"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)

    add_bullet_point(tf, "TRAI DLT SMS Gateway", "Delivers OTP via email/in-app (SMS disabled by policy); commercial SMS requires onboarding a TRAI DLT-registered aggregator.", font_size=13)
    add_bullet_point(tf, "WhatsApp Channel Delivery", "Secure email magic links active; WhatsApp Business API delivery on product roadmap.", font_size=13)
    add_bullet_point(tf, "CloudHSM Key Management", "Server Master Key isolated in env config; AWS CloudHSM/KMS recommended for banking tiers.", font_size=13)
    add_bullet_point(tf, "Direct Broker Execution", "FinConsent halts at locked consent; API execution via brokers on future roadmap.", font_size=13)

    add_footer(s29, 29)
    set_speaker_notes(s29, "Appendix D provides transparency on implemented features versus roadmap enhancements like WhatsApp delivery and direct broker execution.")

    print(f"[30/{TOTAL_SLIDES}] Generating Slide 30: Pilot Proposal, Pricing & Next Steps...")
    # =========================================================================
    # SLIDE 30: Pilot Proposal (Visual 4-Step Timeline + Prominent Pricing Card)
    # =========================================================================
    s30 = add_blank_slide()
    add_header(s30, "Pilot Proposal & Next Steps",
               "Institutional Pilot Proposal & Implementation Roadmap",
               "Structured 4-week pilot deployment for fee-only advisory practices with verified commercial terms.")

    card_w = Inches(5.7)
    # Left Card: Visual 4-Step Timeline Card
    add_card(s30, Inches(0.8), Inches(1.95), card_w, Inches(4.8), COLOR_CARD_BG, COLOR_CARD_BORDER)
    tb = s30.shapes.add_textbox(Inches(1.05), Inches(2.1), card_w - Inches(0.5), Inches(0.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "4-Week Phased Implementation Roadmap"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_NAVY

    weeks = [
        ("WEEK 1", "Governance & Setup", "Configure SEBI INA (INA000088921), compliance contacts & TOTP MFA.", COLOR_INDIGO),
        ("WEEK 2", "Client Ingestion", "Import client profiles with masked PAN (XXXXX1234F), DOB & templates.", COLOR_INDIGO),
        ("WEEK 3", "Controlled Pilot Run", "Execute live mandates with 10–25 families; validate tax & mobile OTP.", COLOR_AMBER),
        ("WEEK 4", "Compliance Audit & Scale", "Audit Section 63 BSA receipts with Compliance Officer; practice rollout.", COLOR_EMERALD)
    ]
    w_top_start = Inches(2.55)
    w_step_h = Inches(0.88)
    for w_i, (w_num, w_title, w_desc, w_col) in enumerate(weeks):
        wy = w_top_start + Inches(w_i * 1.0)
        # Week badge shape
        w_badge = s30.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), wy, Inches(1.3), w_step_h)
        w_badge.fill.solid(); w_badge.fill.fore_color.rgb = w_col
        w_badge.line.fill.background()
        tf_wb = w_badge.text_frame; tf_wb.word_wrap = True
        p = tf_wb.paragraphs[0]; p.text = w_num; p.font.bold = True; p.font.size = Pt(12); p.font.color.rgb = COLOR_WHITE; p.alignment = PP_ALIGN.CENTER
        
        # Detail box
        w_box = s30.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.45), wy, card_w - Inches(1.7), w_step_h)
        w_box.fill.solid(); w_box.fill.fore_color.rgb = COLOR_WHITE
        w_box.line.color.rgb = COLOR_CARD_BORDER; w_box.line.width = Pt(1)
        tf_wx = w_box.text_frame; tf_wx.word_wrap = True
        p = tf_wx.paragraphs[0]; p.text = w_title; p.font.bold = True; p.font.size = Pt(11); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(2)
        p = tf_wx.add_paragraph(); p.text = w_desc; p.font.size = Pt(9.5); p.font.color.rgb = COLOR_SLATE

    # Right Card: Verified Pricing & Official CTA Card
    add_card(s30, Inches(6.833), Inches(1.95), card_w, Inches(4.8), COLOR_CARD_BG, COLOR_INDIGO)
    tb = s30.shapes.add_textbox(Inches(7.083), Inches(2.15), card_w - Inches(0.5), Inches(4.4))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "Verified Commercial Terms & Inquiries"; p.font.bold = True; p.font.size = Pt(16); p.font.color.rgb = COLOR_INDIGO; p.space_after = Pt(8)

    p = tf.add_paragraph()
    p.text = "₹2,499 / Month  (+ 18% GST)"
    p.font.bold = True; p.font.size = Pt(24); p.font.color.rgb = COLOR_NAVY; p.space_after = Pt(6)

    add_bullet_point(tf, "Pro Practice Plan", "Includes up to 100 active mandates/month, unlimited clients, complete tax engine, and 5-year audit ledger retention.", font_size=13)
    add_bullet_point(tf, "Zero AUM Surcharges", "FinConsent charges zero basis points (bps) or AUM percentages. Pure software utility model.", font_size=13)
    add_bullet_point(tf, "Demonstration Data", "Prudent Wealth Advisory (SEBI Reg: INA000088921) with synthetic demonstration data.", font_size=13)
    add_bullet_point(tf, "Official Inquiries", "compliance@finconsent.in", font_size=13)

    add_footer(s30, 30)
    set_speaker_notes(s30, "To begin, we propose a 4-week pilot starting with 10-25 families. The Pro Practice plan is ₹2,499/month with zero AUM surcharges. Inquiries: compliance@finconsent.in.")

    # Save to both docs and root
    prs.save(OUTPUT_PPTX)
    try:
        prs.save(OUTPUT_PPTX_ROOT)
    except PermissionError:
        print(f"  [NOTE] {OUTPUT_PPTX_ROOT} is currently open in PowerPoint; updated {OUTPUT_PPTX} successfully.")
    print(f"\n[SUCCESS] PowerPoint deck generated successfully: {len(prs.slides)} slides saved to:")
    print(f"  - {OUTPUT_PPTX}")

if __name__ == "__main__":
    create_presentation()

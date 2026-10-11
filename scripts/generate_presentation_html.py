#!/usr/bin/env python3
"""
Generates an interactive, standalone HTML presentation viewer (docs/FinConsent-Client-Presentation.html
and FinConsent-Client-Presentation.html) mirroring the 30-slide PowerPoint deck with:
  - 16:9 widescreen layout with auto-scaling to fit any display
  - Large titles (32px / 2rem), body text (14-15px), uppercase kickers
  - Compact content-sized cards (~8px rounded corners, subtle 1px border, no top/side stripes)
  - Color system: Indigo (#4F46E5 FinConsent), Emerald (#059669 Outcomes), Amber (#D97706 Tax), Red (#E11D48 Risk)
  - Clean device frames: genuine ~390px mobile phone frame and desktop browser frames with callout badges
  - Directly inlined sharp SVG vector diagrams from docs/diagrams/
  - Native interactive elements: tax calculation table, 8 language chips, 48-60pt stat cards, comparison matrix, RBAC table
  - Toggleable speaker notes drawer ('N' key or button) for every slide
  - Full keyboard navigation (Left/Right, Space, 'F' for fullscreen, 'N' for notes) and jump dropdown
"""

import os
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
DIAGRAMS_DIR = os.path.join(DOCS_DIR, "diagrams")
OUTPUT_HTML = os.path.join(DOCS_DIR, "FinConsent-Client-Presentation.html")
OUTPUT_HTML_ROOT = os.path.join(BASE_DIR, "FinConsent-Client-Presentation.html")

def get_svg_content(filename):
    svg_path = os.path.join(DIAGRAMS_DIR, filename)
    if not os.path.exists(svg_path):
        return f'<div class="svg-missing">Missing diagram: {filename}</div>'
    with open(svg_path, "r", encoding="utf-8") as f:
        content = f.read()
    # Find start of <svg
    idx = content.find("<svg")
    if idx != -1:
        svg_str = content[idx:]
        # Remove hardcoded pt width/height from the outer tag so CSS controls sizing via viewBox
        # Replace width="...pt" and height="...pt" with responsive inline style
        svg_str = re.sub(r'width="\d+(\.\d+)?pt"', 'width="100%"', svg_str, count=1)
        svg_str = re.sub(r'height="\d+(\.\d+)?pt"', 'height="auto"', svg_str, count=1)
        return svg_str
    return ""

def build_presentation():
    # Pre-load SVGs
    svg_hub = get_svg_content("four-pillar-hub.svg")
    svg_lanes = get_svg_content("actor-lanes.svg")
    svg_main_flow = get_svg_content("main-journey-flow.svg")
    svg_exc_flow = get_svg_content("exception-flows.svg")
    svg_unlock = get_svg_content("unlock-sequence.svg")
    svg_tenant = get_svg_content("tenant-isolation.svg")
    svg_envelope = get_svg_content("envelope-encryption.svg")
    svg_otp = get_svg_content("otp-attempts.svg")
    svg_hash = get_svg_content("hash-chain.svg")
    svg_process = get_svg_content("process-flow.svg")
    svg_chat = get_svg_content("chat-vs-consent.svg")
    svg_adv_tax = get_svg_content("advance-tax-timeline.svg")
    svg_threat = get_svg_content("threat-defence-mapping.svg")
    svg_deploy = get_svg_content("deployment-topology.svg")
    svg_before_after = get_svg_content("before-after-flow.svg")
    svg_evidence = get_svg_content("evidence-pack-composition.svg")
    svg_pilot = get_svg_content("pilot-timeline.svg")
    svg_cause = get_svg_content("cause-effect-map.svg")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinConsent — Statutory Trade Authorization & Tax Infrastructure (Executive Deck)</title>
  <style>
    :root {{
      --bg: #FFFFFF;
      --card-bg: #F8FAFC;
      --card-border: #E2E8F0;
      --navy: #0A192F;
      --slate: #475569;
      --dark-slate: #1E293B;
      --muted: #94A3B8;
      --indigo: #4F46E5;
      --indigo-light: #EEF2FF;
      --emerald: #059669;
      --emerald-light: #ECFDF5;
      --amber: #D97706;
      --amber-light: #FEF3C7;
      --rose: #E11D48;
      --rose-light: #FEE2E2;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0F172A;
      color: var(--navy);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow-x: hidden;
      padding: 16px;
    }}
    #presentation-wrapper {{
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 1320px;
    }}
    #slide-viewport {{
      width: 1280px;
      height: 720px;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }}
    .slide {{
      display: none;
      width: 100%;
      height: 100%;
      padding: 32px 48px 44px 48px;
      flex-direction: column;
      background: #FFFFFF;
      position: absolute;
      top: 0;
      left: 0;
      overflow-y: auto;
    }}
    .slide.active {{
      display: flex;
    }}
    .slide.dark-theme {{
      background: var(--navy);
      color: #FFFFFF;
    }}
    .kicker {{
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--indigo);
      text-transform: uppercase;
      margin-bottom: 4px;
    }}
    .dark-theme .kicker {{
      color: #A5B4FC;
    }}
    .slide-title {{
      font-size: 30px;
      font-weight: 800;
      color: var(--navy);
      line-height: 1.25;
      margin-bottom: 4px;
    }}
    .dark-theme .slide-title {{
      color: #FFFFFF;
    }}
    .slide-subtitle {{
      font-size: 14.5px;
      color: var(--slate);
      margin-bottom: 18px;
      line-height: 1.45;
    }}
    .dark-theme .slide-subtitle {{
      color: #CBD5E1;
    }}
    .content-area {{
      flex: 1;
      display: flex;
      gap: 20px;
      overflow: hidden;
    }}
    .col-half {{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }}
    .card h3 {{
      font-size: 15.5px;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 8px;
    }}
    .card p, .card li {{
      font-size: 14px;
      color: var(--slate);
      line-height: 1.55;
    }}
    .card ul {{
      padding-left: 20px;
    }}
    .card li {{
      margin-bottom: 6px;
    }}
    .footer-bar {{
      position: absolute;
      bottom: 12px;
      left: 48px;
      right: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--muted);
      border-top: 1px solid #F1F5F9;
      padding-top: 6px;
    }}
    .dark-theme .footer-bar {{
      border-top-color: #1E293B;
      color: #64748B;
    }}
    /* Device & Browser Frames */
    .phone-frame {{
      width: 260px;
      height: 480px;
      background: #0A192F;
      border-radius: 36px;
      padding: 10px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      border: 3px solid #334155;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      margin: 0 auto;
    }}
    .phone-notch {{
      width: 88px;
      height: 16px;
      background: #0A192F;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      position: absolute;
      top: 10px;
      z-index: 10;
    }}
    .phone-screen {{
      width: 100%;
      height: 100%;
      border-radius: 26px;
      overflow: hidden;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .phone-screen img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }}
    .browser-frame {{
      width: 100%;
      border-radius: 8px;
      border: 1px solid var(--card-border);
      background: #F1F5F9;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06);
    }}
    .browser-header {{
      height: 26px;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
      border-bottom: 1px solid #CBD5E1;
    }}
    .browser-dot {{
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }}
    .dot-red {{ background: #EF4444; }}
    .dot-yellow {{ background: #F59E0B; }}
    .dot-green {{ background: #10B981; }}
    .browser-content {{
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      max-height: 420px;
      overflow: hidden;
    }}
    .browser-content img {{
      max-width: 100%;
      max-height: 420px;
      object-fit: contain;
    }}
    .caption {{
      font-size: 11.5px;
      color: var(--slate);
      margin-top: 6px;
      text-align: center;
      line-height: 1.35;
    }}
    /* Callout Badges */
    .badge {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--indigo);
      color: #FFFFFF;
      font-weight: 700;
      font-size: 11.5px;
      margin-right: 6px;
      flex-shrink: 0;
    }}
    /* Tables */
    .table-container {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }}
    .table-container th {{
      background: var(--navy);
      color: #FFFFFF;
      padding: 10px 12px;
      text-align: left;
      font-weight: 700;
      border: 1px solid #1E293B;
    }}
    .table-container td {{
      border: 1px solid var(--card-border);
      padding: 10px 12px;
      color: var(--slate);
      vertical-align: top;
      line-height: 1.5;
    }}
    .highlight-cell {{
      background: var(--indigo-light) !important;
      color: var(--indigo) !important;
      font-weight: 600;
    }}
    /* Status chips */
    .chip {{
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }}
    .chip-allowed {{ background: var(--emerald-light); color: var(--emerald); }}
    .chip-forbidden {{ background: var(--rose-light); color: var(--rose); }}
    /* SVG Container */
    .svg-wrapper {{
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }}
    .svg-wrapper svg {{
      max-width: 100%;
      max-height: 440px;
      height: auto;
    }}
    /* Controls Bar */
    .controls {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 1280px;
      margin-top: 14px;
      color: #94A3B8;
      font-size: 13px;
    }}
    .control-group {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .btn {{
      background: #1E293B;
      color: #F8FAFC;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }}
    .btn:hover {{
      background: var(--indigo);
      border-color: var(--indigo);
    }}
    .btn-notes {{
      background: #334155;
    }}
    .select-dropdown {{
      background: #1E293B;
      color: #F8FAFC;
      border: 1px solid #334155;
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      max-width: 440px;
    }}
    /* Speaker Notes Drawer */
    #notes-drawer {{
      width: 1280px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 8px;
      margin-top: 12px;
      padding: 16px 20px;
      color: #E2E8F0;
      display: none;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
    }}
    #notes-drawer.open {{
      display: block;
    }}
    #notes-drawer h4 {{
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #38BDF8;
      margin-bottom: 6px;
    }}
    #notes-drawer p {{
      font-size: 14px;
      line-height: 1.5;
      color: #CBD5E1;
    }}
    .key-badge {{
      display: inline-block;
      padding: 2px 6px;
      background: #0F172A;
      border: 1px solid #475569;
      border-radius: 4px;
      font-size: 11px;
      font-family: monospace;
      color: #F8FAFC;
      margin: 0 2px;
    }}
  </style>
</head>
<body>

  <div id="presentation-wrapper">
    <div id="slide-viewport">

      <!-- SLIDE 1: Cover -->
      <div class="slide dark-theme active" data-notes="Welcome. FinConsent is purpose-built statutory software for Registered Investment Advisers managing non-discretionary portfolios in India. It bridges investment formulation and client authorization.">
        <div style="flex: 1; display: flex; align-items: center; gap: 40px;">
          <div style="flex: 1.4;">
            <div class="kicker">STATUTORY WEALTHTECH INFRASTRUCTURE</div>
            <h1 style="font-size: 46px; font-weight: 900; letter-spacing: -0.02em; margin-bottom: 8px; color: #FFFFFF;">FINCONSENT</h1>
            <h2 style="font-size: 22px; font-weight: 700; color: #A5B4FC; margin-bottom: 18px; line-height: 1.35;">Enterprise Statutory Trade Authorization &amp; Tax Infrastructure for Indian RIAs</h2>
            <p style="font-size: 15px; color: #E2E8F0; line-height: 1.6; margin-bottom: 28px;">
              Engineered specifically to operationalize SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, eliminate pre-trade capital gains tax surprises under Finance Act 2024, and establish immutable Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA) electronic evidence.
            </p>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
              <span class="chip" style="background: rgba(79,70,229,0.25); color: #C7D2FE; font-size: 12px; padding: 6px 12px;">• SEBI Regulation 19 Compliant</span>
              <span class="chip" style="background: rgba(217,119,6,0.25); color: #FDE68A; font-size: 12px; padding: 6px 12px;">• Finance Act 2024 Tax Engine</span>
              <span class="chip" style="background: rgba(5,150,105,0.25); color: #A7F3D0; font-size: 12px; padding: 6px 12px;">• BSA §63 Cryptographic Receipts</span>
            </div>
          </div>
          <div style="flex: 0.8; display: flex; flex-direction: column; align-items: center;">
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img data-src="visual-audit/mandate-security/07_mobile_unlock_screen.png" alt="Mobile Unlock Screen">
              </div>
            </div>
            <div class="caption" style="color: #94A3B8;">Rohan Mehta's Mobile Verification Screen</div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 1 of 30</span>
        </div>
      </div>

      <!-- SLIDE 2: Agenda -->
      <div class="slide" data-notes="Today, SEBI registered advisers manage crores under non-discretionary agreements, yet 80% still collect approvals over WhatsApp or email. This slide highlights the three systemic failure modes.">
        <div class="kicker">Executive Agenda &amp; Industry Context</div>
        <div class="slide-title">The Operational Crisis Facing Indian Investment Advisers</div>
        <div class="slide-subtitle">Why legacy approval methods fail both regulatory audits and investor trust.</div>
        <div class="content-area" style="flex-direction: column; gap: 14px; justify-content: center;">
          <div class="card" style="background: var(--card-bg); border: 1px solid var(--card-border); display: flex; flex-direction: row; align-items: flex-start; gap: 14px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--rose-light); color: var(--rose); font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">1</div>
            <div>
              <h3 style="color: var(--rose); margin-bottom: 4px;">Informal WhatsApp &amp; Email Approvals (Regulatory Rejection)</h3>
              <p>Advisers routinely gather approvals over text messages or calls. SEBI inspection teams reject informal communications under Regulation 19 record-keeping rules, leaving RIAs vulnerable to claims of unauthorized trading. Such communications fail Section 63 BSA electronic admissibility standards.</p>
            </div>
          </div>
          <div class="card" style="background: var(--card-bg); border: 1px solid var(--card-border); display: flex; flex-direction: row; align-items: flex-start; gap: 14px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--amber-light); color: var(--amber); font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">2</div>
            <div>
              <h3 style="color: var(--amber); margin-bottom: 4px;">Post-Trade Capital Gains Tax Shocks (Investor Friction)</h3>
              <p>Finance Act 2024 increased STCG to 20% and LTCG to 12.5% (+ 4% cess). When rebalancing occurs without pre-trade tax visibility, investors are blindsided by unexpected tax liabilities and penalty interest under Section 208 and 234C where liability reaches ₹10,000.</p>
            </div>
          </div>
          <div class="card" style="background: var(--card-bg); border: 1px solid var(--card-border); display: flex; flex-direction: row; align-items: flex-start; gap: 14px;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--indigo-light); color: var(--navy); font-weight: 800; font-size: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">3</div>
            <div>
              <h3 style="color: var(--navy); margin-bottom: 4px;">Fragmented Audit Trails (Inadmissible in Disputes)</h3>
              <p>Advice, rationale, client responses, and execution logs live in disconnected silos. Compiling annual compliance records takes weeks. Raw screenshots lack cryptographic hash continuity and device provenance, rendering them contestable before regulatory authorities.</p>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 2 of 30</span>
        </div>
      </div>

      <!-- SLIDE 3: Personas -->
      <div class="slide" data-notes="Meet our two personas: Suresh, the compliant adviser managing family wealth, and Rohan, the busy client who requires crisp mobile transparency.">
        <div class="kicker">User Personas &amp; Operational Context</div>
        <div class="slide-title">Grounding Compliance in Human Realities: Suresh &amp; Rohan</div>
        <div class="slide-subtitle">A fee-only RIA managing family wealth and an executive demanding frictionless transparency.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="card" style="height: 100%; border-top: 4px solid var(--indigo);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span class="badge" style="background: var(--navy);">SN</span>
                <div>
                  <h3 style="margin-bottom: 2px;">SURESH NARAYANAN</h3>
                  <div style="font-size: 12px; color: var(--indigo); font-weight: 600;">Principal Officer, Prudent Wealth Advisory (SEBI Reg: INA000088921)</div>
                </div>
              </div>
              <div style="background: #EEF2FF; padding: 6px 10px; border-radius: 4px; font-size: 12.5px; font-weight: 700; color: var(--navy); margin-bottom: 12px;">
                Key Metrics: ₹180 Crores AUM | 75 Affluent Families | Fee-Only Model
              </div>
              <ul style="margin-bottom: 14px;">
                <li><strong>Role:</strong> Non-discretionary investment formulation, asset allocation, and rebalancing.</li>
                <li><strong>Pain Point:</strong> Surging equity markets triggered 15%+ allocation drift. Needs immediate consent without administrative phone chasing or legal exposure.</li>
                <li><strong>Statutory Need:</strong> Mandated 5-year audit trail for rationale under SEBI Regulation 19.</li>
              </ul>
              <div style="background: #F1F5F9; border-left: 3px solid var(--indigo); padding: 8px 12px; font-style: italic; font-size: 13px; color: var(--navy); border-radius: 0 4px 4px 0;">
                “I cannot risk my SEBI licence on unrecorded phone calls or casual text messages. When markets drift, I need a verifiable, locked consent record in under an hour.”
              </div>
            </div>
          </div>
          <div class="col-half">
            <div class="card" style="height: 100%; border-top: 4px solid var(--emerald);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                <span class="badge" style="background: var(--emerald);">RM</span>
                <div>
                  <h3 style="margin-bottom: 2px;">ROHAN MEHTA</h3>
                  <div style="font-size: 12px; color: var(--emerald); font-weight: 600;">Managing Director, Auto-Tech Firm, Pune (Masked PAN: XXXXX1234F)</div>
                </div>
              </div>
              <div style="background: #ECFDF5; padding: 6px 10px; border-radius: 4px; font-size: 12.5px; font-weight: 700; color: var(--navy); margin-bottom: 12px;">
                Key Metrics: ₹4.2 Crore Portfolio | 2-Minute Review Limit | Mobile-First
              </div>
              <ul style="margin-bottom: 14px;">
                <li><strong>Role:</strong> Busy corporate executive reviewing financial proposals on smartphone.</li>
                <li><strong>Pain Point:</strong> Refuses to read lengthy PDF attachments or guess year-end capital gains taxes while travelling between meetings.</li>
                <li><strong>Expectation:</strong> 2-minute mobile authorization flow with exact rupee tax impact before agreeing.</li>
              </ul>
              <div style="background: #F1F5F9; border-left: 3px solid var(--emerald); padding: 8px 12px; font-style: italic; font-size: 13px; color: var(--navy); border-radius: 0 4px 4px 0;">
                “Tell me exactly what we are buying and selling, why we are doing it, and what my tax bill is. If it takes more than 2 minutes on my phone, I will postpone it.”
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 3 of 30</span>
        </div>
      </div>

      <!-- SLIDE 4: Risk Breakdown -->
      <div class="slide" data-notes="Notice that each risk maps directly to Indian statutory codes: SEBI Regulation 19, Income Tax Act Section 234C, and BSA Section 63.">
        <div class="kicker">Friction &amp; Risk Analysis</div>
        <div class="slide-title">Four Critical Vulnerabilities of Legacy Approval Channels</div>
        <div class="slide-subtitle">Analyzing the legal, financial, and operational penalties of informal processes.</div>
        <div class="content-area" style="flex-direction: column; gap: 10px; justify-content: center;">
          <div class="card" style="border: 1px solid var(--rose); padding: 12px 18px;">
            <h3 style="color: var(--rose); margin-bottom: 4px;">SEBI Regulation 19 Compliance Exposure</h3>
            <p>Failing to maintain contemporaneous records of investment advice, rationale, and documented client agreement for 5 years leaves advisers vulnerable during mandatory inspections and enforcement actions.</p>
          </div>
          <div class="card" style="border: 1px solid var(--amber); padding: 12px 18px;">
            <h3 style="color: var(--amber); margin-bottom: 4px;">Advance Tax Penal Interest (Sec 208, 234B &amp; 234C)</h3>
            <p>Selling equities without advance tax warnings triggers 1% monthly penal interest if net tax liability reaches ₹10,000; requires planning under Section 234C capital gains installment relief proviso.</p>
          </div>
          <div class="card" style="border: 1px solid var(--indigo); padding: 12px 18px;">
            <h3 style="color: var(--indigo); margin-bottom: 4px;">Electronic Evidence Inadmissibility (BSA Sec 63 / Sec 65B)</h3>
            <p>Under Section 63 of Bharatiya Sakshya Adhiniyam, 2023, raw text screenshots lack server hash continuity and device provenance required for judicial and regulatory admissibility.</p>
          </div>
          <div class="card" style="border: 1px solid var(--navy); padding: 12px 18px;">
            <h3 style="color: var(--navy); margin-bottom: 4px;">Operational Delay &amp; Market Slippage</h3>
            <p>Chasing clients across phone calls and emails causes days of delay, during which market prices drift and optimal rebalancing windows evaporate.</p>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 4 of 30</span>
        </div>
      </div>

      <!-- SLIDE 5: Four Core Pillars -->
      <div class="slide" data-notes="Here are the four foundational pillars: Pre-trade Tax, Dual-envelope Encryption, Mobile Consent Rail, and BSA Section 63 Audit Ledger.">
        <div class="kicker">Platform Architecture</div>
        <div class="slide-title">FinConsent Solution Overview: The Four Core Pillars</div>
        <div class="slide-subtitle">An integrated statutory infrastructure bridging advisory formulation and client mobile consent.</div>
        <div class="content-area" style="flex-direction: column; gap: 14px;">
          <div style="flex: 1; max-height: 220px;" class="svg-wrapper">
            {svg_hub}
          </div>
          <div style="display: flex; gap: 14px; flex: 1;">
            <div class="card" style="flex: 1; border-top: 4px solid var(--amber);">
              <h3 style="color: var(--amber);">1. Pre-Trade Tax</h3>
              <p>Dynamic Finance Act 2024 engine. Real-time STCG (20%) &amp; LTCG (12.5% + 4% cess) computation with quarterly advance tax alerts.</p>
            </div>
            <div class="card" style="flex: 1; border-top: 4px solid var(--indigo);">
              <h3 style="color: var(--indigo);">2. Dual Encryption</h3>
              <p>AES-256-GCM encryption with dual key wrapping. Data remains encrypted until client unlocks via PAN last 4 + DOB.</p>
            </div>
            <div class="card" style="flex: 1; border-top: 4px solid var(--emerald);">
              <h3 style="color: var(--emerald);">3. Mobile Consent</h3>
              <p>Password-protected 256-bit magic links. Responsive smartphone layout, clarification chat, and 6-digit OTP verification.</p>
            </div>
            <div class="card" style="flex: 1; border-top: 4px solid var(--navy);">
              <h3 style="color: var(--navy);">4. BSA §63 Ledger</h3>
              <p>Append-only forward SHA-256 hash chaining. Emits digitally fingerprinted compliance dossiers with IP, User-Agent &amp; IST timestamps.</p>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 5 of 30</span>
        </div>
      </div>

      <!-- SLIDE 6: Actor Lanes Timeline -->
      <div class="slide" data-notes="Notice how the three actor lanes interact: Suresh initiates, FinConsent secures and computes, and Rohan authorizes on his mobile device.">
        <div class="kicker">Narrative Flow</div>
        <div class="slide-title">End-to-End User Journey: Advisor, Platform &amp; Client Lanes</div>
        <div class="slide-subtitle">Chronological sequence mapping advisory formulation to statutory compliance archive.</div>
        <div class="content-area" style="flex-direction: column; gap: 10px;">
          <div style="flex: 1.2; max-height: 260px;" class="svg-wrapper">
            {svg_lanes}
          </div>
          <div style="display: flex; gap: 12px; flex: 0.8;">
            <div class="card" style="flex: 1; background: #F8FAFC;">
              <h3 style="color: var(--navy); font-size: 14px;">Advisor Lane (Suresh)</h3>
              <p style="font-size: 13px;">Detects 15% drift ➜ Drafts baskets with rationale ➜ Dispatches 48h link ➜ Clarifies in chat.</p>
            </div>
            <div class="card" style="flex: 1; background: #EEF2FF;">
              <h3 style="color: var(--indigo); font-size: 14px;">Platform Core (FinConsent)</h3>
              <p style="font-size: 13px;">Computes ₹11,440 tax ➜ Wraps AES keys ➜ Delivers magic link ➜ Issues OTP ➜ Chains hash ledger.</p>
            </div>
            <div class="card" style="flex: 1; background: #ECFDF5;">
              <h3 style="color: var(--emerald); font-size: 14px;">Client Lane (Rohan)</h3>
              <p style="font-size: 13px;">Unlocks via PAN+DOB on phone ➜ Reviews drift/tax ➜ Asks in chat ➜ Enters OTP ➜ Locks evidence.</p>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 6 of 30</span>
        </div>
      </div>

      <!-- SLIDE 7: Main Journey & Exception Flows -->
      <div class="slide" data-notes="State transitions in FinConsent are strictly unidirectional. Once Consented or Expired, a mandate cannot be edited or revived.">
        <div class="kicker">Process Architecture</div>
        <div class="slide-title">Statutory State Progression: Journey &amp; Exception Paths</div>
        <div class="slide-subtitle">Deterministic finite-state machine governing advisory recommendations and legal evidence.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="card" style="height: 100%; border: 1px solid var(--emerald);">
              <h3 style="color: var(--emerald);">Main Statutory Journey (Happy Path)</h3>
              <div style="flex: 1; min-height: 200px;" class="svg-wrapper">
                {svg_main_flow}
              </div>
              <p style="font-size: 13px; margin-top: 8px;"><strong>Progression:</strong> Draft ➜ Sent (48h cutoff) ➜ Viewed (PAN+DOB unlocked) ➜ Consented (OTP verified) ➜ Evidence Locked.</p>
            </div>
          </div>
          <div class="col-half">
            <div class="card" style="height: 100%; border: 1px solid var(--rose);">
              <h3 style="color: var(--rose);">Terminal Exception Boundaries</h3>
              <div style="flex: 1; min-height: 200px;" class="svg-wrapper">
                {svg_exc_flow}
              </div>
              <ul style="font-size: 13px; margin-top: 8px;">
                <li><strong>Expired:</strong> 48h window elapses ➜ HTTP 410 Gone.</li>
                <li><strong>Revoked:</strong> Advisor clicks 'Revoke Link' ➜ Immediate termination.</li>
                <li><strong>Lockout:</strong> 3 failed OTPs ➜ Permanent burn (HTTP 429).</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 7 of 30</span>
        </div>
      </div>

      <!-- SLIDE 8: Advisor RIA Workspace -->
      <div class="slide" data-notes="Figure 8.1 shows the RIA dashboard. Note the 48-hour countdown badges. Advisers retain full control, including instant revocation.">
        <div class="kicker">RIA Workspace</div>
        <div class="slide-title">The Advisor (RIA) Experience: Formulation &amp; Real-Time Control</div>
        <div class="slide-subtitle">Prudent Wealth Advisory center showing active practice mandates and countdown timers.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="browser-frame">
              <div class="browser-header">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
                <span style="font-size: 10px; color: #64748B; margin-left: 6px;">app.finconsent.in/dashboard</span>
              </div>
              <div class="browser-content">
                <img data-src="visual-audit/workflow/01-ria-dashboard-firm-workspace.png" alt="RIA Dashboard">
              </div>
            </div>
            <div class="caption">Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.</div>
          </div>
          <div class="col-half">
            <div class="card" style="height: 100%;">
              <h3>Advisor Capabilities &amp; Controls</h3>
              <ul>
                <li><span class="badge">1</span> <strong>Practice Workspace:</strong> Scoped view displaying active mandates (Draft, Sent, Viewed, Consented, Expired, Revoked) with live 48-hour countdown badges.</li>
                <li><span class="badge">2</span> <strong>Client Registry:</strong> Client management enforcing valid PAN syntax ([A-Z]{{5}}[0-9]{{4}}[A-Z]), masked presentation (XXXXX1234F), and mobile formatting.</li>
                <li><span class="badge">3</span> <strong>Rebalance Formulation:</strong> Simultaneous formulation of current vs target allocations, sell baskets, buy baskets, and investment rationale.</li>
                <li><span class="badge">4</span> <strong>Emergency Revocation:</strong> One-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market conditions shift.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 8 of 30</span>
        </div>
      </div>

      <!-- SLIDE 9: Client Mobile Interface -->
      <div class="slide" data-notes="Here is Rohan's actual smartphone review screen. Note how the allocation drift and pre-computed ₹11,440 tax bill are visible before consent.">
        <div class="kicker">Client Interface</div>
        <div class="slide-title">The Client Experience: Mobile-First Transparency</div>
        <div class="slide-subtitle">Rohan Mehta's smartphone review interface designed for executive clarity on the go.</div>
        <div class="content-area">
          <div style="flex: 0.9; display: flex; flex-direction: column; align-items: center;">
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img data-src="visual-audit/workflow/07-client-review-mobile.png" alt="Client Mobile Review">
              </div>
            </div>
            <div class="caption">Figure 9.1: Rohan Mehta's Mobile Proposal Screen</div>
          </div>
          <div style="flex: 1.1;">
            <div class="card" style="height: 100%;">
              <h3>Key Client-Facing Elements</h3>
              <ul>
                <li><span class="badge">1</span> <strong>Direct Magic Link Convenience:</strong> Clients tap the link received via email without remembering portal passwords or downloading an app.</li>
                <li><span class="badge">2</span> <strong>Allocation Drift Visualization:</strong> High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%).</li>
                <li><span class="badge">3</span> <strong>Transparent Trade Baskets:</strong> Exact share quantities, current market value, ISIN numbers, and rationale displayed clearly (Tata Motors, HDFC Bank -> Bharat Bond, Gold ETF).</li>
                <li><span class="badge">4</span> <strong>Pre-Computed Tax Liability:</strong> Displays estimated rupee liability (₹11,440) so the client understands net financial impact before consenting.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 9 of 30</span>
        </div>
      </div>

      <!-- SLIDE 10: Mandate Password Gate -->
      <div class="slide" data-notes="Figure 10.1 shows our password gate. The magic link alone reveals nothing. The client must enter their PAN last 4 and DOB to derive the key.">
        <div class="kicker">Data Privacy Gate</div>
        <div class="slide-title">Mandate Security: Password-Protected Access Gate</div>
        <div class="slide-subtitle">Zero sensitive financial disclosure prior to client identity verification.</div>
        <div class="content-area">
          <div style="flex: 0.85; display: flex; flex-direction: column; align-items: center;">
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img data-src="visual-audit/mandate-security/07_mobile_unlock_screen.png" alt="Client Password Gate">
              </div>
            </div>
            <div class="caption">Figure 10.1: Client Password Gate on Mobile</div>
          </div>
          <div style="flex: 1.15; display: flex; flex-direction: column; gap: 12px;">
            <div class="card">
              <h3>PAN + DOB Password Mechanism</h3>
              <ul>
                <li><strong>Zero PII Exposure:</strong> Leaked/forwarded links reveal only the advisor firm name; zero holdings or tax figures are emitted.</li>
                <li><strong>Deterministic PIN:</strong> Last 4 PAN + Date of Birth (DDMMYYYY). Example: XXXXX1234F + 14/08/1978 = <code>123414081978</code>.</li>
                <li><strong>PBKDF2 Key Derivation:</strong> Derives 256-bit key via 100,000 SHA-256 iterations to unwrap the DEK.</li>
                <li><strong>Online Defense:</strong> Sliding-window rate limiters (5 failed attempts ➜ 15 min lockout).</li>
              </ul>
            </div>
            <div class="card" style="flex: 1; padding: 10px;">
              <h3 style="font-size: 13px; color: var(--indigo); margin-bottom: 4px;">Cryptographic Unlock Sequence</h3>
              <div style="max-height: 120px;" class="svg-wrapper">
                {svg_unlock}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 10 of 30</span>
        </div>
      </div>

      <!-- SLIDE 11: Multi-Tenancy & Real 403 -->
      <div class="slide" data-notes="Figure 11.1 demonstrates our tenant isolation test. When an advisor from Firm A attempts to access Firm B's mandate, the API rejects with 403.">
        <div class="kicker">Multi-Tenancy &amp; RBAC</div>
        <div class="slide-title">Authentication, Authorization &amp; Tenant Isolation</div>
        <div class="slide-subtitle">Architectural barriers guaranteeing strict multi-tenant privacy across advisory practices.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="browser-frame">
              <div class="browser-header">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
                <span style="font-size: 10px; color: #64748B; margin-left: 6px;">api.finconsent.in/api/mandates/foreign-client</span>
              </div>
              <div class="browser-content">
                <img data-src="visual-audit/security/11-cross-ria-denied-foreign-client.png" alt="Cross RIA Denied">
              </div>
            </div>
            <div class="caption">Figure 11.1: Security Evidence — Cross-tenant access rejected with HTTP 403 Forbidden.</div>
          </div>
          <div class="col-half" style="gap: 12px;">
            <div class="card">
              <h3>Tenancy Invariants &amp; Controls</h3>
              <ul>
                <li><strong>Firm Tenancy Scoping:</strong> Every DB query strictly partitioned by authenticated firm ID (<code>req.user.firmName</code>).</li>
                <li><strong>Zero Cross-RIA Leakage:</strong> Querying another firm's client/mandate triggers an immediate HTTP 403 Forbidden.</li>
                <li><strong>Role-Based Access Control:</strong> Strict segregation across <code>sebi-ria</code>, <code>hni-client</code>, and <code>compliance_officer</code>.</li>
                <li><strong>Privilege Escalation Defense:</strong> Client routes blocked from administrative billing and dispatch endpoints.</li>
              </ul>
            </div>
            <div class="card" style="padding: 10px;">
              <h3 style="font-size: 13px; color: var(--navy); margin-bottom: 4px;">Firm Isolation Topology</h3>
              <div style="max-height: 120px;" class="svg-wrapper">
                {svg_tenant}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 11 of 30</span>
        </div>
      </div>

      <!-- SLIDE 12: Dual-Envelope Encryption -->
      <div class="slide" data-notes="Dual-envelope encryption ensures that even if database records are compromised, financial payloads cannot be decrypted without the Server Master Key or client password.">
        <div class="kicker">Cryptographic Core</div>
        <div class="slide-title">Data Security Architecture &amp; Dual-Envelope Encryption</div>
        <div class="slide-subtitle">Institutional cryptographic defense protecting financial mandates at rest and in transit.</div>
        <div class="content-area" style="flex-direction: column; gap: 14px;">
          <div style="flex: 1.1; max-height: 220px;" class="svg-wrapper">
            {svg_envelope}
          </div>
          <div style="display: flex; gap: 14px; flex: 0.9;">
            <div class="card" style="flex: 1;">
              <h3 style="color: var(--navy);">Payload Encryption</h3>
              <ul style="font-size: 13.5px;">
                <li><strong>Cipher:</strong> AES-256-GCM.</li>
                <li><strong>Key:</strong> Random 256-bit DEK per mandate.</li>
                <li><strong>IV &amp; Tag:</strong> 12-byte IV + 16-byte GCM authentication tag for tamper resistance.</li>
              </ul>
            </div>
            <div class="card" style="flex: 1; border: 1px solid var(--indigo);">
              <h3 style="color: var(--indigo);">Dual Key Wrapping</h3>
              <ul style="font-size: 13.5px;">
                <li><strong>Server Key:</strong> DEK wrapped with isolated SERVER_MASTER_KEY for RIA portal.</li>
                <li><strong>Client Key:</strong> DEK wrapped with PBKDF2(PAN+DOB, 100k rounds).</li>
                <li><strong>Zero Plaintext:</strong> DEK never stored unencrypted.</li>
              </ul>
            </div>
            <div class="card" style="flex: 1;">
              <h3 style="color: var(--emerald);">Transit &amp; Storage</h3>
              <ul style="font-size: 13.5px;">
                <li><strong>Token Hashing:</strong> 256-bit tokens hashed via SHA-256 before DB insertion.</li>
                <li><strong>TLS 1.3:</strong> Enforced HTTPS with 1-year HSTS header.</li>
                <li><strong>Zero Secret Logs:</strong> All credentials scrubbed.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 12 of 30</span>
        </div>
      </div>

      <!-- SLIDE 13: OTP Integrity -->
      <div class="slide" data-notes="Figure 13.1 displays the client OTP modal. Notice the 3 statutory checkboxes that must be acknowledged before the 6-digit OTP can be verified.">
        <div class="kicker">Consent Verification</div>
        <div class="slide-title">OTP &amp; Consent Integrity: Anti-Tamper Authorization</div>
        <div class="slide-subtitle">Statutory verification guaranteeing explicit non-discretionary client approval.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="browser-frame">
              <div class="browser-header">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
                <span style="font-size: 10px; color: #64748B; margin-left: 6px;">Client OTP Verification Modal</span>
              </div>
              <div class="browser-content">
                <img data-src="visual-audit/security/06-client-otp-modal.png" alt="Client OTP Modal">
              </div>
            </div>
            <div class="caption">Figure 13.1: 6-Digit Mobile OTP Modal with 5-minute statutory timer.</div>
          </div>
          <div class="col-half" style="gap: 12px;">
            <div class="card">
              <h3>Statutory Authorization Safeguards</h3>
              <ul>
                <li><strong>Mandatory Declarations:</strong> 3 statutory checkboxes (Regulation 19 Informed Consent, Capital Gains Acceptance, Section 63 BSA Evidence).</li>
                <li><strong>Dynamic 6-Digit OTP:</strong> CSPRNG generated with 5-minute TTL; email/in-app delivery (SMS disabled by policy).</li>
                <li><strong>3-Attempt Lockout:</strong> 3rd failed attempt immediately burns token &amp; locks verification (HTTP 429).</li>
                <li><strong>Single-Use Atomic Revocation:</strong> Instant token burning upon consent (subsequent visits return HTTP 410).</li>
              </ul>
            </div>
            <div class="card" style="padding: 10px;">
              <h3 style="font-size: 13px; color: var(--rose); margin-bottom: 4px;">OTP Failure &amp; Lockout Finite State</h3>
              <div style="max-height: 100px;" class="svg-wrapper">
                {svg_otp}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 13 of 30</span>
        </div>
      </div>

      <!-- SLIDE 14: Audit Trail & BSA 63 -->
      <div class="slide" data-notes="Figure 14.1 shows the Section 63 BSA compliance receipt generated at the exact millisecond consent is locked.">
        <div class="kicker">Audit Infrastructure</div>
        <div class="slide-title">Audit Trail &amp; Compliance Evidence: Cryptographic Proof</div>
        <div class="slide-subtitle">Chained SHA-256 audit ledger meeting Section 63 BSA and SEBI Regulation 19 standards.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="browser-frame">
              <div class="browser-header">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
                <span style="font-size: 10px; color: #64748B; margin-left: 6px;">Compliance Receipt Certificate</span>
              </div>
              <div class="browser-content">
                <img data-src="visual-audit/mandate-security/06_consent_locked_evidence.png" alt="Compliance Receipt">
              </div>
            </div>
            <div class="caption">Figure 14.1: Section 63 BSA / Section 65B Compliance Receipt.</div>
          </div>
          <div class="col-half" style="gap: 12px;">
            <div class="card">
              <h3>Legal Admissibility &amp; Hash Chaining</h3>
              <ul>
                <li><strong>Forward Hash Chaining:</strong> <code>payloadHash = SHA256(prevHash + timestamp + event + payload)</code>. Tampering breaks the entire chain.</li>
                <li><strong>Section 63 BSA Certificate:</strong> Captures client device IP (RFC 5737 203.0.113.12), User-Agent, IST timestamp, and masked PAN (XXXXX1234F).</li>
                <li><strong>5-Year Retention:</strong> Fully complies with SEBI Regulation 19 mandatory record-keeping.</li>
                <li><strong>Disaster Recovery:</strong> Synthetic drill restored 1,460 audit logs with zero broken cryptographic links.</li>
              </ul>
            </div>
            <div class="card" style="padding: 10px;">
              <h3 style="font-size: 13px; color: var(--navy); margin-bottom: 4px;">Cryptographic Forward Chaining Flow</h3>
              <div style="max-height: 100px;" class="svg-wrapper">
                {svg_hash}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 14 of 30</span>
        </div>
      </div>

      <!-- SLIDE 15: Mandate Lifecycle -->
      <div class="slide" data-notes="This diagram represents the immutable lifecycle state machine. State transitions can only occur through server-validated cryptographic events.">
        <div class="kicker">State Machine</div>
        <div class="slide-title">Mandate Lifecycle &amp; State Model: Server-Enforced Transitions</div>
        <div class="slide-subtitle">Finite-state machine guaranteeing deterministic transitions with zero client-side bypass.</div>
        <div class="content-area" style="flex-direction: column; align-items: center; justify-content: center;">
          <div style="width: 100%; height: 100%;" class="svg-wrapper">
            {svg_process}
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 15 of 30</span>
        </div>
      </div>

      <!-- SLIDE 16: Chat Rail vs Consent -->
      <div class="slide" data-notes="In Figure 16.1, Rohan asks: 'Why sell Tata Motors now?'. Suresh clarifies directly inside the secure mandate. Crucially, chat dialogue never substitutes for OTP consent.">
        <div class="kicker">Discussion Rail</div>
        <div class="slide-title">Mandate-Specific Chat: Advisory Clarification vs. Consent</div>
        <div class="slide-subtitle">Why in-app discussion is vital for client trust, but legally distinct from trade consent.</div>
        <div class="content-area">
          <div style="flex: 0.85; display: flex; flex-direction: column; align-items: center;">
            <div class="phone-frame">
              <div class="phone-notch"></div>
              <div class="phone-screen">
                <img data-src="visual-audit/mandate-security/09_mobile_chat_discussion.png" alt="Client Chat Question">
              </div>
            </div>
            <div class="caption">Figure 16.1: Rohan posts an inquiry regarding Tata Motors.</div>
          </div>
          <div style="flex: 1.15; display: flex; flex-direction: column; gap: 12px;">
            <div class="card" style="border-left: 4px solid var(--rose);">
              <h3 style="color: var(--rose);">⚠️ Chat Dialogue Does Not Constitute Consent</h3>
              <p style="margin-bottom: 8px;">Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions. Consent strictly requires formal declaration checkboxes followed by OTP verification.</p>
              <ul>
                <li><strong>Contextual Discussion:</strong> Resolves questions directly within the mandate context, eliminating scattered WhatsApp threads.</li>
                <li><strong>Complete Audit Archiving:</strong> Every message posted is committed to the immutable audit log under <code>CHAT_MESSAGE_SENT</code>.</li>
              </ul>
            </div>
            <div class="card" style="padding: 10px;">
              <h3 style="font-size: 13px; color: var(--navy); margin-bottom: 4px;">Separation of Chat Rail and Consent Rail</h3>
              <div style="max-height: 120px;" class="svg-wrapper">
                {svg_chat}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 16 of 30</span>
        </div>
      </div>

      <!-- SLIDE 17: Tax Engine -->
      <div class="slide" data-notes="This native table shows the verified tax model: ₹11,000 STCG + ₹0 LTCG (exempt under ₹1.25L) + ₹440 cess = ₹11,440. On the right is the advance tax installment calendar.">
        <div class="kicker">Tax Engine</div>
        <div class="slide-title">Tax-Impact Transparency: Finance Act 2024 Engine</div>
        <div class="slide-subtitle">Pre-trade capital gains tax visibility eliminating investor surprise liabilities.</div>
        <div class="content-area">
          <div style="flex: 1.1; display: flex; flex-direction: column; gap: 12px;">
            <table class="table-container">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Statutory Rate</th>
                  <th>Taxable Base</th>
                  <th>Estimated Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>STCG (Tata Motors)</strong></td>
                  <td>20.0% (Sec 111A)</td>
                  <td>₹55,000</td>
                  <td style="font-weight: 700; color: var(--navy);">₹11,000</td>
                </tr>
                <tr>
                  <td><strong>LTCG (HDFC Bank)</strong></td>
                  <td>12.5% (Sec 112A)</td>
                  <td>₹1,25,000 (Exempt)</td>
                  <td style="font-weight: 700; color: var(--emerald);">₹0</td>
                </tr>
                <tr>
                  <td><strong>Health &amp; Educ. Cess</strong></td>
                  <td>4.0% on Base Tax</td>
                  <td>On ₹11,000</td>
                  <td style="font-weight: 700; color: var(--navy);">₹440</td>
                </tr>
                <tr style="background: var(--amber-light);">
                  <td><strong style="color: var(--amber);">Total Estimated Tax</strong></td>
                  <td style="font-weight: 600;">Finance Act 2024</td>
                  <td style="font-weight: 600;">Pre-Trade Calc</td>
                  <td style="font-size: 16px; font-weight: 800; color: var(--amber);">₹11,440</td>
                </tr>
              </tbody>
            </table>
            <div style="font-size: 12px; color: var(--slate); line-height: 1.45; background: #F8FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--card-border);">
              • <strong>Tax Note:</strong> Excludes individual surcharges (up to 15% on equity capital gains) and prior carried-forward losses. Annual aggregate LTCG exemption of ₹1,25,000 applied under Section 112A.
            </div>
          </div>
          <div style="flex: 0.9;">
            <div class="card" style="height: 100%; border: 1px solid var(--amber);">
              <h3 style="color: var(--amber); margin-bottom: 6px;">Quarterly Advance Tax Schedule (Sec 208 &amp; 234C)</h3>
              <div style="max-height: 140px; margin-bottom: 8px;" class="svg-wrapper">
                {svg_adv_tax}
              </div>
              <ul style="font-size: 13px;">
                <li><strong>1st Installment (15%):</strong> On or before 15th June</li>
                <li><strong>2nd Installment (45%):</strong> On or before 15th September</li>
                <li><strong>3rd Installment (75%):</strong> On or before 15th December</li>
                <li><strong>4th Installment (100%):</strong> On or before 15th March</li>
              </ul>
              <div style="margin-top: 8px; font-size: 11.5px; color: var(--slate); font-style: italic;">
                • Proviso to Section 234C: Relieves penal interest for installments prior to the realization date if remaining tax is paid in subsequent installments.
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 17 of 30</span>
        </div>
      </div>

      <!-- SLIDE 18: Multilingual Localization -->
      <div class="slide" data-notes="FinConsent supports 8 languages while strictly enforcing ASCII numerals for all financial figures to avoid dispute ambiguities.">
        <div class="kicker">Accessibility &amp; i18n</div>
        <div class="slide-title">Multilingual Localization Capability: 8 Languages</div>
        <div class="slide-subtitle">Delivering advisory transparency in regional and international languages.</div>
        <div class="content-area" style="flex-direction: column; gap: 16px; justify-content: center;">
          <div class="card">
            <h3 style="margin-bottom: 12px;">8 Fully Supported Languages Across Client &amp; Advisor Portals</h3>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">English (en)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">हिंदी (hi)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">தமிழ் (ta)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">বাংলা (bn)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">ગુજરાતી (gu)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">Deutsch (de)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">日本語 (ja)</span>
              <span class="chip" style="background: #EEF2FF; color: var(--indigo); font-size: 14px; padding: 8px 16px;">한국어 (ko)</span>
            </div>
          </div>
          <div class="card" style="border-left: 5px solid var(--emerald);">
            <h3 style="color: var(--emerald);">Financial Invariant: Standardized ASCII Numerals Across All Locales</h3>
            <ul>
              <li><strong>Western Arabic Digits (0-9):</strong> Under regulatory standards, all rupee amounts (₹), trade quantities, percentages, and ISIN codes remain strictly in ASCII English numerals across all locales, eliminating ambiguity during legal disputes.</li>
              <li><strong>Universal Accessibility:</strong> HNIs review proposals, disclosures, and receipts in their preferred language while financial terms remain standardized.</li>
              <li><strong>Seamless Profile Toggling:</strong> Advisers and clients switch languages seamlessly via navigation bar or profile settings.</li>
            </ul>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 18 of 30</span>
        </div>
      </div>

      <!-- SLIDE 19: Technical Architecture -->
      <div class="slide" data-notes="This architectural topology illustrates the tier separation between frontend, API gateway, core engines, and persistent data tiers in AWS Mumbai.">
        <div class="kicker">System Topology</div>
        <div class="slide-title">Technical Architecture: Security &amp; Service Boundaries</div>
        <div class="slide-subtitle">High-level system topology illustrating frontend, API, security engine, and storage tiers.</div>
        <div class="content-area" style="align-items: center; justify-content: center;">
          <div style="width: 100%; height: 100%; max-height: 440px;" class="svg-wrapper">
            {svg_deploy}
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 19 of 30</span>
        </div>
      </div>

      <!-- SLIDE 20: Real Lockout Screenshot & Threat Modeling -->
      <div class="slide" data-notes="Figure 20.1 shows our automated security test verifying that after 3 failed OTP attempts, verification is permanently locked.">
        <div class="kicker">Threat Modeling</div>
        <div class="slide-title">Security Threat Scenarios &amp; Evidenced Protections</div>
        <div class="slide-subtitle">Proven runtime boundary enforcement against malicious and accidental vectors.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="browser-frame">
              <div class="browser-header">
                <span class="browser-dot dot-red"></span>
                <span class="browser-dot dot-yellow"></span>
                <span class="browser-dot dot-green"></span>
                <span style="font-size: 10px; color: #64748B; margin-left: 6px;">Security Test: OTP Lockout</span>
              </div>
              <div class="browser-content">
                <img data-src="visual-audit/security/17-otp-lockout-after-3-failures.png" alt="OTP Lockout">
              </div>
            </div>
            <div class="caption">Figure 20.1: Security Evidence — OTP lockout engaged after 3 failed verification attempts.</div>
          </div>
          <div class="col-half" style="gap: 12px;">
            <div class="card">
              <h3>Threat Modeling &amp; Architectural Defenses</h3>
              <ul>
                <li><strong>Credential Stuffing &amp; OTP Brute-Force:</strong> Sliding rate limiters block bursts; 3 failed OTPs permanently lock the token (HTTP 429).</li>
                <li><strong>Cross-Tenant IDOR:</strong> Tampering with mandate or client UUIDs across RIA practices rejected with HTTP 403 Forbidden.</li>
                <li><strong>Expired / Replay Attacks:</strong> Links past 48h cutoff or post-consent return HTTP 410 Gone / Revoked.</li>
                <li><strong>Token Sniffing:</strong> Plaintext magic tokens never persisted in DB (strictly SHA-256 hashes).</li>
              </ul>
            </div>
            <div class="card" style="padding: 10px;">
              <h3 style="font-size: 13px; color: var(--rose); margin-bottom: 4px;">Threat to Defense Mapping Flow</h3>
              <div style="max-height: 110px;" class="svg-wrapper">
                {svg_threat}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 20 of 30</span>
        </div>
      </div>

      <!-- SLIDE 21: Operational Validation Stats -->
      <div class="slide" data-notes="All 230 Vitest tests pass with 0 regressions. 81 screenshots verify UI across roles, and 1,460 audit records verified in disaster recovery.">
        <div class="kicker">Evidence Base</div>
        <div class="slide-title">Operational &amp; Testing Validation: Grounded in Real Runs</div>
        <div class="slide-subtitle">Concrete evidence demonstrating zero regressions across automated and browser tests.</div>
        <div class="content-area">
          <div class="card" style="flex: 1; align-items: center; justify-content: center; text-align: center;">
            <div style="font-size: 48px; font-weight: 900; color: var(--emerald); line-height: 1; white-space: nowrap;">230 / 230</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--navy); margin: 8px 0 6px 0;">Automated Tests Passing</div>
            <p style="font-size: 13px;">17 test suites running across tax calculation, security, RBAC, i18n, and API regressions (100% pass rate).</p>
          </div>
          <div class="card" style="flex: 1; align-items: center; justify-content: center; text-align: center;">
            <div style="font-size: 56px; font-weight: 900; color: var(--emerald); line-height: 1;">81</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--navy); margin: 8px 0 6px 0;">Screenshots Captured</div>
            <p style="font-size: 13px;">42 baseline, 25 security, and 14 mandate-security screenshots verifying desktop and mobile viewports.</p>
          </div>
          <div class="card" style="flex: 1; align-items: center; justify-content: center; text-align: center;">
            <div style="font-size: 56px; font-weight: 900; color: var(--emerald); line-height: 1;">1,460</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--navy); margin: 8px 0 6px 0;">Records Disaster Drill</div>
            <p style="font-size: 13px;">Synthetic non-destructive restore drill verified 1,460 audit logs with zero broken cryptographic hash links.</p>
          </div>
          <div class="card" style="flex: 1; align-items: center; justify-content: center; text-align: center;">
            <div style="font-size: 56px; font-weight: 900; color: var(--emerald); line-height: 1;">0</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--navy); margin: 8px 0 6px 0;">Broken Hash Chains</div>
            <p style="font-size: 13px;">Full mathematical continuity verified across all state changes, guaranteeing tamper-evident audit records.</p>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 21 of 30</span>
        </div>
      </div>

      <!-- SLIDE 22: Deployment & Hosting -->
      <div class="slide" data-notes="Data sovereignty is absolute: all data resides in AWS Mumbai (ap-south-1). No data leaves Indian territory.">
        <div class="kicker">Infrastructure</div>
        <div class="slide-title">Deployment Architecture: Indian Data Sovereignty</div>
        <div class="slide-subtitle">Compliance with SEBI Cybersecurity Framework (CSCRF) and DPDP directives.</div>
        <div class="content-area">
          <div style="flex: 1.1; display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div class="card" style="border: 1px solid var(--emerald);">
              <h3 style="color: var(--emerald); font-size: 14.5px;">Territorial Residency</h3>
              <p style="font-size: 13px;">All databases, keys, and ledgers reside exclusively in AWS Mumbai (ap-south-1) under SEBI CSCRF directives.</p>
            </div>
            <div class="card" style="border: 1px solid var(--indigo);">
              <h3 style="color: var(--indigo); font-size: 14.5px;">Multi-Stage Containers</h3>
              <p style="font-size: 13px;">Hardened Docker multi-stage build packaging optimized Vite assets and Express Node.js runtime.</p>
            </div>
            <div class="card" style="border: 1px solid var(--navy);">
              <h3 style="color: var(--navy); font-size: 14.5px;">Health Probes</h3>
              <p style="font-size: 13px;">Container environment with automated /api/health and /api/ready probes monitoring MongoDB and tenancy.</p>
            </div>
            <div class="card" style="border: 1px solid var(--amber);">
              <h3 style="color: var(--amber); font-size: 14.5px;">Key Isolation</h3>
              <p style="font-size: 13px;">Server Master Key isolated from JWT secrets; zero 3rd-party tracking pixels or external analytics beacons.</p>
            </div>
          </div>
          <div style="flex: 0.9;">
            <div class="card" style="height: 100%; padding: 10px;">
              <h3 style="font-size: 13.5px; color: var(--navy); margin-bottom: 4px;">Deployment Topology Diagram</h3>
              <div style="max-height: 400px;" class="svg-wrapper">
                {svg_deploy}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 22 of 30</span>
        </div>
      </div>

      <!-- SLIDE 23: Business Value -->
      <div class="slide" data-notes="The impact is threefold: 100% inspection-ready compliance, zero client tax shocks, and consent turnaround in under two hours.">
        <div class="kicker">Business Impact</div>
        <div class="slide-title">Business Value &amp; Practice Impact for Advisory Firms</div>
        <div class="slide-subtitle">Quantifiable efficiency, compliance security, and investor satisfaction gains.</div>
        <div class="content-area">
          <div class="card" style="flex: 1; border-top: 4px solid var(--emerald); background: var(--emerald-light);">
            <div style="font-size: 32px; font-weight: 800; color: var(--emerald); margin-bottom: 6px;">100%</div>
            <h3 style="color: var(--emerald); margin-bottom: 10px;">Inspection-Ready Compliance</h3>
            <ul style="font-size: 13.5px;">
              <li>Instant Section 63 BSA compliance dossiers provide contemporaneous regulatory evidence.</li>
              <li>Replaces weeks of manual audit trail compilation with instantaneous verification.</li>
              <li>Safeguards RIA practice against claims of unauthorized or discretionary trading.</li>
            </ul>
          </div>
          <div class="card" style="flex: 1; border-top: 4px solid var(--amber); background: var(--amber-light);">
            <div style="font-size: 32px; font-weight: 800; color: var(--amber); margin-bottom: 6px;">0</div>
            <h3 style="color: var(--amber); margin-bottom: 10px;">Surprise Tax Shocks</h3>
            <ul style="font-size: 13.5px;">
              <li>Complete pre-trade capital gains tax visibility eliminates investor surprise liabilities.</li>
              <li>Proactively alerts clients to quarterly advance tax obligations under Section 208 and 234C.</li>
              <li>Elevates advisory relationship from administrative chasing to high-trust wealth planning.</li>
            </ul>
          </div>
          <div class="card" style="flex: 1; border-top: 4px solid var(--indigo); background: var(--indigo-light);">
            <div style="font-size: 32px; font-weight: 800; color: var(--indigo); margin-bottom: 6px;">&lt; 2h</div>
            <h3 style="color: var(--indigo); margin-bottom: 10px;">Mobile Turnaround</h3>
            <ul style="font-size: 13.5px;">
              <li>Accelerates client review and consent turnaround to under 2 hours on mobile.</li>
              <li>Minimizes market slippage during high-volatility rebalancing windows.</li>
              <li>Secure password-protected magic link delivery without requiring app installation.</li>
            </ul>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 23 of 30</span>
        </div>
      </div>

      <!-- SLIDE 24: Comparison Matrix -->
      <div class="slide" data-notes="This comparison highlights the operational leap across authorization, tax visibility, data security, and evidentiary admissibility.">
        <div class="kicker">The Transformation</div>
        <div class="slide-title">The Transformation: What Changes for Advisor and Client</div>
        <div class="slide-subtitle">Comparing legacy advisory friction with FinConsent's institutional digital rail.</div>
        <div class="content-area">
          <table class="table-container">
            <thead>
              <tr>
                <th style="width: 22%;">Advisory Dimension</th>
                <th style="width: 38%;">Legacy Process (Informal / Dispersed)</th>
                <th style="width: 40%; background: var(--indigo);">FinConsent Institutional Rail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Trade Authorization</strong></td>
                <td style="color: var(--rose);">✗ Fragmented WhatsApp texts or email replies; rejected during SEBI inspection.</td>
                <td class="highlight-cell">✓ Explicit statutory declarations + 6-digit OTP verification with 48h market window.</td>
              </tr>
              <tr>
                <td><strong>Capital Gains Tax</strong></td>
                <td style="color: var(--rose);">✗ Post-trade surprise tax bill; penal interest under Sections 208 &amp; 234B/C.</td>
                <td class="highlight-cell">✓ Pre-trade Finance Act 2024 calculation with quarterly advance tax alert.</td>
              </tr>
              <tr>
                <td><strong>Client Security</strong></td>
                <td style="color: var(--rose);">✗ Confidential trade details sent over plain WhatsApp or email attachments.</td>
                <td class="highlight-cell">✓ Dual-envelope AES-256-GCM encryption with PAN+DOB client password gate.</td>
              </tr>
              <tr>
                <td><strong>Audit &amp; Legal Trail</strong></td>
                <td style="color: var(--rose);">✗ Scattered screenshots and PDFs; inadmissible under Section 63 BSA.</td>
                <td class="highlight-cell">✓ Append-only forward SHA-256 ledger emitting certified Section 63 BSA compliance dossier.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 24 of 30</span>
        </div>
      </div>

      <!-- SLIDE 25: Appendix Section Divider -->
      <div class="slide dark-theme" data-notes="This divider introduces the technical appendices, detailing formal cryptographic proofs, RBAC matrices, and legal evidentiary standards.">
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="kicker">TECHNICAL APPENDICES</div>
          <h1 style="font-size: 38px; font-weight: 900; color: #FFFFFF; margin-bottom: 12px;">Regulatory Specifications &amp; Architectural Proofs</h1>
          <p style="font-size: 15px; color: #CBD5E1; max-width: 900px; line-height: 1.6; margin-bottom: 32px;">
            Comprehensive formal specifications, mathematical invariants, access control matrices, and evidentiary frameworks supporting FinConsent's compliance architecture.
          </p>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            <div class="card" style="background: #0F172A; border-color: #334155;">
              <h3 style="color: #A5B4FC; font-size: 14px;">Appendix A: Cryptography</h3>
              <p style="font-size: 12.5px; color: #94A3B8;">AES-256-GCM, 100k-round PBKDF2 &amp; dual-envelope key wrapping specifications.</p>
            </div>
            <div class="card" style="background: #0F172A; border-color: #334155;">
              <h3 style="color: #A5B4FC; font-size: 14px;">Appendix B: Access Matrix</h3>
              <p style="font-size: 12.5px; color: #94A3B8;">Granular API route permissions and firm tenancy scoping invariants across roles.</p>
            </div>
            <div class="card" style="background: #0F172A; border-color: #334155;">
              <h3 style="color: #A5B4FC; font-size: 14px;">Appendix C: BSA §63 Ledger</h3>
              <p style="font-size: 12.5px; color: #94A3B8;">Mandatory electronic evidence attributes, hash chaining schema &amp; court admissibility.</p>
            </div>
            <div class="card" style="background: #0F172A; border-color: #334155;">
              <h3 style="color: #A5B4FC; font-size: 14px;">Appendix D: Operational Scope</h3>
              <p style="font-size: 12.5px; color: #94A3B8;">Strict demarcation of implemented production state vs future product roadmap.</p>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 25 of 30</span>
        </div>
      </div>

      <!-- SLIDE 26: Appendix A -->
      <div class="slide" data-notes="Appendix A outlines the formal cryptographic specifications: AES-256-GCM, 100,000 rounds of PBKDF2, and zero plaintext secret storage.">
        <div class="kicker">Appendix A</div>
        <div class="slide-title">Technical Deep-Dive: Cryptographic Invariants &amp; Key Derivation</div>
        <div class="slide-subtitle">Formal mathematical specifications for envelope encryption and PBKDF2 KDF.</div>
        <div class="content-area" style="flex-direction: column; gap: 14px;">
          <div class="card" style="flex: 1;">
            <h3>Cryptographic Implementation Specifications</h3>
            <ul>
              <li><strong>Symmetric Cipher:</strong> AES-256-GCM (Galois/Counter Mode) with 12-byte random IV and 16-byte authentication tag ensuring anti-tampering.</li>
              <li><strong>Key Derivation Function:</strong> PBKDF2 with SHA-256 digest, 100,000 rounds in production (1,000 in test mode), and 16-byte random salt.</li>
              <li><strong>Key Derivation Input:</strong> Normalized string concatenation of PAN last 4 digits + DOB in DDMMYYYY format (e.g. '123414081978').</li>
              <li><strong>Dual Wrapping Invariant:</strong> Server DEK wrapped with isolated SERVER_MASTER_KEY; Client DEK wrapped with Client Derived Key.</li>
              <li><strong>Zero Secret Storage:</strong> The database never persists client plaintext passwords, unencrypted DEKs, or plaintext magic tokens.</li>
            </ul>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 26 of 30</span>
        </div>
      </div>

      <!-- SLIDE 27: Appendix B -->
      <div class="slide" data-notes="Appendix B provides the role-based access matrix. Every API endpoint enforces strict authorization rules.">
        <div class="kicker">Appendix B</div>
        <div class="slide-title">Role-Based Authorization Matrix (RBAC)</div>
        <div class="slide-subtitle">Detailed API permission matrix with monospaced endpoints and coloured permission chips.</div>
        <div class="content-area">
          <table class="table-container">
            <thead>
              <tr>
                <th>API Route / Resource</th>
                <th>RIA (sebi-ria)</th>
                <th>Client (hni-client)</th>
                <th>Compliance Officer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>/api/mandates (POST / Create)</code></td>
                <td><span class="chip chip-allowed">ALLOWED (Firm Scoped)</span></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (HTTP 403)</span></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (Read-only)</span></td>
              </tr>
              <tr>
                <td><code>/api/mandates/:id/dispatch</code></td>
                <td><span class="chip chip-allowed">ALLOWED (Own Mandates)</span></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (HTTP 403)</span></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (Read-only)</span></td>
              </tr>
              <tr>
                <td><code>/api/public/mandates/:t/unlock</code></td>
                <td><span class="chip" style="background:#E2E8F0; color:#475569;">N/A (Uses Dashboard)</span></td>
                <td><span class="chip chip-allowed">ALLOWED (Valid Password)</span></td>
                <td><span class="chip" style="background:#E2E8F0; color:#475569;">N/A (Compliance Hub)</span></td>
              </tr>
              <tr>
                <td><code>/api/public/mandates/:t/verify-otp</code></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (HTTP 403)</span></td>
                <td><span class="chip chip-allowed">ALLOWED (Valid 6-Digit OTP)</span></td>
                <td><span class="chip chip-forbidden">FORBIDDEN (HTTP 403)</span></td>
              </tr>
              <tr>
                <td><code>/api/requests (Scrutiny Hub)</code></td>
                <td><span class="chip chip-allowed">ALLOWED (Submit Requests)</span></td>
                <td><span class="chip chip-allowed">ALLOWED (View Own Requests)</span></td>
                <td><span class="chip chip-allowed" style="background:#DBEAFE; color:#1D4ED8;">ALLOWED (Full Adjudication)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 27 of 30</span>
        </div>
      </div>

      <!-- SLIDE 28: Appendix C -->
      <div class="slide" data-notes="Appendix C details the exact criteria required under Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for electronic records to be admitted in court.">
        <div class="kicker">Appendix C</div>
        <div class="slide-title">Audit Schema &amp; Section 63 BSA Admissibility</div>
        <div class="slide-subtitle">Evidentiary record structures required by Indian legal standards.</div>
        <div class="content-area">
          <div style="flex: 1.1;">
            <div class="card" style="height: 100%;">
              <h3>Section 63 BSA Mandatory Evidentiary Attributions</h3>
              <ul>
                <li><strong>1. Origin Identification:</strong> Client IP Address (RFC 5737 203.0.113.12) and browser User-Agent recorded at execution time.</li>
                <li><strong>2. Synchronized Timestamp:</strong> Server-side NTP timestamping localized to Indian Standard Time (IST).</li>
                <li><strong>3. Hash Integrity Seal:</strong> SHA-256 payloadHash computed over the immutable consent certificate.</li>
                <li><strong>4. Device Custody Proof:</strong> Evidence that the computer system was operating properly during record generation.</li>
                <li><strong>5. Regulation 19 Admissibility:</strong> Cryptographically chained forward hashes guarantee zero retroactive modifications.</li>
              </ul>
            </div>
          </div>
          <div style="flex: 0.9;">
            <div class="card" style="height: 100%; padding: 10px;">
              <h3 style="font-size: 13.5px; color: var(--navy); margin-bottom: 4px;">Evidence Pack Composition Diagram</h3>
              <div style="max-height: 380px;" class="svg-wrapper">
                {svg_evidence}
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 28 of 30</span>
        </div>
      </div>

      <!-- SLIDE 29: Appendix D -->
      <div class="slide" data-notes="Appendix D provides transparency on implemented features versus roadmap enhancements like WhatsApp delivery and direct broker execution.">
        <div class="kicker">Appendix D</div>
        <div class="slide-title">Operational Considerations: Implemented State vs. Roadmap</div>
        <div class="slide-subtitle">Clear demarcation between current production capabilities and future roadmap milestones.</div>
        <div class="content-area">
          <div class="col-half">
            <div class="card" style="height: 100%; border: 1px solid var(--emerald);">
              <h3 style="color: var(--emerald);">Implemented Capabilities (Now)</h3>
              <ul style="font-size: 13.5px;">
                <li>✓ Full non-discretionary mandate formulation &amp; tax engine</li>
                <li>✓ AES-256-GCM dual-envelope encryption &amp; PBKDF2 password gate</li>
                <li>✓ 256-bit magic links with SHA-256 database hashing &amp; 48h cutoff</li>
                <li>✓ In-app mandate chat with explicit non-consent separation</li>
                <li>✓ Section 63 BSA compliance receipts with SHA-256 hash chaining</li>
                <li>✓ Multi-tenant isolation, RBAC, staff TOTP MFA, and rate limiting</li>
                <li>✓ 8 supported languages with English ASCII numerals.</li>
              </ul>
            </div>
          </div>
          <div class="col-half">
            <div class="card" style="height: 100%; border: 1px solid var(--indigo);">
              <h3 style="color: var(--indigo);">Documented Scope &amp; Future Roadmap (Next)</h3>
              <ul style="font-size: 13.5px;">
                <li>• <strong>TRAI DLT SMS Gateway:</strong> Current setup delivers OTP via email/in-app; commercial SMS requires TRAI DLT aggregator.</li>
                <li>• <strong>WhatsApp Channel Delivery:</strong> Secure email magic links active; WhatsApp Business API delivery on product roadmap.</li>
                <li>• <strong>CloudHSM Key Management:</strong> Server Master Key in env config; AWS CloudHSM/KMS recommended for banking tiers.</li>
                <li>• <strong>Direct Broker Execution:</strong> FinConsent halts at locked consent; API execution via brokers on future roadmap.</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 29 of 30</span>
        </div>
      </div>

      <!-- SLIDE 30: Pilot Proposal -->
      <div class="slide" data-notes="To begin, we propose a 4-week pilot starting with 10-25 families. The Pro Practice plan is ₹2,499/month with zero AUM surcharges. Inquiries: compliance@finconsent.in.">
        <div class="kicker">Pilot Proposal &amp; Next Steps</div>
        <div class="slide-title">Institutional Pilot Proposal &amp; Implementation Roadmap</div>
        <div class="slide-subtitle">Structured 4-week pilot deployment for fee-only advisory practices with verified commercial terms.</div>
        <div class="content-area">
          <div style="flex: 1.1;">
            <div class="card" style="height: 100%;">
              <h3 style="margin-bottom: 8px;">4-Week Phased Implementation Roadmap</h3>
              <div style="max-height: 140px; margin-bottom: 8px;" class="svg-wrapper">
                {svg_pilot}
              </div>
              <ul style="font-size: 13px;">
                <li><strong>Week 1: Governance &amp; Setup:</strong> Configure SEBI INA number, compliance contacts, and TOTP MFA.</li>
                <li><strong>Week 2: Client Roster Ingestion:</strong> Import client profiles with masked PAN and DOB.</li>
                <li><strong>Week 3: Controlled Pilot:</strong> Live mandates with 10–25 families; pre-trade tax and mobile OTP verification.</li>
                <li><strong>Week 4: Review &amp; Scale:</strong> Audit Section 63 BSA receipts with Compliance Officer.</li>
              </ul>
            </div>
          </div>
          <div style="flex: 0.9;">
            <div class="card" style="height: 100%; border: 2px solid var(--indigo); background: #F8FAFC;">
              <h3 style="color: var(--indigo); margin-bottom: 4px;">Verified Commercial Terms</h3>
              <div style="font-size: 26px; font-weight: 900; color: var(--navy); margin-bottom: 6px;">
                ₹2,499 <span style="font-size: 14px; font-weight: 600; color: var(--slate);">/ Month (+ 18% GST)</span>
              </div>
              <ul style="font-size: 13px; margin-bottom: 14px;">
                <li><strong>Pro Practice Plan:</strong> Up to 100 active mandates/month, unlimited clients, complete tax engine &amp; 5-year ledger.</li>
                <li><strong>Zero AUM Surcharges:</strong> Zero bps or percentage fees. Pure software utility model.</li>
                <li><strong>Demonstration Workspace:</strong> Prudent Wealth Advisory (SEBI Reg: INA000088921).</li>
              </ul>
              <div style="background: var(--indigo); color: #FFFFFF; padding: 10px; border-radius: 6px; text-align: center; font-weight: 700; font-size: 13px;">
                Official Inquiries: <a href="mailto:compliance@finconsent.in" style="color: #FFFFFF; text-decoration: underline;">compliance@finconsent.in</a>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <span>FinConsent | Statutory RIA Infrastructure</span>
          <span>Slide 30 of 30</span>
        </div>
      </div>

    </div>

    <!-- Controls Bar -->
    <div class="controls">
      <div class="control-group">
        <button class="btn" id="prev-btn">◀ Prev</button>
        <select class="select-dropdown" id="slide-select"></select>
        <button class="btn" id="next-btn">Next ▶</button>
      </div>
      <div class="control-group">
        <button class="btn btn-notes" id="notes-btn">📝 Speaker Notes (N)</button>
        <button class="btn" id="full-btn">⛶ Fullscreen (F)</button>
      </div>
    </div>

    <!-- Collapsible Speaker Notes Drawer -->
    <div id="notes-drawer">
      <h4>Speaker Notes for Slide <span id="notes-slide-num">1</span></h4>
      <p id="notes-text"></p>
    </div>

  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const select = document.getElementById('slide-select');
    const notesDrawer = document.getElementById('notes-drawer');
    const notesSlideNum = document.getElementById('notes-slide-num');
    const notesText = document.getElementById('notes-text');
    let currentIdx = 0;

    // Fix relative image URLs depending on whether file is loaded from /docs or root
    const inDocs = window.location.pathname.includes('/docs/') || window.location.pathname.endsWith('/docs');
    document.querySelectorAll('img[data-src]').forEach(img => {{
      const src = img.dataset.src;
      img.src = inDocs ? src : ('docs/' + src);
      img.onerror = function() {{
        // Fallback toggle
        if (!this.dataset.retried) {{
          this.dataset.retried = '1';
          this.src = this.src.includes('docs/') ? this.src.replace('docs/', '') : ('docs/' + this.src);
        }}
      }};
    }});

    // Populate dropdown
    slides.forEach((s, i) => {{
      const opt = document.createElement('option');
      opt.value = i;
      const titleEl = s.querySelector('.slide-title') || s.querySelector('h1');
      const titleText = titleEl ? titleEl.textContent : `Slide ${{i + 1}}`;
      opt.textContent = `Slide ${{i + 1}}: ${{titleText.substring(0, 38)}}`;
      select.appendChild(opt);
    }});

    function updateNotes() {{
      const activeSlide = slides[currentIdx];
      const notes = activeSlide.dataset.notes || 'No speaker notes for this slide.';
      notesSlideNum.textContent = currentIdx + 1;
      notesText.textContent = notes;
    }}

    function showSlide(idx) {{
      if (idx < 0 || idx >= slides.length) return;
      slides.forEach((s, i) => {{
        s.classList.toggle('active', i === idx);
      }});
      select.value = idx;
      currentIdx = idx;
      updateNotes();
    }}

    select.addEventListener('change', (e) => {{
      showSlide(parseInt(e.target.value, 10));
    }});

    document.getElementById('prev-btn').addEventListener('click', () => {{
      if (currentIdx > 0) showSlide(currentIdx - 1);
    }});

    document.getElementById('next-btn').addEventListener('click', () => {{
      if (currentIdx < slides.length - 1) showSlide(currentIdx + 1);
    }});

    document.getElementById('notes-btn').addEventListener('click', () => {{
      notesDrawer.classList.toggle('open');
    }});

    document.getElementById('full-btn').addEventListener('click', () => {{
      const el = document.getElementById('slide-viewport');
      if (!document.fullscreenElement) {{
        el.requestFullscreen().catch(err => alert(err.message));
      }} else {{
        document.exitFullscreen();
      }}
    }});

    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ') {{
        if (currentIdx < slides.length - 1) showSlide(currentIdx + 1);
      }} else if (e.key === 'ArrowLeft') {{
        if (currentIdx > 0) showSlide(currentIdx - 1);
      }} else if (e.key.toLowerCase() === 'n') {{
        notesDrawer.classList.toggle('open');
      }} else if (e.key.toLowerCase() === 'f') {{
        const el = document.getElementById('slide-viewport');
        if (!document.fullscreenElement) {{
          el.requestFullscreen().catch(err => alert(err.message));
        }} else {{
          document.exitFullscreen();
        }}
      }}
    }});

    // Initialize notes for first slide
    updateNotes();
  </script>
</body>
</html>
"""

    with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    with open(OUTPUT_HTML_ROOT, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"[SUCCESS] Interactive presentation HTML created with 30 slides & embedded SVG diagrams at:")
    print(f"  - {OUTPUT_HTML}")
    print(f"  - {OUTPUT_HTML_ROOT}")

if __name__ == "__main__":
    build_presentation()

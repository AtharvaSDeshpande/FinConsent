#!/usr/bin/env python3
"""
Generates an interactive, standalone HTML presentation viewer (docs/FinConsent-Client-Presentation.html)
mirroring the 29-slide PowerPoint deck with keyboard controls, fullscreen support, and responsive typography.
"""

import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
OUTPUT_HTML = os.path.join(DOCS_DIR, "FinConsent-Client-Presentation.html")
OUTPUT_HTML_ROOT = os.path.join(BASE_DIR, "FinConsent-Client-Presentation.html")

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FinConsent — Client-Facing Executive Presentation</title>
  <style>
    :root {
      --bg: #FFFFFF;
      --card-bg: #F8FAFC;
      --card-border: #E2E8F0;
      --navy: #0A192F;
      --slate: #475569;
      --muted: #94A3B8;
      --indigo: #4F46E5;
      --emerald: #059669;
      --amber: #D97706;
      --rose: #E11D48;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0F172A;
      color: var(--navy);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow-x: hidden;
    }
    #slide-viewport {
      width: 1200px;
      height: 675px;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .slide {
      display: none;
      width: 100%;
      height: 100%;
      padding: 40px 60px;
      flex-direction: column;
      background: #FFFFFF;
      position: absolute;
      top: 0;
      left: 0;
    }
    .slide.active {
      display: flex;
    }
    .kicker {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--indigo);
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .slide-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--navy);
      margin-bottom: 4px;
    }
    .slide-subtitle {
      font-size: 13px;
      color: var(--slate);
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .content-area {
      flex: 1;
      display: flex;
      gap: 24px;
      overflow: hidden;
    }
    .col-half {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .card h3 {
      font-size: 15px;
      font-weight: 700;
      color: var(--navy);
      margin-bottom: 8px;
    }
    .card p, .card li {
      font-size: 12px;
      color: var(--slate);
      line-height: 1.6;
    }
    .card ul {
      padding-left: 18px;
    }
    .screenshot-img {
      max-width: 100%;
      max-height: 360px;
      object-fit: contain;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .caption {
      font-size: 11px;
      color: var(--slate);
      font-style: italic;
      margin-top: 8px;
    }
    .code-diagram {
      background: #0A192F;
      color: #38BDF8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10px;
      line-height: 1.35;
      padding: 16px;
      border-radius: 8px;
      white-space: pre;
      overflow: auto;
      height: 100%;
    }
    .table-container {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .table-container th {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      padding: 10px;
      text-align: left;
      font-weight: 700;
      color: var(--navy);
    }
    .table-container td {
      border: 1px solid var(--card-border);
      padding: 9px 10px;
      color: var(--slate);
      vertical-align: top;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      color: #94A3B8;
      font-size: 13px;
    }
    .btn {
      background: #1E293B;
      color: #F8FAFC;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn:hover {
      background: var(--indigo);
      border-color: var(--indigo);
    }
  </style>
</head>
<body>

  <div id="slide-viewport">

    <!-- SLIDE 1 -->
    <div class="slide active">
      <div style="margin-top: 40px; margin-bottom: 24px;">
        <div style="width: 48px; height: 4px; background: var(--indigo); margin-bottom: 16px; border-radius: 2px;"></div>
        <h1 style="font-size: 40px; font-weight: 900; color: var(--navy); letter-spacing: -0.02em;">FINCONSENT</h1>
        <h2 style="font-size: 20px; font-weight: 600; color: var(--indigo); margin-top: 6px;">Enterprise Statutory Trade Authorization & Tax-Impact Infrastructure for Indian RIAs</h2>
      </div>
      <p style="font-size: 14px; color: var(--slate); line-height: 1.6; max-width: 800px; margin-bottom: 40px;">
        Purpose-built for SEBI (Investment Advisers) Regulations, 2013 Regulation 19 compliance, pre-trade capital gains tax transparency under Finance Act 2024, and Section 65B tamper-evident electronic evidence.
      </p>
      <div style="display: flex; gap: 20px;">
        <div class="card" style="flex: 1;">
          <h3>SEBI Regulation 19 Compliance</h3>
          <p>Enforces non-discretionary prior informed client consent with a statutory 5-year cryptographic audit trail.</p>
        </div>
        <div class="card" style="flex: 1;">
          <h3>Budget 2024 Tax Engine</h3>
          <p>Automates STCG (20%) & LTCG (12.5%) pre-computations with Section 234B/C quarterly advance tax alerts.</p>
        </div>
        <div class="card" style="flex: 1;">
          <h3>Cryptographic Evidence</h3>
          <p>Dual AES-256-GCM envelope encryption, 6-digit OTP, and Section 65B Indian Evidence Act certificates.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 2 -->
    <div class="slide">
      <div class="kicker">Industry Landscape</div>
      <div class="slide-title">The Problem: High-Stakes Friction in Indian Wealth Advisory</div>
      <div class="slide-subtitle">Why legacy approval methods fail both advisory firms and high-net-worth investors.</div>
      <div class="content-area">
        <div class="card" style="flex: 1;">
          <h3 style="color: var(--rose);">1. Informal WhatsApp Approvals</h3>
          <ul>
            <li>Advisors routinely collect approvals via WhatsApp, emails, or phone notes.</li>
            <li>SEBI inspection teams reject informal text messages as non-compliant with Regulation 19.</li>
            <li>Leaves advisers legally exposed to claims of discretionary or unauthorized trading.</li>
            <li>Zero legal admissibility under Section 65B of the Indian Evidence Act.</li>
          </ul>
        </div>
        <div class="card" style="flex: 1;">
          <h3 style="color: var(--amber);">2. Capital Gains Tax Shocks</h3>
          <ul>
            <li>Union Budget 2024 increased STCG to 20% and LTCG to 12.5%.</li>
            <li>Rebalancing portfolios triggers significant capital gains without prior investor visibility.</li>
            <li>Clients are blindsided by unexpected year-end tax liabilities.</li>
            <li>Advance tax penal interest (Sections 234B & 234C) erodes investor trust and fee satisfaction.</li>
          </ul>
        </div>
        <div class="card" style="flex: 1;">
          <h3 style="color: var(--navy);">3. Fragmented Audit Trails</h3>
          <ul>
            <li>Advisory rationale, client communications, and trade executions live in separate silos.</li>
            <li>Compiling regulatory records for annual SEBI audits takes weeks of administrative overhead.</li>
            <li>Audit logs in spreadsheets can be altered, disputed, or deleted.</li>
            <li>Inability to prove exact IST timestamp, client IP, and portfolio allocation agreed upon.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- SLIDE 3 -->
    <div class="slide">
      <div class="kicker">The Story</div>
      <div class="slide-title">The Human Context: An RIA and HNI Client Journey</div>
      <div class="slide-subtitle">Grounding compliance in real operational realities: Suresh Narayanan and Rohan Mehta.</div>
      <div class="content-area">
        <div class="card" style="flex: 1;">
          <h3>Suresh Narayanan</h3>
          <p style="color: var(--indigo); font-weight: 600; margin-bottom: 8px;">Principal Officer & Founder, Prudent Wealth Advisory (SEBI Reg: INA000018421)</p>
          <ul>
            <li><strong>AUM & Practice:</strong> Manages ₹180 Crores across 75 affluent families under a fee-only, non-discretionary advisory model.</li>
            <li><strong>Challenge:</strong> Equity markets surged post-budget; several client portfolios have drifted 15%+ away from risk mandates.</li>
            <li><strong>Regulatory Obligation:</strong> Must recommend selling equities and buying debt/gold, but cannot execute without prior written consent and full tax disclosure under SEBI Regulation 19.</li>
          </ul>
        </div>
        <div class="card" style="flex: 1;">
          <h3>Rohan Mehta</h3>
          <p style="color: var(--indigo); font-weight: 600; margin-bottom: 8px;">HNI Advisory Client | Managing Director, Auto-Tech Firm, Pune (PAN: ABCDE1234F)</p>
          <ul>
            <li><strong>Portfolio Context:</strong> Holds a ₹4.2 Crore portfolio. Extremely busy executive who reviews financial proposals on his mobile phone between meetings.</li>
            <li><strong>Expectation:</strong> Values Suresh's advice, but refuses to sign complex paper forms or guess tax liabilities.</li>
            <li><strong>Need:</strong> Demands a frictionless 2-minute mobile authorization flow that clearly explains why securities are being sold and the exact rupee tax liability.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- SLIDE 8: RIA Interface -->
    <div class="slide">
      <div class="kicker">RIA Interface</div>
      <div class="slide-title">The Advisor (RIA) Experience: Formulation & Control</div>
      <div class="slide-subtitle">Real screenshots from Prudent Wealth Advisory's institutional advisory center.</div>
      <div class="content-area">
        <div class="col-half">
          <img class="screenshot-img" src="../docs/visual-audit/workflow/01-ria-dashboard-firm-workspace.png" alt="RIA Dashboard">
          <div class="caption">Figure 8.1: Authenticated RIA Dashboard showing portfolio overview and practice mandates.</div>
        </div>
        <div class="col-half">
          <div class="card">
            <h3>Advisor Capabilities & Controls</h3>
            <ul>
              <li><strong>Practice Workspace:</strong> Scoped view displaying active mandate statuses (Draft, Sent, Viewed, Consented, Expired) with real-time 48-hour countdown badges.</li>
              <li><strong>Frictionless Client Registry:</strong> Client management enforcing PAN syntax ([A-Z]{5}[0-9]{4}[A-Z]) and mobile number formatting.</li>
              <li><strong>Integrated Rebalance Wizard:</strong> Simultaneous formulation of current vs. proposed allocations, sell baskets, buy baskets, and advisory rationale.</li>
              <li><strong>Instant Emergency Control:</strong> Single-click 'Revoke Link' feature allows advisers to immediately cancel dispatched proposals if market volatility occurs.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 9: Client Interface -->
    <div class="slide">
      <div class="kicker">Client Interface</div>
      <div class="slide-title">The Client Experience: Mobile-First Transparency</div>
      <div class="slide-subtitle">Rohan Mehta's proposal review interface designed for executive clarity on smartphones.</div>
      <div class="content-area">
        <div class="col-half">
          <img class="screenshot-img" src="../docs/visual-audit/mandate-security/03_client_mandate_unlocked.png" alt="Client Review">
          <div class="caption">Figure 9.1: Rohan Mehta's unlocked proposal review showing trade allocations and pre-computed tax.</div>
        </div>
        <div class="col-half">
          <div class="card">
            <h3>Key Client-Facing Elements</h3>
            <ul>
              <li><strong>Zero-Login Convenience:</strong> Clients tap the link received via WhatsApp/email without remembering passwords or downloading an app.</li>
              <li><strong>Allocation Drift Visualization:</strong> High-contrast visual bars illustrate how portfolio risk is being restored (Equity scaling from 65% down to 50%).</li>
              <li><strong>Transparent Trade Baskets:</strong> Exact share quantities, current market value, ISIN numbers, and transaction rationale displayed clearly.</li>
              <li><strong>Tax Accountability:</strong> Pre-computes exact rupee liability (₹11,440) so the client understands the net financial impact before consenting.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 10: Mandate Password -->
    <div class="slide">
      <div class="kicker">Data Privacy Gate</div>
      <div class="slide-title">Mandate Security: Password-Protected Access Gate</div>
      <div class="slide-subtitle">Zero sensitive financial disclosure prior to client authentication.</div>
      <div class="content-area">
        <div class="col-half">
          <img class="screenshot-img" src="../docs/visual-audit/mandate-security/02_client_password_required.png" alt="Password Gate">
          <div class="caption">Figure 10.1: Client Password Gate on Mobile. Sensitive portfolio holdings remain encrypted until unlocked.</div>
        </div>
        <div class="col-half">
          <div class="card">
            <h3>PAN + DOB Password Mechanism</h3>
            <ul>
              <li><strong>Zero PII Exposure:</strong> If a magic link is forwarded, intercepted, or leaked, the recipient sees only the adviser's firm name. Zero stock holdings or tax figures are emitted.</li>
              <li><strong>Deterministic Derivation:</strong> Password formatted as Last 4 PAN digits + Date of Birth (DDMMYYYY). Example: Rohan's PAN ABCDE1234F + 14/08/1978 = 123414081978.</li>
              <li><strong>PBKDF2 Key Derivation:</strong> The password derives a 256-bit cryptographic key using 100,000 SHA-256 iterations to unwrap the Data Encryption Key (DEK).</li>
              <li><strong>Brute-Force Rate Limiting:</strong> 5 consecutive failed attempts trigger an automatic 15-minute security lockout (HTTP 429).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 14: Audit Trail -->
    <div class="slide">
      <div class="kicker">Audit Infrastructure</div>
      <div class="slide-title">Audit Trail & Compliance Evidence: Cryptographic Proof</div>
      <div class="slide-subtitle">Chained SHA-256 audit ledger meeting Section 65B and Regulation 19 standards.</div>
      <div class="content-area">
        <div class="col-half">
          <img class="screenshot-img" src="../docs/visual-audit/mandate-security/06_consent_locked_evidence.png" alt="Compliance Receipt">
          <div class="caption">Figure 14.1: Section 65B Indian Evidence Act Compliance Receipt issued upon successful consent.</div>
        </div>
        <div class="col-half">
          <div class="card">
            <h3>Legal Admissibility & Hash Chaining</h3>
            <ul>
              <li><strong>Forward Hash Chaining:</strong> Each log entry hashes the previous record: payloadHash = SHA256(prevHash + timestamp + event + payload). Any retroactive tampering breaks the entire chain.</li>
              <li><strong>Section 65B Certificate:</strong> Captures client device IP (49.36.110.12), browser User-Agent, exact IST timestamp, and masked PAN (AB*****4F).</li>
              <li><strong>5-Year Regulatory Preservation:</strong> Designed to satisfy SEBI Regulation 19 mandatory 5-year retention requirements.</li>
              <li><strong>Verified Disaster Recovery:</strong> Non-destructive drill restored 1,460 audit logs with zero broken hash links.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 16: Chat Rail -->
    <div class="slide">
      <div class="kicker">Discussion Rail</div>
      <div class="slide-title">Mandate-Specific Chat: Advisory Clarification vs. Consent</div>
      <div class="slide-subtitle">Why in-app discussion is vital for client trust, but legally distinct from trade consent.</div>
      <div class="content-area">
        <div class="col-half">
          <img class="screenshot-img" src="../docs/visual-audit/mandate-security/04_client_chat_question.png" alt="Mandate Chat">
          <div class="caption">Figure 16.1: Rohan posts an inquiry regarding Tata Motors in the password-protected chat rail.</div>
        </div>
        <div class="col-half">
          <div class="card">
            <h3 style="color: var(--rose);">Statutory Separation of Communication & Consent</h3>
            <ul>
              <li><strong>Real-Time Contextual Discussion:</strong> Allows clients to ask specific allocation or yield questions directly within the mandate context, eliminating scattered WhatsApp threads.</li>
              <li><strong>Complete Audit Archiving:</strong> Every message posted by client or advisor is committed to the immutable audit log under CHAT_MESSAGE_SENT.</li>
              <li><strong>⚠️ CHAT DOES NOT CONSTITUTE CONSENT:</strong> Under SEBI Regulation 19, informal dialogue ('Yes go ahead', 'Proceed') CANNOT authorize transactions.</li>
              <li><strong>Uncompromising Consent Rail:</strong> Trade execution strictly requires formal statutory declaration checkboxes followed by 6-digit Mobile OTP verification.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 24: Transformation Table -->
    <div class="slide">
      <div class="kicker">The Transformation</div>
      <div class="slide-title">The Transformation: What Changes for Advisor and Client</div>
      <div class="slide-subtitle">Comparing legacy advisory friction with FinConsent's institutional digital rail.</div>
      <div class="content-area">
        <table class="table-container">
          <thead>
            <tr>
              <th style="width: 25%;">Advisory Dimension</th>
              <th style="width: 37%;">Legacy Process (Informal / Dispersed)</th>
              <th style="width: 38%;">FinConsent Institutional Digital Rail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Trade Authorization</strong></td>
              <td>Fragmented WhatsApp texts or email replies; rejected during SEBI inspection.</td>
              <td>Explicit statutory declarations + 6-digit OTP verification with 48h market window.</td>
            </tr>
            <tr>
              <td><strong>Capital Gains Tax</strong></td>
              <td>Post-trade surprise tax bill; penal interest under Sections 234B/C.</td>
              <td>Pre-trade Union Budget 2024 calculation with quarterly advance tax alert.</td>
            </tr>
            <tr>
              <td><strong>Client Security</strong></td>
              <td>Confidential trade details sent over plain WhatsApp or email attachments.</td>
              <td>Dual-envelope AES-256-GCM encryption with PAN+DOB client password gate.</td>
            </tr>
            <tr>
              <td><strong>Audit & Legal Trail</strong></td>
              <td>Scattered screenshots and PDFs; inadmissible under Section 65B.</td>
              <td>Append-only forward SHA-256 ledger emitting certified Section 65B compliance dossier.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SLIDE 25: Closing -->
    <div class="slide">
      <div class="kicker">Next Steps</div>
      <div class="slide-title">Conclusion & Next Steps: Deploying FinConsent</div>
      <div class="slide-subtitle">Accelerating advisory compliance, investor trust, and practice scalability.</div>
      <div class="content-area">
        <div class="card" style="flex: 1;">
          <h3>Implementation & Onboarding Path</h3>
          <ul style="font-size: 13px; line-height: 1.8; margin-top: 12px;">
            <li><strong>1. Immediate Compliance Upgrade:</strong> Onboard RIA practice in under 10 minutes; configure SEBI INA registration number and firm compliance contacts.</li>
            <li><strong>2. Client Roster Migration:</strong> Import advisory clients with validated PANs, mobile numbers, and DOB attributes.</li>
            <li><strong>3. Pilot Rebalancing Run:</strong> Execute live mandates with select client families to demonstrate pre-trade tax transparency and frictionless mobile OTP consent.</li>
            <li><strong>4. Regulatory Peace of Mind:</strong> Rest assured knowing every trade authorization is cryptographically preserved in AWS Mumbai under Section 65B standards.</li>
          </ul>
        </div>
      </div>
    </div>

  </div>

  <div class="controls">
    <button class="btn" id="prev-btn">◀ Previous</button>
    <span id="slide-indicator">Slide 1 of 10</span>
    <button class="btn" id="next-btn">Next ▶</button>
    <button class="btn" id="full-btn">⛶ Fullscreen</button>
  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const indicator = document.getElementById('slide-indicator');
    let currentIdx = 0;

    function showSlide(idx) {
      slides.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
      });
      indicator.textContent = `Slide ${idx + 1} of ${slides.length}`;
      currentIdx = idx;
    }

    document.getElementById('prev-btn').addEventListener('click', () => {
      if (currentIdx > 0) showSlide(currentIdx - 1);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
      if (currentIdx < slides.length - 1) showSlide(currentIdx + 1);
    });

    document.getElementById('full-btn').addEventListener('click', () => {
      const el = document.getElementById('slide-viewport');
      if (!document.fullscreenElement) {
        el.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        if (currentIdx < slides.length - 1) showSlide(currentIdx + 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) showSlide(currentIdx - 1);
      }
    });
  </script>
</body>
</html>
"""

with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

with open(OUTPUT_HTML_ROOT, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"[SUCCESS] Standalone interactive HTML presentation created at:")
print(f"  - {OUTPUT_HTML}")
print(f"  - {OUTPUT_HTML_ROOT}")

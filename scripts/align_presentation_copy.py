import os
import re

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
gen_py = os.path.join(base_dir, "scripts", "generate_presentation.py")
gen_html = os.path.join(base_dir, "scripts", "generate_presentation_html.py")

# ==========================================
# 1. Align generate_presentation.py
# ==========================================
with open(gen_py, "r", encoding="utf-8") as f:
    py_text = f.read()

# Replace titles & claims
py_text = py_text.replace(
    'prs.core_properties.title = "FinConsent — Statutory Trade Authorization & Tax Infrastructure"',
    'prs.core_properties.title = "FinConsent — Advisory Proposal Consent & Tax Infrastructure"'
)
py_text = py_text.replace(
    'p.text = "Enterprise Statutory Trade Authorization & Tax Infrastructure for Indian RIAs"',
    'p.text = "Enterprise Advisory Proposal Consent & Tax Infrastructure for Indian RIAs"'
)
py_text = py_text.replace(
    '("1. Informal WhatsApp & Email Approvals (Regulatory Rejection)",',
    '("1. Informal Communication & Evidentiary Fragmentation",\n         "Advisers frequently communicate rebalancing proposals over chat or email. While discoverable, these unstructured records fragment rationale and create administrative collation overhead during SEBI Regulation 19 audits, failing Section 63 BSA electronic admissibility standards.",'
)
py_text = py_text.replace(
    'add_bullet_point(tf, "Uncompromising Consent Rail", "Trade authorization strictly requires formal statutory declarations and single-use 6-digit OTP verification.", font_size=13.5)',
    'add_bullet_point(tf, "Uncompromising Consent Rail", "Proposal acknowledgement strictly requires formal statutory declarations and single-use 6-digit OTP verification.", font_size=13.5)'
)

# Hypothesis labeling on slide 2 & 4
py_text = py_text.replace(
    '"72-Hour Turnaround Latency"',
    '"Hypothesized 72-Hour Latency"'
)

# Update slide 21 test counts
py_text = py_text.replace(
    '("223 / 223", "Automated Tests Passing", "17 suites passing in Vitest with zero regressions.")',
    '("230 / 230", "Automated Tests Passing", "17 suites passing in Vitest with 100% zero regressions.")'
)

with open(gen_py, "w", encoding="utf-8") as f:
    f.write(py_text)

print("Updated generate_presentation.py")

# ==========================================
# 2. Align generate_presentation_html.py
# ==========================================
with open(gen_html, "r", encoding="utf-8") as f:
    html_text = f.read()

html_text = html_text.replace(
    "Enterprise Statutory Trade Authorization & Tax Infrastructure for Indian RIAs",
    "Enterprise Advisory Proposal Consent & Tax Infrastructure for Indian RIAs"
)
html_text = html_text.replace(
    "Statutory Trade Authorization & Tax-Impact Consent for SEBI RIAs",
    "Advisory Proposal Consent & Tax-Impact Infrastructure for SEBI RIAs"
)
html_text = html_text.replace(
    "223 / 223",
    "230 / 230"
)

with open(gen_html, "w", encoding="utf-8") as f:
    f.write(html_text)

print("Updated generate_presentation_html.py")

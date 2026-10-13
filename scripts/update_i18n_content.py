import os
import re

# Updates across all 8 locales and domain files
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
locales_dir = os.path.join(base_dir, "src", "i18n", "locales")
domains_dir = os.path.join(locales_dir, "domains")

# 1. Update en.js
en_file = os.path.join(locales_dir, "en.js")
with open(en_file, "r", encoding="utf-8") as f:
    en_text = f.read()

en_replacements = {
    "tagline: 'Statutory Trade Authorization & Tax-Impact Consent for SEBI RIAs'":
        "tagline: 'Advisory Proposal Consent & Tax-Impact Infrastructure for SEBI RIAs'",
    "pan_helper: 'Required for Section 65B Indian Evidence Act identification'":
        "pan_helper: 'Required for Section 63 BSA / Section 65B identification'",
    "ria_title: 'Adviser Execution Workspace'":
        "ria_title: 'Adviser Proposal Workspace'",
    "comp_desc: 'Regulatory surveillance workspace for SEBI Compliance Officers. Scrutinize non-discretionary consent records, audit SHA-256 hash chains, and export certified Section 65B electronic compliance dossiers.'":
        "comp_desc: 'Regulatory surveillance workspace for SEBI Compliance Officers. Scrutinize non-discretionary consent records, audit SHA-256 hash chains, and export certified Section 63 BSA electronic compliance dossiers.'",
    "comp_hash_title: 'Section 65B Electronic Evidence Trail • SHA-256 Hash Chained'":
        "comp_hash_title: 'Section 63 BSA Electronic Evidence Trail • SHA-256 Hash Chained'",
    "page_title: 'Statutory Trade Authorization & Tax-Impact Consent'":
        "page_title: 'Advisory Proposal Consent & Tax-Impact Review'",
    "otp_guarantee_text: 'Statutory 6-digit OTP verification • Preserved in AWS Mumbai for 5 Years under SEBI Reg 19'":
        "otp_guarantee_text: 'Evidentiary 6-digit OTP verification • Preserved in AWS Mumbai for 5 Years under SEBI Reg 19'",
    "statutory_lock_notice: 'Mandate Authorized & Locked under Section 65B Indian Evidence Act'":
        "statutory_lock_notice: 'Mandate Acknowledged & Locked under Section 63 BSA (Sec 65B Antecedent)'",
    "generate_otp_button: 'Generate Trade Authorization OTP'":
        "generate_otp_button: 'Generate Proposal Verification OTP'",
    "receipt_title: 'Official Compliance Receipt & Section 65B Audit Record'":
        "receipt_title: 'Official Compliance Receipt & Section 63 BSA Audit Record'",
    "receipt_desc: 'This rebalancing mandate has been cryptographically sealed and permanently locked under SEBI Regulation 19 and Section 65B of the Indian Evidence Act.'":
        "receipt_desc: 'This rebalancing mandate has been cryptographically sealed and permanently locked under SEBI Regulation 19 and Section 63 of Bharatiya Sakshya Adhiniyam, 2023.'",
    "next_step_1: 'Adviser Execution: Your adviser ({firm}) has received your authorization and is clear to place order batches before the market cutoff window closes.'":
        "next_step_1: 'Advisory Record: Your adviser ({firm}) has received your proposal acknowledgement and logged the advice rationale in compliance records.'",
    "next_step_2: 'Trade Settlement: Execution contract notes will be issued directly by your connected registered broker according to exchange clearing guidelines.'":
        "next_step_2: 'Trade Placement: Please execute the approved trades on your preferred broker terminal, or instruct your broker in accordance with your advisory agreement.'",
    "tech_evidence_heading: 'Technical Evidence Reference (Section 65B Indian Evidence Act)'":
        "tech_evidence_heading: 'Technical Evidence Reference (Section 63 BSA / Sec 65B IEA)'",
    "banner_approved_title: 'Status: Statutory Consent Verified & Clear for Trade Execution'":
        "banner_approved_title: 'Status: Proposal Acknowledgement Recorded & Auditable'",
    "banner_expired_title: 'Cutoff Window Expired — Execution Stalled'":
        "banner_expired_title: 'Cutoff Window Expired — Proposal Lapsed'",
    "sign_in_subtitle: 'Secure statutory trade authorization & compliance portal'":
        "sign_in_subtitle: 'Secure advisory proposal consent & compliance portal'",
}

for old, new in en_replacements.items():
    if old in en_text:
        en_text = en_text.replace(old, new)

with open(en_file, "w", encoding="utf-8") as f:
    f.write(en_text)

print("Updated en.js")

# 2. Update magic_link.js domain
ml_file = os.path.join(domains_dir, "magic_link.js")
if os.path.exists(ml_file):
    with open(ml_file, "r", encoding="utf-8") as f:
        ml_text = f.read()
    ml_text = ml_text.replace("Legal trade authorization is captured via 1-tap OTP verification.",
                              "Proposal acknowledgement is recorded via secure OTP verification.")
    ml_text = ml_text.replace("Statutory trade authorization and capital gains breakdown",
                              "Advisory proposal consent and capital gains tax breakdown")
    with open(ml_file, "w", encoding="utf-8") as f:
        f.write(ml_text)
    print("Updated magic_link.js")

# 3. Update dossier.js domain (Section 65B -> Section 63 BSA / Section 65B)
dossier_file = os.path.join(domains_dir, "dossier.js")
if os.path.exists(dossier_file):
    with open(dossier_file, "r", encoding="utf-8") as f:
        d_text = f.read()
    d_text = d_text.replace(
        "Section 65B of the Indian Evidence Act, 1872",
        "Section 63 of Bharatiya Sakshya Adhiniyam, 2023 / Section 65B IEA"
    )
    with open(dossier_file, "w", encoding="utf-8") as f:
        f.write(d_text)
    print("Updated dossier.js")

# 4. Update landing.js domain (Section 65B -> Section 63 BSA)
landing_file = os.path.join(domains_dir, "landing.js")
if os.path.exists(landing_file):
    with open(landing_file, "r", encoding="utf-8") as f:
        l_text = f.read()
    l_text = l_text.replace(
        "Section 65B Certificate",
        "Section 63 BSA / Section 65B Certificate"
    )
    l_text = l_text.replace(
        "admissible under Section 65B Indian Evidence Act",
        "admissible under Section 63 Bharatiya Sakshya Adhiniyam, 2023"
    )
    with open(landing_file, "w", encoding="utf-8") as f:
        f.write(l_text)
    print("Updated landing.js")

print("All i18n content alignment scripts completed successfully.")

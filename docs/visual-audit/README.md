# FinConsent Visual Audit & Architecture Diagrams Directory

This directory houses the comprehensive visual audit artifacts, real-browser workflow captures, security exception proofs, and high-resolution Graphviz architecture diagrams for the **FinConsent** platform.

---

## Directory Structure

```
docs/visual-audit/
├── diagrams/             # 18 Regenerated Graphviz architecture & workflow diagrams (.dot, .svg, .png)
├── workflow/             # 11 End-to-end B2B SaaS journey screenshots + WebM recording player
├── mandate-security/     # 13 Mobile unlock, clarification chat & security exception screenshots
├── security/             # 24 RBAC, IDOR prevention, and OTP lockout verification screenshots
└── README.md             # This directory catalog
```

---

## 1. Master Architecture & Workflow Diagrams (`diagrams/`)

All diagrams are compiled via `@hpcc-js/wasm-graphviz` into vector SVG and rasterized into high-resolution 300-DPI equivalent PNGs via headless Microsoft Edge. Each diagram conforms to the institutional WealthTech design palette with minimum font size >= 12pt:

| Diagram Name | Concept / Flow | SVG Asset | High-Res PNG Asset |
| :--- | :--- | :--- | :--- |
| **process-flow** | Statutory advisory consent lifecycle & security guards | [`process-flow.svg`](diagrams/process-flow.svg) | [`process-flow.png`](diagrams/process-flow.png) |
| **cause-effect-map** | Informal practices vs regulatory compliance impacts | [`cause-effect-map.svg`](diagrams/cause-effect-map.svg) | [`cause-effect-map.png`](diagrams/cause-effect-map.png) |
| **four-pillar-hub** | 4 institutional pillars (Tax, Crypto, Mobile, BSA §63) | [`four-pillar-hub.svg`](diagrams/four-pillar-hub.svg) | [`four-pillar-hub.png`](diagrams/four-pillar-hub.png) |
| **actor-lanes** | 3-actor sequence: RIA (Suresh), Platform, Client (Rohan) | [`actor-lanes.svg`](diagrams/actor-lanes.svg) | [`actor-lanes.png`](diagrams/actor-lanes.png) |
| **main-journey-flow** | 5-stage happy path: Draft → Sent → Viewed → Consented → Sealed | [`main-journey-flow.svg`](diagrams/main-journey-flow.svg) | [`main-journey-flow.png`](diagrams/main-journey-flow.png) |
| **exception-flows** | Terminal exception boundaries: Expired (48h), Revoked, Locked Out | [`exception-flows.svg`](diagrams/exception-flows.svg) | [`exception-flows.png`](diagrams/exception-flows.png) |
| **unlock-sequence** | 5-step key derivation: Token → PAN/DOB → PBKDF2 → DEK → Plaintext | [`unlock-sequence.svg`](diagrams/unlock-sequence.svg) | [`unlock-sequence.png`](diagrams/unlock-sequence.svg) |
| **tenant-isolation** | Firm A vs Firm B scoping middleware & IDOR 403 block | [`tenant-isolation.svg`](diagrams/tenant-isolation.svg) | [`tenant-isolation.png`](diagrams/tenant-isolation.png) |
| **envelope-encryption**| Dual-envelope wrapping (Server Master Key + Client PBKDF2) | [`envelope-encryption.svg`](diagrams/envelope-encryption.svg) | [`envelope-encryption.png`](diagrams/envelope-encryption.png) |
| **otp-attempts** | 3-attempt OTP rate-limiting state machine & lockout (HTTP 429) | [`otp-attempts.svg`](diagrams/otp-attempts.svg) | [`otp-attempts.png`](diagrams/otp-attempts.png) |
| **hash-chain** | Forward append-only SHA-256 block ledger (N-1, N, N+1) | [`hash-chain.svg`](diagrams/hash-chain.svg) | [`hash-chain.png`](diagrams/hash-chain.png) |
| **chat-vs-consent** | Separation of clarification chat rail vs statutory OTP consent rail | [`chat-vs-consent.svg`](diagrams/chat-vs-consent.svg) | [`chat-vs-consent.png`](diagrams/chat-vs-consent.png) |
| **advance-tax-timeline**| Section 208 / 234C 4-quarter installment schedule (15%, 45%, 75%, 100%)| [`advance-tax-timeline.svg`](diagrams/advance-tax-timeline.svg) | [`advance-tax-timeline.png`](diagrams/advance-tax-timeline.png) |
| **threat-defence-mapping**| 4 primary threat vectors mapped to hardened platform defenses | [`threat-defence-mapping.svg`](diagrams/threat-defence-mapping.svg) | [`threat-defence-mapping.png`](diagrams/threat-defence-mapping.png) |
| **deployment-topology**| Multi-stage Docker container in AWS Mumbai (ap-south-1) with Atlas | [`deployment-topology.svg`](diagrams/deployment-topology.svg) | [`deployment-topology.png`](diagrams/deployment-topology.png) |
| **before-after-flow** | Legacy informal WhatsApp/Email vs FinConsent digital evidence rail | [`before-after-flow.svg`](diagrams/before-after-flow.svg) | [`before-after-flow.png`](diagrams/before-after-flow.png) |
| **evidence-pack-composition**| Section 63 BSA compliance dossier attributions & payload hashing | [`evidence-pack-composition.svg`](diagrams/evidence-pack-composition.svg) | [`evidence-pack-composition.png`](diagrams/evidence-pack-composition.png) |
| **pilot-timeline** | 4-week structured RIA practice pilot roadmap & validation gates | [`pilot-timeline.svg`](diagrams/pilot-timeline.svg) | [`pilot-timeline.png`](diagrams/pilot-timeline.png) |

---

## 2. B2B SaaS Workflow Journey (`workflow/`)

Real-browser Puppeteer screenshots verifying the end-to-end journey from RIA proposal formulation through client review and broker execution handoff:

1. `01-ria-dashboard-firm-workspace.png` — Authenticated RIA workspace with SEBI INA registration badge.
2. `02-ria-clients-directory.png` — Client roster with PAN masking and active mandate counts.
3. `03-ria-client-added-association.png` — Client association to advisory firm with statutory disclosure notice.
4. `04-ria-draft-recommendation-page.png` — Rebalance proposal composer with live capital gains tax estimation.
5. `05-ria-recommendation-dispatched-detail.png` — Dispatched proposal detail with 48h cutoff timer.
6. `06-client-review-desktop.png` — Desktop client proposal review interface.
7. `07-client-review-mobile.png` — Mobile viewport (390px) responsive rebalance review.
8. `08-client-receipt-confirmation-desktop.png` — Desktop Section 63 BSA compliance confirmation screen.
9. `09-client-receipt-confirmation-mobile.png` — Mobile compliance receipt confirmation screen.
10. `10-ria-mandate-consented-audit-trail.png` — Full audit trail timeline displaying chained events.
11. `11-ria-dashboard-updated-consented.png` — Real-time RIA dashboard updated with consented statutory badge.
12. `12-client-unauthorized-redirect.png` — Role-based enforcement blocking client role from advisor screens.
13. `finconsent-b2b-workflow-recording.webm` — High-definition (30 FPS) WebM recording of the complete flow.
14. `workflow-recording-player.html` — Interactive HTML5 player with verified journey stage breakdown.

---

## 3. Mandate Security & Mobile Chat (`mandate-security/`)

Screenshots capturing the zero-friction mobile client experience, PBKDF2 password unlock gate, clarification chat rail, and exception lockouts:

- `01_ria_mandate_created.png` — Draft proposal created with locked tax calculation.
- `02_client_password_required.png` — Desktop password challenge gate (PAN Last 4 + DOB).
- `03_client_mandate_unlocked.png` — Unlocked proposal showing rebalance rationale and trade baskets.
- `04_client_chat_question.png` — Client clarification inquiry submitted in chat rail.
- `05_advisor_chat_reply.png` — Advisor response in chat rail (clearly demarcated as discussion, not consent).
- `06_consent_locked_evidence.png` — Digitally sealed Section 63 BSA evidence dossier receipt.
- `07_mobile_unlock_screen.png` — Mobile smartphone view (390px) of password unlock gate.
- `08_mobile_mandate_unlocked.png` — Mobile view of decrypted portfolio drift and tax preview.
- `09_mobile_chat_discussion.png` — Mobile chat discussion thread without navigation artifacts.
- `attack_01_random_url.png` — 404 / 410 rejection of non-existent or malformed magic link tokens.
- `attack_03_brute_force_lockout.png` — Brute-force lockout screen after 5 failed password attempts.
- `attack_07_expired_mandate.png` — Rejection screen when accessing mandate past 48h cutoff window.
- `attack_08_revoked_mandate.png` — Rejection screen when accessing RIA-retracted/revoked mandate.

---

## 4. Security & Role Isolation Audits (`security/`)

Automated security verification test captures proving defense-in-depth:

- Cross-tenant IDOR access denials (HTTP 403 Forbidden).
- Rate-limiting lockouts after 3 failed OTP attempts (HTTP 429 Too Many Requests).
- Strict role-based navigation shielding (client accounts cannot access advisor or billing views).
- Totp MFA enrollment and challenge rejection for invalid codes.

---

## Maintenance & Regeneration

To regenerate all diagrams across `docs/diagrams/`, `diagrams/`, and `docs/visual-audit/diagrams/`:

```bash
node scripts/generate-all-diagrams.mjs
node scripts/generate-process-flow-diagram.mjs
```

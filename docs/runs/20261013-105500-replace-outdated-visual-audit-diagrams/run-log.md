# Run 20261013-105500-replace-outdated-visual-audit-diagrams
Started: 2026-10-13 10:55:00 +0530
Finished: 2026-10-13 11:10:00 +0530
Status: shipped

## 1. Request and mode (verbatim)
"Run fullstack-builder fix delete all outdated visual-audit diagrams, and replace them with new ones."
Mode: fix

## 2. Spec (path, sha256, validation result, warnings, diff vs docs/spec.lock.json)
- Target: Audit, clean up, and replace all outdated visual-audit diagrams and artifacts across `docs/diagrams/`, `diagrams/`, and `docs/visual-audit/`.
- Scope: Delete obsolete, duplicate, and debug-failure visual-audit artifacts; update Graphviz `.dot` specifications with verified BSA §63 and non-discretionary rebalancing terminology; generate fresh, high-resolution `.svg` and `.png` diagrams across all 18 platform flows and architecture models; synchronize `docs/visual-audit/diagrams/`, `docs/diagrams/`, root `diagrams/`, and `workflow-recording-player.html`.
- Boundary: Visual and documentation assets only. Zero changes to application logic, database, or API contracts.

## 3. Context read (files)
- `docs/diagrams/*.dot`
- `scripts/generate_all_presentation_diagrams.py`
- `scripts/generate-all-svg-diagrams.mjs`
- `scripts/generate-process-flow-diagram.mjs`
- `docs/visual-audit/`
- `docs/visual-audit/workflow/workflow-recording-player.html`
- `userjourney.md` & `docs/userJourney.md`

## 4. Routing
- Visual & Graphic Systems Specialist: Audit all existing diagram `.dot` definitions; update labels with BSA §63, Finance Act 2024 tax engine, non-discretionary advisory proposals, and Section 234C first proviso relief.
- QA & Asset Cleaner: Delete outdated/stale visual-audit files (`debug_advisor_chat_fail.png`, `debug-mfa-fail.png`, obsolete duplicate login screens, unreferenced outdated baseline screenshots).
- Diagram Generator: Execute Graphviz pipeline to generate all 18 `.svg` and `.png` diagrams (retina 2x DPI) into `docs/diagrams/`, root `diagrams/`, and `docs/visual-audit/diagrams/`.
- Documentation Auditor: Update `workflow-recording-player.html`, synchronize markdown links, run `verify_documentation_consistency.py`, `audit_pptx_layout.py`, and `npm test`.

## 5. Plan (3 bullets)
1. Delete outdated, duplicate, and failed visual-audit files from `docs/visual-audit/` while safeguarding active referenced screenshots.
2. Update all Graphviz `.dot` specifications to remove obsolete statutory trade/65B claims and generate crisp, high-resolution SVG and PNG diagrams for all 18 architecture, state, and security flows in `docs/diagrams/`, `diagrams/`, and `docs/visual-audit/diagrams/`.
3. Update `workflow-recording-player.html` and documentation, then verify consistency with `verify_documentation_consistency.py`, layout audit, and regression test suites.

## 6. Rubric (frozen)
- Criterion 1 (Outdated Asset Removal): All stale debug failure captures, duplicate login screenshots, and outdated unreferenced baseline captures are cleanly deleted; active workflow screenshots are strictly preserved.
- Criterion 2 (New Diagram Generation & Accuracy): All 18 architectural and workflow diagrams are regenerated in both `.svg` and high-res `.png` with modern WealthTech styling, BSA §63 citations, 20% STCG / 12.5% LTCG rates, and non-discretionary rebalancing wording across `docs/diagrams/`, `diagrams/`, and `docs/visual-audit/diagrams/`.
- Criterion 3 (Zero Regression & Verification): All documentation links resolve cleanly (100% PASS on `verify_documentation_consistency.py`), presentation decks remain valid, and all 230 Vitest tests pass without application logic changes.

## 7. Summary of Changes
- Outdated Files Deleted:
  - `docs/visual-audit/mandate-security/debug_advisor_chat_fail.png` (obsolete debug artifact)
  - `docs/visual-audit/security/debug-mfa-fail.png` (obsolete debug artifact)
  - `docs/visual-audit/03-guest-login-desktop.png` (superseded by updated capture)
  - `docs/visual-audit/03-guest-login-mobile.png` (superseded by updated capture)
- Diagram Compiler Pipeline Created & Executed:
  - Built `scripts/generate-all-diagrams.mjs` using `@hpcc-js/wasm-graphviz` and headless Chromium/Edge rasterization (device scale factor: 2, crisp typography and geometry).
  - Updated `scripts/generate-process-flow-diagram.mjs` for BSA §63 certificate & non-discretionary advisory proposals.
  - Successfully generated 54 files across each directory (`docs/diagrams/`, `diagrams/`, `docs/visual-audit/diagrams/`) totaling 162 diagram assets.
- Visual Audit Documentation:
  - Synchronized `docs/visual-audit/workflow/workflow-recording-player.html`.
  - Created `docs/visual-audit/README.md` cataloging screenshots, workflows, and diagrams.

## 8. Verification Results
- `python scripts/verify_documentation_consistency.py`: 100% PASSED (49/49 images resolved).
- `python scripts/audit_pptx_layout.py`: 100% PASSED (30 slides, 16:9 widescreen, zero footer collisions).
- `npm test -- --run`: 100% PASSED (17 test files, 230 passed).

## 9. Catalog of Generated Diagrams (18 Total)
1. `actor-lanes` (.dot, .svg, .png) - Four-lane cross-functional interaction (RIA, Client, FinConsent, Broker)
2. `advance-tax-timeline` (.dot, .svg, .png) - Section 234C quarterly installment schedule & first proviso capital gains relief
3. `before-after-flow` (.dot, .svg, .png) - Regulatory & operational comparison (Informal WhatsApp vs FinConsent BSA §63)
4. `cause-effect-map` (.dot, .svg, .png) - Regulatory non-compliance risks vs architectural safeguards
5. `chat-vs-consent` (.dot, .svg, .png) - Separation of informal advisory discussions from formal tamper-evident mandates
6. `deployment-topology` (.dot, .svg, .png) - Production infrastructure in AWS Mumbai (`ap-south-1`)
7. `envelope-encryption` (.dot, .svg, .png) - Two-tier cryptographic key hierarchy (KMS master key + mandate DEK)
8. `evidence-pack-composition` (.dot, .svg, .png) - Structure of BSA §63 compliant tamper-evident evidence pack
9. `exception-flows` (.dot, .svg, .png) - Mandate expiry, cancellation, revocation, and re-issuance state machine
10. `four-pillar-hub` (.dot, .svg, .png) - Four architectural pillars of FinConsent governance
11. `hash-chain` (.dot, .svg, .png) - Merkle-linked cryptographic audit trail structure
12. `main-journey-flow` (.dot, .svg, .png) - Complete end-to-end user lifecycle flow
13. `otp-attempts` (.dot, .svg, .png) - Rate-limiting, brute-force mitigation, and exponential backoff
14. `pilot-timeline` (.dot, .svg, .png) - 4-week enterprise onboarding, sandbox dry-run, and production rollout
15. `process-flow` (.dot, .svg, .png) - Core statutory consent lifecycle and broker execution boundary
16. `tenant-isolation` (.dot, .svg, .png) - Multi-tenant B2B RIA organization partition & RBAC boundaries
17. `threat-defence-mapping` (.dot, .svg, .png) - Threat model mitigation matrix
18. `unlock-sequence` (.dot, .svg, .png) - Time-gated, password-authenticated mandate decryption sequence

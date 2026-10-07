# Run 20261007-143600-enhance-journey-ui-ux
Started: 2026-10-07 14:36:00 +0530
Finished: -
Status: in progress

## 1. Request and mode (verbatim)
"Run fullstack-builder enhance the existing FinConsent website journey without changing its core functionality: make the experience feel simpler, more intuitive, and more trustworthy by clearly guiding the RIA from creating a client mandate and reviewing the tax impact, to sending the proposal, tracking client review, receiving OTP-based consent, and finally generating the compliance receipt; make the client journey extremely simple and mobile-first, with a clear “What is changing?”, “Why is it changing?”, “Estimated tax impact”, “What am I approving?”, and “Approve” flow; reduce unnecessary technical terminology and expose cryptographic hashes, audit-chain details, role complexity, and backend concepts only where they are relevant to compliance or audit users; strengthen status visibility, next actions, deadlines, consent confirmation, and error/expired-link states; and overall make the product feel like a polished regulated financial-consent workflow rather than a collection of separate dashboards and features."

## 2. Spec (path, sha256, validation result, warnings, diff vs docs/spec.lock.json)
- Spec lock: docs/spec.lock.json
- Mode: fix / enhance existing project journey without altering core functionality or live API contracts.

## 3. Context read (files)
- docs/CONTRACTS.md
- docs/spec.lock.json
- docs/runs/INDEX.md
- docs/userJourney.md
- src/features/client-review/ClientReviewPage.jsx
- src/features/client-review/ClientReceiptPage.jsx
- src/features/mandate-builder/DashboardPage.jsx
- src/features/mandate-builder/MandateDetailPage.jsx
- src/features/mandate-builder/MandateNewPage.jsx

## 4. Routing (agents chosen; agents skipped and why)
- Master PM orchestrating frontend UI/UX enhancement, client review streamlining, and RIA lifecycle journey guiding.

## 5. Plan (3 bullets)
1. RIA Workflow Guidance: Implement an intuitive statutory lifecycle stepper across Dashboard and Mandate Detail views that guides RIAs from Draft → Tax Review → Dispatch → Track Review → Verified Consent → Regulation 19 Dossier Receipt with clear "Next Actions".
2. Client Review Overhaul: Transform `/m/:token` into an ultra-intuitive mobile-first journey structured cleanly around "What is changing?", "Why is it changing?", "Estimated tax impact", "What am I approving?", and "Authorize with OTP", hiding cryptographic hashes from retail clients while reinforcing trust.
3. Polish & Edge States: Strengthen cutoff deadline badges, improve the expired-proposal screen with clear next steps, refine confirmation receipts, and verify complete test suite and build stability.

## 6. Rubric (frozen; every acceptance item mapped to criterion 1, 2 or 3, unedited)
- Criterion 1: RIA experience guides seamlessly through creating, tax review, dispatching, tracking, and receipt generation with clear status and next actions.
- Criterion 2: Client experience is mobile-first, simple, structured around the 5 key questions, without unnecessary technical cryptographic jargon.
- Criterion 3: Deadlines, expired states, consent confirmations, and compliance receipts feel cohesive, polished, and fully functional with 26/26 tests passing.

## 7. Execution (one sub-heading per plan bullet; files touched; decisions; unexpected events and how resolved)
### 7.1 RIA Workflow Guidance
- Created `src/components/brand/StatutoryLifecycleGuide.jsx` and exported it in `src/components/brand/index.js`. Built a 6-step statutory progress track (`1. Draft Mandate` → `2. Tax Impact` → `3. Dispatch Link` → `4. Client Review` → `5. OTP Consent` → `6. Reg. 19 Receipt`) with context-aware "Recommended Next Action" banners.
- Updated `src/features/mandate-builder/MandateDetailPage.jsx` to render `StatutoryLifecycleGuide`, added 1-click proposal link copying, direct WhatsApp sharing button, and preview mobile portal button.
- Updated `src/features/mandate-builder/DashboardPage.jsx` with an overview Statutory Lifecycle Rail for RIAs/Admins, and replaced generic action links with "Guided Next Action" buttons tailored to mandate lifecycle state (`Review & Dispatch`, `Share Link`, `Remind Client`, `Reg. 19 Receipt`, `Re-draft`).

### 7.2 Client Review Mobile-First Overhaul
- Overhauled `src/features/client-review/ClientReviewPage.jsx` to focus on the 5 essential questions:
  1. *What is changing in your portfolio?* (Current vs Proposed visual allocation cards)
  2. *Why is this portfolio rebalance recommended?* (Statutory rationale and risk parity re-weighting)
  3. *Estimated capital gains tax impact* (Human-friendly STCG/LTCG summary with net payable indicator)
  4. *What am I approving?* (Plain-English non-discretionary rights checklist)
  5. *Review & Authorize via Mobile OTP* (6-digit OTP confirmation with 48-hour cutoff countdown)
- Removed raw SHA-256 hashes and cryptic database keys from consumer view.
- Added comprehensive expired-state guidance preventing portfolio slippage and explaining how to contact the RIA for a refreshed proposal.
- Overhauled `src/features/client-review/ClientReceiptPage.jsx` with official SEBI Regulation 19 certificate styling, a 3-step "What happens next?" roadmap, and collapsed Section 65B cryptographic digests into an auditor-only accordion.

### 7.3 Cryptographic Jargon Cleanup & Edge State Refinement
- Updated `src/features/audit-trail/AuditTrailTimeline.jsx` to describe events in clear, human language by default, while providing an auditor toggle ("Show Section 65B Hashes") for compliance officers and Section 65B electronic evidence needs.
- Verified test suite and production bundling.

## 8. Verification (evidence for every plan bullet and rubric criterion)
- `npm test`: 5 test files, 26/26 tests passed (100% pass rate).
- `npm run build`: Vite build completed successfully in 11.55s producing optimized chunks.

## 9. Friction (optional, max 3 bullets, concrete and specific)
- None. Backend contracts and MongoDB Atlas persistence remained stable throughout.

## 10. Next steps (0 to 3 bullets, optional)
- All requirements satisfied. Ready for user acceptance.

## 11. Human gate question (verbatim, on its own line, exactly one of ship / one more pass / stop)
ship / one more pass / stop

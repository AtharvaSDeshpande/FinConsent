# FinConsent

**Statutory Trade Authorization and Tax-Impact Consent Platform for Indian SEBI-Registered Investment Advisers (RIAs)**

Built according to specification `site.spec.json` (spec_version 1.1) by `fullstack-builder`.

## Features
- **SEBI Regulation 19 Compliance**: Prior informed consent with tamper-evident SHA-256 audit logs.
- **Automated Indian Capital Gains Engine**: Pre-computed STCG @ 20% and LTCG @ 12.5% (post ₹1.25L exemption), 4% cess, and Section 234B/234C Advance Tax alerts.
- **Zero-Login Mobile Magic Links**: Client proposal inspection with 6-digit Mobile OTP sign-off.
- **Regulation 19 Dossier Export**: Section 65B Indian Evidence Act compliant PDF/printable certificates.
- **Tiered B2B SaaS**: Free tier (3 mandates limit) & Pro RIA upgrade (₹2,499/mo + GST) via Razorpay.

## Tech Stack
- Frontend: React 18, Vite, Material UI (MUI v6), React Router DOM
- Backend: Node.js, Express.js REST API
- Storage: MongoDB Atlas (AWS Mumbai `ap-south-1`)
- Testing: Vitest, React Testing Library

## Quick Start
```bash
# Install dependencies
npm install

# Start development servers
npm run dev     # Starts Vite frontend on http://localhost:5173
npm run server  # Starts Express API server on http://localhost:5000

# Run test suite
npm test

# Run linter
npm run lint
```

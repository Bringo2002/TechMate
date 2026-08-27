# 🚀 TechMate

Enterprise‑grade frontend starter for service businesses — polished marketing sites and client portals built with React, TypeScript, Tailwind and Firebase Auth. Opinionated for performance, security, and rapid client launches.

Badges: CI · Build · License · Status

---

## TL;DR

TechMate is a production‑ready frontend scaffold for agencies and product teams who need:
- Fast developer experience (Vite + TypeScript)
- Accessible, responsive UI (Tailwind CSS)
- Polished motion & micro‑interactions (Framer Motion)
- Secure authentication (Firebase Auth)
- Simple customer support entry (WhatsApp link/button)
- Clear separation between marketing site and protected client portal

This README intentionally contains no sensitive credentials — replace placeholders with project secrets stored in your CI/secret manager.

---

## Table of contents

- [Vision](#vision)  
- [What’s included](#whats-included)  
- [High-level architecture](#high-level-architecture)  
- [Production readiness checklist](#production-readiness-checklist)  
- [Developer quickstart](#developer-quickstart)  
- [Configuration (secrets & env)](#configuration-secrets--env)  
- [Recommended workflows (CI / deploy / testing)](#recommended-workflows-ci--deploy--testing)  
- [Observability & alerts](#observability--alerts)  
- [Security](#security)  
- [Contribution & ownership](#contribution--ownership)  
- [Legal & license](#legal--license)  
- [Contact](#contact)

---

## Vision

Ship beautiful, accessible client experiences quickly with an architecture that scales from single‑page marketing sites to multi‑tenant client portals. TechMate emphasizes developer ergonomics, performance, and production safety.

---

## What’s included

- React + TypeScript app scaffold (Vite)
- Tailwind CSS + accessible component primitives
- Framer Motion for polished micro‑interactions
- Firebase Authentication (email/password + Google)
- Legal pages scaffold: Terms & Privacy
- WhatsApp contact integration (client side link/button)
- Opinionated project structure and linting / formatting hooks

---

## High-level architecture

- Client app (SPA) served as static assets (S3, Netlify, Vercel, etc.)
- Auth: Firebase Authentication (client SDK)
- Optional backend services (Admin API, webhooks) are out of scope but supported via modular feature folders
- Routing: React Router with guarded/protected routes for portal areas
- Build: Vite for dev/prod builds; single artifact (dist)

Diagram (conceptual)
- Browser ↔ Static hosting (front-end)
  - Front-end ↔ Firebase Auth (OIDC flows)
  - Front-end ↔ Optional APIs (Admin / Payments)

---

## Production readiness checklist

Before shipping, ensure:
- Environment secrets are stored in a secrets manager or CI (no .env in VCS)
- OAuth redirect URIs configured for every domain (dev, staging, prod)
- CSP (Content Security Policy) and security headers set at hosting/CDN
- Automatic builds + tests on PRs
- Basic monitoring + uptime alerting enabled
- Rate limits and abuse protections considered for public endpoints

---

## Developer quickstart

Prereqs
- Node.js 18+ (LTS)
- npm / pnpm / yarn
- Firebase account (for Authentication)

Install & run (local)
```bash
git clone https://github.com/Bringo2002/TechMate.git
cd TechMate
# preferred package manager of your team
npm install
npm run dev
# open http://localhost:5173
```

Build & preview
```bash
npm run build
npm run preview
```

Notes
- Use Node LTS in CI.
- Run linters and tests locally before opening PRs.

---

## Configuration — secrets & environment

This repo purposely does not include secret values. Use your environment / secret manager. Example env keys used by the app (names only — DO NOT put values into source):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_WHATSAPP_NUMBER
- VITE_APP_TITLE

Best practices
- Store secrets in your CI/CD provider (Vercel/Netlify/Cloud) or a vault (HashiCorp / AWS Secrets Manager).
- Only expose public client keys in environment variables prefixed for the bundler (Vite: VITE_).
- Admin/service credentials must never be shipped to the browser.

Example initialization (safe to include in source):
```ts
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

WhatsApp button (no personal contact embedded in repo):
```tsx
// src/components/WhatsAppButton.tsx
export function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;
  const message = encodeURIComponent("Hello — I'd like to learn about your services.");
  return (
    <a>
      Contact Support
    </a>
  );
}
```

---

## Recommended CI / deployment

- Run on PR: install → lint → typecheck → unit tests → build
- Merge to protected branches only (main/master protected; require reviews + passing CI)
- Use a staging environment for smoke tests before production deploy
- Suggested GitHub Actions skeleton:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Lint &amp; Typecheck
        run: npm run lint &amp;&amp; npm run type-check
      - name: Test
        run: npm test -- --ci
      - name: Build
        run: npm run build
```

Deployment: Vercel / Netlify / CloudFront + S3 are recommended. Configure redirects for SPA routing and add security headers at CDN.

---

## Testing & quality

- Unit: Vitest + React Testing Library
- E2E: Playwright (run against staging)
- Static analysis: ESLint (TS rules), TypeScript strict mode
- Formatting: Prettier (CI enforced)
- Coverage: Ensure minimum thresholds on critical modules (auth flows, routing guards)

---

## Observability & alerts

- Client errors: Sentry or alternative for release tracking (source maps uploaded in CI)
- Performance: Real User Monitoring (RUM) e.g., Datadog Browser, Web Vitals collection
- Uptime: Synthetic tests for essential flows (home, login, signup, key API endpoints)
- Alerts: Channel for critical alerts (email/Slack pager); separate severity levels

---

## Security

- Enforce HTTPS and HSTS in production.
- Harden CSP and X-Frame-Options via CDN or hosting config.
- Validate all user inputs on server side (for any API endpoints).
- Limit OAuth redirect URIs and rotate credentials when necessary.
- Conduct dependency audits and schedule periodic upgrades.

---

## Contribution & ownership

This repository is proprietary. Internal contributors:
- Branching: feature/*, fix/*, chore/*
- PRs: require 1–2 reviewers and passing CI
- Commit messages: follow Conventional Commits
- Releases: use annotated Git tags and changelog entries

For external contractors or partners, use an NDA and explicit written authorization.

---

## Legal & license

All Rights Reserved. This repository is proprietary and confidential.

Copyright (c) 2025 [OWNER NAME]

For licensing, partnership, or commercial use, contact the project owner via the internal contact channel — do not include private contact info in public repositories.

---

## Contact

This README intentionally omits direct personal contact information. Replace the following placeholders in your private distribution or internal docs:

- OWNER_NAME: Your full name
- CONTACT_EMAIL: contact@your-domain.example
- SUPPORT_PHONE: +[country][number]
- LIVE_DEMO_URL: https://your-deployed-domain.example

---

> Design intent: shipping-quality frontends that respect security and ops best practices while keeping developer experience fast and predictable.

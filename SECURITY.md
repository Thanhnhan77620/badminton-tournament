# SECURITY ARCHITECTURE & GUIDELINES — ISC BADMINTON OPEN 2026

## 1. Executive Summary
This document establishes the security architecture and operating guidelines for the ISC Badminton Open 2026 tournament web application. All features, integrations, and mutations must strictly adhere to the principles detailed below.

---

## 2. Core Security Principles (Zero-Trust & Defense-in-Depth)

1. **Default Deny**: All resources, database collections, routes, and capabilities are closed by default. Access is granted only via explicit authorization rules.
2. **Never Trust the Client**: Frontend checks, UI state, `localStorage`, or route guards are UX helpers only. True security is enforced in Firebase Security Rules and cryptographic session validation.
3. **Defense-in-Depth**: Multiple defensive layers operate simultaneously:
   - Edge Security Headers (CSP, Frame Options, MIME type enforcement via `vercel.json`).
   - XSS sanitization (DOMPurify for all rendered user text and HTML).
   - Backend Database Access Control (Firestore Security Rules with strict payload bounds).
   - Role-based and Authenticated mutation barriers (Firebase Auth).

---

## 3. Threat Model & Mitigations

| Threat Vector | Potential Impact | Implemented Mitigation |
| :--- | :--- | :--- |
| **Tampering with Live Scores / Winner Falsification** | Attacker calls Firestore directly to alter match outcomes | Firestore Rules require authenticated sessions (`request.auth != null`) and restrict schema structure. |
| **Cross-Site Scripting (Stored XSS)** | Injected scripts via tournament rules or athlete names | Full HTML sanitization via `DOMPurify` before DOM injection in all components. |
| **Clickjacking** | UI redress / embedding tournament within malicious `<iframe>` | `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'self'` enforced on Vercel edge. |
| **MIME Sniffing & Script Abuse** | Malicious MIME content execution | `X-Content-Type-Options: nosniff`. |
| **Data Deletion Attack** | Malicious deletion of tournament documents | `allow delete: if false;` in Firestore Rules permanently blocks client-side document drops. |

---

## 4. Content Security Policy (CSP) Configuration

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://* http://*; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.identitytoolkit.googleapis.com wss://*.firebaseio.com; frame-src 'self'; object-src 'none'; base-uri 'self';
```

---

## 5. Firestore Rules Summary

- **Collection `tournaments/{tournamentId}`**:
  - `allow read: if true;` (Athletes and spectators can access public schedules, bracket stages, and live scores).
  - `allow create, update: if request.auth != null && isValidTournamentPayload(request.resource.data);`
  - `allow delete: if false;`
- **Catch-All Default Deny**:
  - `match /{document=**} { allow read, write: if false; }`

---

## 6. Secure Coding Rules for Future Features

Before writing any new feature:
1. **Identify the Actor**: Determine who can read, create, modify, or delete the data.
2. **Schema & Integrity Validation**: Validate data types, non-negative numbers, string boundaries, and business constraints before persisting.
3. **Sanitize Inputs**: Run all text containing formatting through `DOMPurify`.
4. **No Hardcoded Secrets**: Keep credentials strictly out of frontend source and git commits.

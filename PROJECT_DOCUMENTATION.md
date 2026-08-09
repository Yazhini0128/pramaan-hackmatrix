# HackMatrix 2026 — Round 2 Project Documentation

---

## Team Name
**Team Perihelion**

## Team Leader
**Name:** Nandika Yazhini A E
**Email:** [nandikayazhiniarunothyakumar@gmail.com]
**Phone:** [9003313492]

## Event Name
HackMatrix 2026 — Round 2

## Project Name / Title
**Pramaan (प्रमाण)** — Digital Evidence Readiness & Admissibility Platform

---

## Links

| Link | URL |
|---|---|
| **GitHub Repository** (public) | https://github.com/Yazhini0128/pramaan-hackmatrix |
| **Live Deployed Link** | https://adorable-platypus-c56e82.netlify.app |
| **Demo Video** | https://drive.google.com/file/d/11K5P13aXcjwap3AP-X6ZHHpx22NtEIjY/view?usp=drivesdk |

---

## Your Problem Statement

Indian courts reject digital evidence in nearly 4 out of 10 cases — not because it's fake, but because investigators can't prove it wasn't altered. Missing cryptographic hashes, broken chains of custody, understaffed forensic labs, and missing Section 63 certificates (under the Bharatiya Sakshya Adhiniyam, 2023) cause strong cases to collapse on procedure rather than facts. Investigators today juggle disconnected tools, manual reporting, and legal paperwork — a slow, error-prone process that judges without technical training struggle to interpret.

## Problem Being Solved

Digital evidence in the Indian legal system frequently fails admissibility not due to authenticity issues, but due to procedural gaps: no cryptographic proof of integrity, no verifiable chain of custody, and missing legal certification. Pramaan directly targets this procedural failure point rather than the underlying forensic science, which is where most existing tools stop short.

## Summary

Pramaan turns any raw digital file into court-ready evidence in one click: it fingerprints the file cryptographically, extracts and analyzes its metadata, builds a tamper-evident chain of custody, scores its legal readiness, and generates a signed Section 63 certificate — all running entirely offline, in the browser, with no cloud dependency. This makes it usable in air-gapped forensic environments and by police units with no dedicated IT infrastructure.

---

## USP (Unique Selling Point)

- **Fully offline, zero-dependency architecture** — runs entirely client-side via the Web Crypto API; no server, database, or internet connection required after first load, making it deployable in air-gapped forensic labs and low-resource police units.
- **Genuinely blockchain-style chain of custody** — each custody event is a cryptographically hash-linked block (previous block hash + action + timestamp + evidence hash), giving real tamper-evidence without the cost or complexity of a distributed ledger.
- **Built directly around Indian law** — targets Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023 specifically, rather than generic forensic tooling adapted after the fact.
- **Dual-audience design** — a technical Investigator view and a plain-English Judge view, addressing the real-world gap where non-technical judges must interpret technical evidence.
- **Multi-agency ready** — case management scoped by police unit (Cyber Cell, District Police, State CID, CERT, etc.) with real access-control boundaries, not just cosmetic labels.

---

## Key Features

| Feature | What it does |
|---|---|
| Evidence fingerprinting | SHA-256 hash generated client-side on upload via the Web Crypto API |
| Metadata extraction | File type, size, and timestamps captured on intake |
| Tamper detection | Re-verification recomputes the hash and flags any mismatch instantly |
| Blockchain-style Chain of Custody | Every action (Uploaded → Hashed → Analyzed → Verified → Certified) stored as a hash-linked block; "Verify Chain Integrity" proves whether the record has been altered |
| Legal Readiness / Trust Score (0–100) | Weighted score combining hash integrity, metadata completeness, and custody chain validity |
| Section 63 Certificate Generator | One click generates a formatted, downloadable PDF certificate |
| Judge / Investigator toggle | Investigator view shows full technical detail; Judge view shows a plain-English explanation |
| Live Tamper Simulator | Demonstrates the system live — modifies evidence, shows hash and trust score change in real time |
| Multi-Agency Case Management | Cases tagged by police unit and incident type, shared evidence pipeline across agencies |
| Real EXIF metadata analysis | Camera metadata (Make, Model, GPS, capture date, editing-software tag) extracted and cross-checked for anomalies |
| Legal Compliance Checklist | Every evidence item scored against 8 procedural requirements with a Legal Readiness % |
| Full Case Report export | Bundles every evidence item's hash, score, anomalies, compliance results, and custody history into a single PDF |
| Case-wide unified timeline | Custody events from every evidence item merged into one chronological view |
| Backup / Restore | Downloads/reloads the entire case database as JSON, without relying on browser storage APIs |
| Multi-Agency Access Control | "Viewing as" selector scopes the dashboard to one unit's cases, or an Oversight view seeing all units |
| Incident Response Workflow | 5-stage response pipeline (Incident Reported → First Responder Assigned → Evidence Collected → Under Forensic Review → Case Closed) |

---

## Tech Stack

- **Frontend/App:** Single-page vanilla HTML + JavaScript (no build step, no framework)
- **Cryptography:** Browser-native Web Crypto API (`crypto.subtle.digest`, SHA-256)
- **PDF Certificate & Report Generation:** jsPDF (via CDN)
- **EXIF Metadata Extraction:** exif-js (via CDN)
- **Styling:** Custom CSS (navy `#01386A` / gold `#F5A623`), no external CSS framework
- **Data:** In-memory state, with manual Backup/Restore as a safety net
- **Deployment:** Netlify

---

## Platform Preview
Pramaan opens with an animated boot-sequence splash screen, followed by a Secure Access Terminal login gate, before revealing the dashboard. Screenshots of the platform (Dashboard, Evidence Detail, Compliance Checklist, Chain of Custody, Judge View, and the Section 63 Certificate output) are available in this repo as 01-dashboard.png through 06-section63-certificate.png, and are also embedded directly in Pramaan_Project_Documentation.docx in this same folder.
---


## Future Scope

- Persist data to a real database (SQLite/Postgres) instead of in-memory state
- Real EXIF/document metadata parsing extended to PDFs and DOCX
- Full case management system with role-based access per police unit
- Incident Response integration — direct evidence intake from a first-responder mobile app
- Optional offline AI explanation engine (local LLM) for richer plain-English summaries for judges

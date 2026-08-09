Pramaan (प्रमाण) — Digital Evidence Readiness & Admissibility Platform

Team Perihelion — HackMatrix Grand Finale (24-Hour Build)

"From Collection to Court — Every Byte Verified."

🌐 Live Demo: adorable-platypus-c56e82.netlify.app 🎥 Demo Video: Watch on Google Drive

## Team

| Name | Role |
|---|---|
| Nandika Yazhini A E | Team Leader |
| Thanishka S | Team Member |

## Problem Statement

Indian courts reject digital evidence in nearly 4 out of 10 cases — not because it's fake, but because investigators can't prove it wasn't altered. Missing cryptographic hashes, broken chains of custody, understaffed forensic labs, and missing Section 63 certificates (under the Bharatiya Sakshya Adhiniyam, 2023) cause strong cases to collapse on procedure rather than facts. Investigators today juggle disconnected tools, manual reporting, and legal paperwork — a slow, error-prone process that judges without technical training struggle to interpret.

## Our Solution

Pramaan turns any raw digital file into **court-ready evidence in one click**: it fingerprints the file cryptographically, extracts and analyzes its metadata, builds a tamper-evident chain of custody, scores its legal readiness, and generates a signed Section 63 certificate — all running **entirely offline, in the browser, with no cloud dependency**. This makes it usable in air-gapped forensic environments and by police units with no dedicated IT infrastructure.

## Core Features (implemented in this prototype)

| Feature | What it does |
|---|---|
| **Evidence fingerprinting** | SHA-256 hash generated client-side on upload via the Web Crypto API |
| **Metadata extraction** | File type, size, and timestamps captured on intake |
| **Tamper detection** | Re-verification recomputes the hash and flags any mismatch instantly |
| **Blockchain-style Chain of Custody** | Every action (Uploaded → Hashed → Analyzed → Verified → Certified) is stored as a hash-linked block, each block's hash derived from its own data *and* the previous block's hash — exactly like a blockchain ledger. A "Verify Chain Integrity" button recomputes every link and proves whether the custody record has been altered. |
| **Legal Readiness / Trust Score (0–100)** | Weighted score combining hash integrity, metadata completeness, and custody chain validity — shown as a Green/Yellow/Red badge |
| **Section 63 Certificate Generator** | One click generates a formatted, downloadable PDF certificate (case, hash, examiner, timestamps, and the legal certification statement) |
| **Judge / Investigator toggle** | Investigator view shows full technical detail; Judge view shows a plain-English explanation and a clear recommendation |
| **Live Tamper Simulator** | Demonstrates the system live — modifies the evidence, shows the hash and trust score change in real time |
| **Multi-Agency Case Management Platform** | Cases are tagged by Police Unit (Cyber Cell Chennai, District Police, State CID, CERT, etc.) and Incident Type, so multiple police units and agencies can operate on a shared evidence pipeline from one dashboard |
| **Incident-linked case intake** | Every case records an incident type and description, tying digital evidence directly to the incident it responds to |
| **Real EXIF metadata analysis** | For images, actual camera metadata (Make, Model, GPS, capture date, editing-software tag) is extracted via a dedicated EXIF Metadata Analysis panel, and cross-checked — missing EXIF or a detected editing tool (Photoshop, GIMP, etc.) is flagged as an anomaly |
| **Legal Compliance Checklist** | Every evidence item is scored against 8 procedural requirements (hash generated, custody chain complete and verified, certificate issued, etc.) with a Legal Readiness % — directly targets the "missing certificates / broken procedure" root cause from the problem statement |
| **Full Case Report export** | One click bundles every evidence item's hash, score, anomalies, compliance results, and full custody history into a single PDF for the whole case |
| **Case-wide unified timeline** | Custody events from every evidence item in a case are merged into one chronological timeline, so investigators can see the full sequence of actions across all evidence at once |
| **Backup / Restore** | "Backup Data" downloads the entire case database as JSON; "Restore" reloads it — a safety net against browser refresh during a live demo, without relying on browser storage APIs |
| **Secure Access Login Gate** | On launch (after the boot sequence), a "Secure Access Terminal" screen requires selecting a police unit and entering an access code before entering the platform — any code is accepted (it's a cosmetic access-control demo, not real backend authentication), and the selected unit becomes your scoped view immediately |
| **Multi-Agency Access Control** | A "Viewing as" selector in the nav bar (and the login screen) scopes the dashboard to one police unit's cases only, or an Oversight view (State CID, CERT) that sees every unit's cases — this is a real filtering boundary, not just a label, directly answering "how does one unit *not* see another's cases?" |
| **Case Status** | Every case carries a status — Open, Under Investigation, or Closed — editable from the case page and filterable on the dashboard |
| **Incident Response Workflow** | Each case tracks a 5-stage response pipeline (Incident Reported → First Responder Assigned → Evidence Collected → Under Forensic Review → Case Closed), advanced one stage at a time — this models the actual incident-handling process, not just an incident label |
| **Dashboard Search & Filter** | Search by case title/unit/incident type, and filter by status, layered on top of the unit-scoped access view |

## Why the "Chain of Custody" is genuinely blockchain-style

Each custody event is stored as a **block**: `hash = SHA256(previousBlockHash + action + timestamp + details + evidenceHashAtThatTime)`. This means:
- Blocks are cryptographically linked in sequence, exactly like a blockchain.
- If any historical entry is altered, its recomputed hash no longer matches what's stored, and every subsequent block becomes provably invalid.
- No external blockchain network, gas fees, or wallet is required — the tamper-evidence property comes from the hash chaining itself, which is the actual security property investigators need, without the deployment complexity a real distributed ledger would add in a 24-hour build.

## Reliability Note (why there's no browser storage)

This prototype deliberately avoids `localStorage`/`sessionStorage` — some sandboxed preview environments block them, which would silently break the app mid-demo. Instead, use the **Backup Data** / **Restore** buttons in the nav bar before your live demo: download a backup right before you go on stage, and if anything ever goes wrong (accidental refresh, browser crash), restore it in two clicks and keep going.

## Pre-Seeded Demo Cases

The app loads with 6 cases across 5 police units, each demonstrating a distinct, real detection scenario so every capability is visible the moment a judge opens it — no upload required to see the full range:

| Case | Detection demonstrated | Score |
|---|---|---|
| UPI Fraud Complaint #2026/114 | Baseline clean evidence — text log (limited metadata, expected) + fully-verified photo with intact EXIF | 90 / 100 (avg) |
| Warehouse Break-in — CCTV Footage #2026/098 | **Hash mismatch** — file content changed after intake | 40 / 100 |
| Cyberstalking Complaint #2026/077 | **Missing EXIF** — image re-compressed/forwarded, camera metadata stripped | 85 / 100 |
| Corporate Data Breach #2026/056 | **Editing software detected** — EXIF Software tag shows Adobe Photoshop | 80 / 100 |
| Insider Threat Investigation #2026/031 | **Chain broken** — a custody record was altered after the fact; click "Verify Chain Integrity" to see it fail live, with the exact step named | 0 / 100 |
| Cheque Fraud Case #2026/012 | **Combined anomalies** — hash mismatch and missing EXIF stacked on the same file, showing cumulative scoring | 35 / 100 |

This set gives you a live example of every anomaly type Pramaan detects, without needing to fabricate one during your demo.

## Visual Design

The interface uses a dark cyber-forensics identity — deep navy/black background, teal and amber accents, monospace type for hashes and data, a subtle grid texture, and glowing status indicators — built to read as a real forensic tool rather than a generic dashboard. On load, it opens with an animated boot-sequence splash screen (system initialization lines, progress bar, the Pramaan mark), then a **Secure Access Terminal** login gate — complete with a live matrix-style hex rain background, a scanning HUD overlay, and a pulsing badge icon — before revealing the authenticated dashboard. Every card carries subtle glowing corner brackets that light up on hover, evoking a forensic scan interface. Trust scores render as animated radial progress rings, custody events as a glowing connected timeline, and every page transition fades in smoothly.

**Honest scope note:** the login gate demonstrates the access-control *model* (unit-scoped visibility) — it accepts any access code and isn't backed by real authentication, session tokens, or a server. A production deployment would add real per-unit authentication; this shows what that would gate.

## Tech Stack

- **Frontend/App:** Single-page vanilla HTML + JavaScript (no build step, no framework — runs by opening one file, deploys anywhere as a static site)
- **Cryptography:** Browser-native Web Crypto API (`crypto.subtle.digest`, SHA-256)
- **PDF Certificate & Report Generation:** [jsPDF](https://github.com/parallax/jsPDF) (loaded via CDN)
- **EXIF Metadata Extraction:** [exif-js](https://github.com/exif-js/exif-js) (loaded via CDN)
- **Styling:** Custom CSS matching brand palette (navy `#01386A` / gold `#F5A623`), no external CSS framework — keeps the app fully offline-capable
- **Data:** In-memory state for the prototype (see "Next Steps" for persistence plan)

## Setup Instructions

No installation, dependencies, or build step required.

1. Clone this repository:
   ```
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
2. Open `index.html` directly in any modern browser (Chrome, Edge, or Firefox) — that's it. Everything (hashing, EXIF parsing, PDF generation) runs client-side; only three CDN-hosted libraries (jsPDF, exif-js, Google Fonts) load over the network, so an internet connection is needed on first load.
3. To deploy it as a live site: drag `index.html` into [Netlify Drop](https://app.netlify.com/drop) for an instant public URL, or enable **GitHub Pages** on this repo (Settings → Pages → Source: `main` branch, root folder).

## Demo Script (for the 2–3 minute walkthrough video)

1. Open the Dashboard — show two pre-loaded cases from different police units with different trust scores (one green, one red) to establish the multi-agency platform concept immediately.
2. Open the flagged case → open its evidence → show the red trust score and the "Re-Verified: hash mismatch" entry already in its chain of custody.
3. Go to the clean case → open its evidence → click **Simulate Tampering** live — show the hash change and the trust score drop in real time.
4. Click **Verify Chain Integrity** — show the cryptographic proof that the custody record is either intact or broken.
5. Toggle **Judge View** — show the plain-English explanation a non-technical judge would actually read.
6. Click **Generate Section 63 Certificate** — show the PDF downloading with the case, hash, and legal statement pre-filled.
7. Click **+ New Case** — create a case for a different police unit to show the platform supports multiple agencies on one shared system.
8. Upload a real photo from your phone/laptop — show the actual EXIF data (camera model, capture date) extracted live, and the Legal Compliance Checklist scoring it in real time.
9. On the Case Detail page, click **Export Full Case Report** to show the consolidated PDF, and scroll to the **Case-Wide Timeline** to show every evidence item's history merged into one view.

## Honest Scope Notes (say these plainly if asked)

- **The login screen is a visual access-control demo, not real security.** Any access code is accepted, and the unit selector on the dashboard nav still lets you switch views freely after logging in — there's no backend verifying identity. If a judge presses on this: *"This demonstrates the access-control model — production deployment would add real backend authentication per unit."* That's a normal, expected scope line for a 24-hour build; naming it plainly reads better than having it exposed as a surprise.
- **Trust scores and anomaly flags are investigative aids, not verdicts.** Pramaan surfaces evidence for a human to evaluate — it doesn't make legal determinations.
- **Data is in-memory** (with manual Backup/Restore as a safety net) — a real deployment would persist to a database.

## Repository Contents

| File | Purpose |
|---|---|
| `index.html` | The full working prototype — open this file or visit the live deployed link |
| `README.md` | This file |

## Next Steps (post-hackathon roadmap)

- Persist data to a real database (SQLite/Postgres) instead of in-memory state
- Real EXIF/document metadata parsing for images, PDFs, and DOCX
- Case Management System with role-based access per police unit
- Incident Response integration — direct evidence intake from first-responder mobile app
- Optional offline AI explanation engine (local LLM) for richer plain-English summaries

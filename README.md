# J & J Memorial e-Hospital — HIS / EMR & Hospital ERP Platform

**Version:** 1.0.0-staging  
**Branch:** `JJ-Memorial-staging`  
**Repository:** `https://github.com/totagits/JJ-Memorial-eHospital.git`  
**Proposed Staging Address:** `https://jjmemorial-staging.totag.network`  
**Proposed Production Address:** `https://jjmemorial.totag.network`  
**Technology Developer:** TOTAG IT Services / TOTAG GROUP OF COMPANIES LTD  

---

## Executive Overview

**J & J Memorial — Connected Care, Intelligent Operations** is an integrated healthcare platform delivering both:
1. **Public Hospital Web Experience & Patient Portal**: Patient self-service, online consultation bookings, electronic legal consents, Recharts vitals tracking, medication push reminders, downloadable intake forms, and real-time live chat with on-duty triage nurses.
2. **Behind-the-Website Enterprise HIS + EMR + Hospital ERP Workspace**: Clinical operations from OPD arrival through triage, medical encounters, diagnostic pathology, PACS/radiology image viewer, cold-chain blood banking, formulary inventory & barcode QR dispensing, billing receipts with specialized print layout, staff scheduling with collision detection, specialized resource allocation, and Recharts executive intelligence & payroll analytics.

---

## Master Requirements & Features Matrix

| # | Feature / Module | Scope | Implementation Details |
|---|------------------|-------|------------------------|
| **1** | **i18n Multi-Language Layer** | Core System | Global localization supporting **English**, **Liberian Kolokwa** (vernacular), **Kpelle**, and **Bassa**. Switcher accessible in top navigation. |
| **2** | **Patient Testimonials** | Public Website | Displays verified patient reviews, 5-star ratings, department badges, and clinical experiences. |
| **3** | **Digital Consent Forms** | Patient Portal | Cryptographic canvas signature pad + legal signer relationship, producing tamper-evident SHA-256 hashes and printable legal certificates. |
| **4** | **Blood Bank Management** | Staff Workspace | Tracks blood inventory across ABO/Rh groups (A+, A-, B+, B-, AB+, AB-, O+, O-), components (PRBC, Platelets, FFP), low stock thresholds (&lt;2 units), and donor histories. |
| **5** | **Patient Feedback Module** | Patient Portal | 5-star rating submission, department selection, improvement suggestions, and public consent toggle aggregated into Testimonials. |
| **6** | **Background Sync Service** | Architecture | Offline-first queue caching transactions during power/network dropouts, with automatic batch synchronization upon reconnection. |
| **7** | **Patient Vitals Tracker** | Patient Portal | Daily metric logging (BP, HR, weight, glucose, SPO2) visualized with **Recharts** longitudinal line charts and reference ranges. |
| **8** | **Global EMR Search Bar** | Staff Workspace | Instant patient lookup across MRN, name, and phone with keyboard navigation (`Ctrl+K`, arrows, Enter). |
| **9** | **Facility Locator** | Public Website | Branch locator for Congo Town, Sinkor, Paynesville, and Kakata, with interactive geo-grid map, operating hours, and dispatch hotlines. |
| **10** | **Downloadable Forms Library** | Patient Portal | Printable PDF templates for patient intake, medical records releases, surgical consents, and financial aid applications. |
| **11** | **Visual Care Calendar** | Patient Portal | Month-at-a-glance calendar aggregating doctor appointments, medication timings, and laboratory draw dates. |
| **12** | **Payroll Analytics Panel** | Staff ERP | Automated salary distributions, Liberian NASSCORP contributions (3%), and progressive income tax (PIT) withholdings with Recharts. |
| **13** | **Pharmacy Dashboard** | Staff Workspace | Pending prescription queues, formulary inventory levels with reorder thresholds, and dispenser audit log. |
| **14** | **Emergency Triage Queue** | Staff Workspace | Rapid vitals input (Temp, BP, Pulse, SPO2, Pain score) with urgency assignment (Red STAT, Yellow, Green) for OPD priority. |
| **15** | **Radiology & Medical Viewer** | Staff Workspace | Image attachment interface and built-in interactive viewer (zoom, invert bone/tissue contrast, rotate, brightness, radiologist sign-off). |
| **16** | **Executive Intelligence** | Staff Workspace | **Recharts** area & bar charts visualizing hospital revenue cycles, department billing trends, and monthly operational costs. |
| **17** | **Telehealth Module** | Patient Portal | Future video consultation slot calendar booking with confirmation, email reminders, and simulated WebRTC video room. |
| **18** | **Internal Secure Messaging** | Staff Workspace | Departmental clinical channels with desktop browser notifications and audible chimes for urgent communications. |
| **19** | **Resource Management** | Staff Workspace | Booking specialized equipment (Ultrasound, CT, MRI, Operating Theaters) with automated scheduling collision detection. |
| **20** | **Biometric Terminal Lock** | Staff Workspace | Web Authentication API (`navigator.credentials`) terminal lock with fingerprint/face ID authentication and emergency PIN fallback. |
| **21** | **Global Keyboard Shortcuts** | App Level | System-wide shortcuts (`Ctrl+K` for search, `Ctrl+Shift+S` for staff, `Ctrl+Shift+P` for patient portal, `Ctrl+Shift+L` to lock, `?` for cheatsheet). |
| **22** | **Specialized CSS Print Layout** | Billing / Cashier | Branded official receipts with hospital logo, itemized clinical charges, cashier signature line, and receipt QR verification. |
| **23** | **Hospital News & Alerts** | Public Website | Dynamic health bulletins, malaria advisories, and community outreach notices with full article reading modals. |
| **24** | **Frequently Asked Questions (FAQ)**| Public Website | Searchable accordion addressing registration, patient rights, insurance eligibility, and emergency ambulance dispatch. |
| **25** | **Patient Medical History** | Patient Portal | Longitudinal electronic health timeline of past hospital visits, diagnoses, prescriptions, and physical examination findings. |
| **26** | **Staff Duty Scheduling** | Staff Workspace | Shift roster creation for doctors and nurses with automated double-booking collision detection. |
| **27** | **Help & Onboarding Tutorial** | Patient Portal | Interactive 5-step guided overlay walking new users through bookings, medical records, vitals telemetry, and telehealth. |
| **28** | **Live Activity Feed** | Staff Workspace | Streaming real-time audit log of registrations, triage scorings, lab releases, and pharmacy fills. |
| **29** | **Secure Live Chat** | Patient Portal | Real-time chat with on-duty staff, typing indicators, and online status badges. |
| **30** | **Hospital Digital Signage** | Staff Workspace | Reception and waiting room TV monitor slide manager with calling token tickers and full-screen display mode. |
| **31** | **Laboratory Results Module** | Staff Workspace | Technician result entry, reference range comparison, critical value alerts, and automated patient portal notifications. |
| **32** | **Insurance Verification** | Staff Workspace | Real-time policy checking for NASSCORP, Sunu, Activa, and Cigna with deductibles and co-pay breakdowns. |
| **33** | **Medical Document Uploader** | Patient Portal | Encrypted personal health record vault for vaccination cards, past physician notes, and outside lab reports. |
| **34** | **Medication Reminders** | Patient Portal | Daily dosage schedule with adherence tracking and automated browser push notifications. |
| **35** | **Prescription QR Scanner** | Staff Workspace | Camera barcode/QR scanner allowing pharmacists to instantly scan and dispense prescriptions. |
| **36** | **Subtle Visual Sync Status** | Staff Workspace | Pulsing status indicator displaying connection state (Online, Offline, or Syncing background queue). |
| **37** | **Staff Directory** | Public Website | Verified directory of physicians, surgeons, pediatricians, and nurses with credentials and direct consultation booking. |
| **38** | **Partnerships Section** | Public Website | Accepted health insurance plans and medical affiliations (NASSCORP, Sunu, Activa, Ministry of Health). |
| **39** | **Vitest & React Testing Library** | Quality / CI | Comprehensive automated test suite ensuring system reliability during staging deployments. |
| **40** | **API Performance Monitoring** | Staff Workspace | In-memory APM wrapper measuring query latency, p95 tail latencies, and error rates to identify bottlenecks. |

---

## Technical Architecture

- **Frontend:** React 19, TypeScript, Vite 8
- **Styling & Print Engine:** Tailwind CSS with custom `@media print` layout for thermal/laser receipt printing
- **Data Visualization:** Recharts (Area charts, Bar charts, Line charts, Pie charts)
- **Icons & UI:** Lucide React
- **Testing Suite:** Vitest, React Testing Library, `@testing-library/jest-dom`, JSDOM
- **Security:** Web Authentication API (WebAuthn), SHA-256 HMAC receipt hashing, role-based access control (RBAC)
- **Resilience:** Background service queue with `navigator.onLine` listeners and localStorage persistence

---

## Development & Test Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## Deploying to Staging (`jjmemorial-staging.totag.network`)

The production build in `dist/` can be served directly using Nginx, Docker, or Coolify on the TOTAG VPS infrastructure:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

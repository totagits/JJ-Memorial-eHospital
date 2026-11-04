# J & J Memorial — Enterprise e-Hospital, EMR/HIS & ERP Master Development Prompt

**Version:** 1.0  
**Prepared:** November 3, 2026  
**Project:** J & J Memorial e-Hospital  
**Proposed production address:** `https://jjmemorial.totag.network`  
**Proposed staging address:** `https://jjmemorial-staging.totag.network`  
**Technology owner/developer:** TOTAG IT Services / TOTAG GROUP OF COMPANIES LTD  
**Status:** Implementation specification and instruction prompt; **not an assertion that anything has been deployed, connected, certified, or validated for live patient care.**

---

## MASTER INSTRUCTION — READ AND EXECUTE AS A SYSTEM BUILD, NOT A WEBSITE MOCKUP

Act as an integrated senior team consisting of a healthcare enterprise architect, licensed clinical informatics lead, hospital operations expert, financial systems architect, product designer, accessibility specialist, security/privacy engineer, database engineer, full-stack software engineers, DevOps/SRE engineer, QA automation lead, implementation/training lead, and Liberian localization specialist.

**Design, develop, test, document, and ultimately deploy a polished, enterprise-grade, production-oriented, integrated e-Hospital solution for J & J Memorial.** Deliver **both** (A) a beautiful public hospital website/patient-facing experience and (B) a comprehensive, secure, database-backed **Hospital Information System (HIS) + Electronic Medical Record (EMR/EHR) + Hospital Enterprise Resource Planning (ERP)** platform behind that website. Both sides must share a consistent master patient identity, organization directory, authorization model, service catalog, and governed integration layer without allowing the public site to expose protected internal data.

This is **not** merely a patient-registration application, an appointment website, an admin UI template, or a collection of superficial dashboards. It is a modern digital hospital operating environment that must support real work from arrival through care delivery, medication and investigations, billing and discharge, and from recruitment and procurement through accounting, inventory, assets, reporting, governance, and audit. Build real CRUD, validations, transactional services, migrations, durable persistence, rights enforcement, role-specific worklists, status transitions, notifications, reports, and accurate exports. Every module advertised as implemented must be demonstrably functional in a test environment.

Use realistic workflows but **never use real patient data in demos or nonproduction environments**. Do not invent details about the hospital's actual address, licensed departments, clinical specialties, leadership, contact numbers, accreditation, operating hours, patient fees, or affiliations. Use clearly marked placeholders and an administrative configuration workflow until verified by hospital management. Do not claim legal compliance or clinical certification without independent verification and approval.

### A. Product vision and design principles

Create **“J & J Memorial — Connected Care, Intelligent Operations”** as a configurable identity/tagline proposal, subject to hospital approval. Build an elegant, welcoming, trustworthy health-care website, joined to a rigorous enterprise digital back office. Goals: safer continuity of patient information, shorter administrative wait times, transparent financial control, reduced stockouts/wastage, coordinated care delivery, traceable decisions, accountable purchasing, measurable operational performance, and graceful operation through unreliable internet or electricity.

The design should feel like a modern top-tier hospital, not a generic Bootstrap admin panel: responsive desktop/tablet/mobile layouts, considered spacing and typography, strong contrast, calming healthcare color palette (proposed navy/deep teal/white with restrained gold or cyan accents), clear data density, visible statuses, keyboard navigation, accessibility, well-designed skeleton/loading/empty/error states, explanatory microcopy, excellent printable documents, and a cohesive design system. Provide 2–3 brand/visual directions for approval and choose a sensible default. Use authentic hospital-owned photos only with permission; otherwise use licensed imagery and obvious temporary placeholders. Optimize for slow connections, affordable Android devices, and busy clinical workstations. Target WCAG 2.2 AA for applicable user interfaces, with usability testing that includes actual hospital staff.

### B. Hosting, ownership, deployment boundaries

- Existing TOTAG infrastructure: Hostinger VPS (`KVM-2`, capacity to be verified), Coolify, PostgreSQL-based deployments, and GitHub source-control workflows. Existing workloads include Redeemer's International Academy, FDA MIS, and Gwoah's University: **do not modify, interrupt, share secrets with, or reuse their production databases**.
- Proposed GitHub repository: `totagits/JJ-Memorial-eHospital` (create only if authorized and available). Repository naming is a proposal, not an existing verified resource.
- Production DNS: `jjmemorial.totag.network`; staging DNS: `jjmemorial-staging.totag.network`. These are **proposed**, not active. Before adding DNS, verify exact VPS public IP and DNS zone ownership; never guess an address. Configure proper HTTPS certificates and redirect, security headers, and HTTP health checks. Never assume a production deployment succeeded merely because a build passed.
- Staging and production must have distinct Coolify applications, runtime environment variables, PostgreSQL databases, storage buckets/paths, authentication/session secrets, queues and webhook endpoints. Secure secrets in environment/secret management. No production PHI copied to staging; use synthetic data.
- Before any patient-data deployment, perform VPS resource sizing, host security review, backup-restore rehearsal, data residency/legal review, disaster recovery assessment, and clinical/governance approval. If a shared VPS cannot meet security/isolation/availability needs, recommend dedicated or appropriately managed hosting rather than compromising patient safety.
- CI/CD: GitHub branches/PR review, typecheck, lint, tests, migrations, static/dynamic security checks, dependency scanning, build, deploy to staging, acceptance, documented promotion approval for production, and rollback procedures. Zero or controlled downtime migrations; pre-migration backup; no destructive migrations without explicit approval.
- Domain must not be treated as proof of data security. Protect infrastructure, DNS, TLS, logs, databases and backups.

### C. Two-in-one website and portal architecture

#### 1. Public hospital website (professionally designed CMS-backed marketing and service site)
Implement:
1. Home page: visually striking accessible hero, clear patient-first headline, verified hospital identity, appointment CTA, find-a-doctor CTA, emergency contact CTA (only with real approved details), specialties and trust-building sections; no invented patient testimonials or credential badges.
2. About J & J Memorial: mission, vision, leadership, history, mission/values, accreditations only if verified; careers and community outreach.
3. Departments and services: admin-managed taxonomy; service pages with descriptions, doctor/department links, opening hours, eligibility and instructions where approved. Support expansion to general medicine, surgery, pediatrics, obstetrics/gynecology, emergency, diagnostics, etc. **Never claim a department exists unless confirmed.**
4. Find-a-doctor: verified staff profiles, specialty, credentials, schedule, availability policy, location, optional public appointment slots; provider approval for public display.
5. Book/Request Appointment: choose specialty/clinician/date, contact method, optional previsit instructions; server-side validation, booking conflict prevention, queue or pending-approval states, reminders, confirmation or decline, rescheduling and cancellation, consent/privacy notice. Never overpromise a slot until confirmed.
6. Patient portal entry: patient self-registration or verified invitation, profile, linked authorized dependents, appointments, approved visit summaries, clinician-released lab reports, prescriptions, payment balances/receipts, secure messages, consent and communication preferences; protect pediatric/dependent and proxy access rigorously.
7. Health resources and news: searchable CMS-managed articles, events, education, campaigns, FAQ, announcements, editorial review and moderation; **no general medical content presented as individual medical advice**.
8. Contact and directions: verified location map, approved hours, contact form, privacy-protective intake, phone/WhatsApp only after validation, emergency instructions with clear safety limitations.
9. Careers and recruitment: job listings and secure applicant intake integrated with HR, with consent, retention and separate applicant permissions.
10. Site-wide search, SEO metadata, multilingual-readiness, accessible forms, cookie/data notices where relevant, sitemap, 404/500 states, editable social links, menus, footers, colors, media and page builder/CMS. Public site must not leak internal patient, payroll or supplier records.

#### 2. Behind-the-website secure e-Hospital workspace
A public **Patient Portal** link is acceptable; the **Staff Workspace** can be reached through a protected, documented staff sign-in path such as `/staff/sign-in` and need not be prominently advertised. The real protection is identity verification, server-enforced authorization, HTTPS and audit logging—not hiding links. The authenticated workspaces must have dedicated role-aware menus, individual queues, notifications, top navigation, search, breadcrumbs, task actions, recent-work context and a consistent responsive sidebar.

**Minimum role-specific workspaces**: Executive/CEO, Hospital Administrator/COO, Medical Director, Head of Nursing, Physician/Clinician, Nurse, Triage, Registration/Front Desk, Appointments, Records/HIM, Ward/Inpatient, Emergency, Laboratory, Radiology/Imaging, Pharmacy, Billing/Cashier, Finance/Accountant, Procurement, Inventory/Stores, HR/Payroll, Biomedical/Assets, Facilities/Maintenance, Quality/Patient Safety, Internal Auditor, IT/Security Administrator, Patient, and authorized Parent/Guardian/Proxy. Implement real role-based/attribute-based policies, not a shared admin account. Some roles are optional until a hospital confirms the department exists.

### D. Core clinical HIS / EMR / EHR modules — operational, connected, clinically reviewed

#### D1. Master patient index, identity, registration and records
- Issue immutable, unique Medical Record Number (MRN) by configurable hospital policy. Link demographics, contact, next-of-kin, emergency contact, identity document where lawful, guardian/proxy authorization, language, insurance/payer, referrals, allergies and alerts.
- Duplicate detection with review/merge workflow, alias/history, never silent overwrites; special cases for unknown/unidentified patients and emergency registration. Log every merge.
- Patient photo and QR/barcode card optional; print labels and registration slips; registration/consent statuses; legacy paper record cross-reference.
- Patient is distinct from a visit/encounter/admission; preserve longitudinal history across encounters. Apply strict privacy policies to sensitive records and records of minors. Allow clinical correction by addendum/versioning, not unnoticed deletion.

#### D2. Scheduling, appointments, queue and front desk
- Physician and service schedules, clinic calendars, capacity, holidays, leave, appointment requests/confirmation, walk-ins, triage queues, check-in, referrals, cancellation/no-show tracking, waiting-time calculation, clear location routing and patient notifications.
- Configurable departmental queues; digital ticket/token optional; avoid accidental exposure of full patient names on public displays.

#### D3. Outpatient consultations (OPD) and longitudinal chart
- Per-encounter chart: chief complaint, HPI, history, vitals, allergies, medication reconciliation, clinical findings, differential/diagnosis, care plan, orders, procedures, follow-up, referrals, discharge instructions, provider sign-off and amendment trail.
- Document templates can be adjusted by department; structured fields and narrative notes. Longitudinal problem list, encounter timeline, prior results/medications, flags and clinical attachments with protected access.
- Clinician-only actions for diagnosis, prescribing and releasing results. Order sets and decision-support warnings only after locally qualified clinical review; no autonomous treatment advice or silent automatic prescription.

#### D4. Nursing, triage, emergency and critical care
- Triage assessment, observations/vital sign time series, acuity framework **approved by clinical leaders**, allergy/identity checks, urgent escalation, nursing notes, shift handovers, tasks, bedside medication administration capture, procedure checklist, incident/event tracking.
- Emergency walk-in/unknown patient path, resuscitation notes, transfer/referral, ambulance handoff and stabilized encounter movement. A digital system must not delay emergency care during outages; provide paper fallback and retrospective reconciliation.
- ICU/high-dependency care is modular and cannot be activated for actual clinical use without specialist validation.

#### D5. Inpatient admissions, beds, wards, discharge
- Admit/transfer/discharge (ADT), patient location tracking, ward/room/bed inventory, availability/cleaning/infection-control flags, attending team, daily nursing rounds, physician progress notes, care plans, dietary requests, medication administration records, consults, discharge summary and patient follow-up.
- Bed changes must preserve occupancy history; prevent double-booked beds; discharge coordinates clinical sign-off, pharmacy reconciliation and billing without allowing financial bureaucracy to prevent emergency care.

#### D6. Electronic orders, laboratory and specimen life cycle
- Clinician orders with clear priority, clinical indications where needed, order statuses and cancellation reasons. Lab accession numbers, collection labels, specimen collection/receipt/rejection, test panels, reference ranges, instrument/manual result entry, technician review, supervisory validation, abnormal/critical result escalation, report release and patient visibility controls.
- Order-to-result traceability, corrective amendments, audit, failed/partial tests, specimen recollection, reagent inventory consumption and billing hooks. Do not auto-interpret results as final medical diagnosis.

#### D7. Radiology and diagnostics
- Imaging requests, scheduling, procedure status, modality, reports, radiologist verification, critical result alerts and integration-ready DICOM/PACS references. **Do not implement a custom unsafe DICOM viewer in place of certified/suitable tools**; integrate via standards and validated products when available.

#### D8. Pharmacy and medication safety
- Formularies and configurable catalog, generic/brand mappings, prescription creation with physician authorization, allergy/interactions warnings only from verified clinical rules/content, pharmacist review, partial fill/substitution rules approved by pharmacists, dispense, returns, expiry and controlled-stock policies, lot/batch tracking, supplier recalls and patient medication histories.
- Strict separation of prescription from dispensing, and inventory on hand from dispensed stock; atomic stock decrement, negative-stock policy, barcode scanning optional, drug movement ledgers, two-person override for sensitive products when required.
- Medication administration records and inpatient medication charges coordinate with clinical and finance modules. No direct-to-patient auto-prescribing.

#### D9. Additional clinical service modules, capability-gated
Include extensible modules, configurable and **off by default unless the hospital actually operates the service**: operating theater/procedures, anesthesiology, maternal health/antenatal/labor/postnatal, pediatrics/immunization, blood bank/transfusion (high-assurance specialist workflows), dental, physiotherapy, dialysis, oncology, HIV/TB and other special programs, rehabilitation, telehealth, death/mortuary records. For each, first define clinical owners, safety cases, staff training, data/reporting requirements, and licensing; do not present generic scaffolds as clinically validated software.

#### D10. Referrals, records release, medical documentation
- Internal/external referrals and handoff status, summary exchange, letter templates, sick notes/medical certificates subject to clinical authorization, signed discharge summaries, scanning and indexing, versioned attachments, patient requests for records, consent and release approval workflows.
- Support controlled access to legacy paper indexes and import flags showing provenance/confidence. Never fabricate clinical events from incomplete historical records.

### E. The complete **enterprise Hospital ERP** — first-class, integrated and fully traceable

**Build ERP as an equal platform pillar to the EMR/HIS. Every clinical transaction with financial, stock, staff, or asset implications must connect through a well-governed integration contract, with auditable transactions and exception handling.**

#### E1. Finance & Accounting / revenue cycle
- Configurable chart of accounts, funds/cost centers/departments, fiscal periods, opening balances, journals and double-entry general ledger, posting rules, immutable posted entries and controlled reversals, trial balance, profit/loss or statement of activities, balance sheet, cash flow, budget-vs-actual, period close and audit adjustments.
- Charge master and service price lists with validity dates; billing from consultations, labs, imaging, admissions, procedures and pharmacy; itemized draft invoice, approval if needed, final posting, discounts/waivers with authorized reason, deposits/advances, installments, part payments, patient balances, refunds, credit notes, A/R aging, bad debt control and credit policy.
- Cashier workflows: day-opening float, cash/card/bank/mobile money channels (only when configured), printable branded receipt with unique number/QR verification, cash shifts, refunds, daily collections, handover, suspense/exception queue and segregation of duties.
- Insurance/third-party payer: member/coverage verification integration points, preauthorizations, claims, invoices, co-payments, insurer receivables, claim rejection/rework and remittances; rules configured by actual contracts, no fabricated integrations.
- Accounts Payable and Accounts Receivable, vendor invoices, approvals, payment batches, staff/employee advances and retirement, petty cash, bank statement import/matching, bank reconciliation, payment vouchers, cashbook, treasury dashboard, budgets and commitment control.
- Dual currency USD/LRD, explicit exchange rate source/date, settlement currency, local tax and statutory rules **configurable pending professional review**; no hardcoded tax or payroll rates. Preserve base and transaction currency amounts. Financial reporting denominators and currency conversions must be consistent.
- No clinician can silently edit posted invoices, and no cashier can approve their own unauthorized refund. Provide finance audit trails and reconciliations between encounter charges, invoices, payments, deposits, bank and GL.

#### E2. Human Resources, workforce management and payroll
- Organizational structure, establishments, approved positions, employee profiles, contracts, credentials/licensing (with expiry reminders), onboarding/offboarding, staff directory, confidential personnel file, credential verification, role provisioning approval, training/CME, leave, attendance and shift scheduling, overtime, night/on-call rosters, shift handover and staff allocation.
- Payroll preparation: pay periods, employee pay elements, allowances, deductions, loans, approved time entries, leave, overtime, payroll simulations, review and approval, bank/mobile-money disbursement export (no live transfer without authorized integration), employee payslip, payroll register, GL posting, statutory reports based on confirmed Liberian rules.
- Performance objectives and evaluation, discipline/grievance access control, hiring/applicant tracking, promotion/transfer, separation and equipment return. Biometric attendance only as an optional legally assessed integration with alternative attendance methods.

#### E3. Procurement, supplier and contract management
- Requisition → departmental approval → budget check/commitment → sourcing (RFQ/RFP/tender as appropriate) → supplier selection/evaluation → purchase order → goods receipt/service acceptance → three-way match with invoice → accounts payable → payment; exception handling, rejection/returns and variance approvals.
- Supplier onboarding/KYC, category, credentials, evaluations, price catalogs, procurement plans, contract register, renewal reminders, purchase ceilings, delegated approval matrix, bid documents and protected evaluation records. Follow applicable procurement rules depending on whether J & J Memorial is private/public, not assumed.

#### E4. Inventory, medical supplies, central stores and stock control
- Item/service master with units, conversions, reorder thresholds, supplier catalog, central store/department/pharmacy sublocations, purchase receipts, stock lots/batches and expiry dates, FEFO issue rules where appropriate, stock cards, adjustments, physical stocktake, issue/return/transfer, damaged/quarantine/recall handling, stock valuation, minimum/maximum stock, consumption forecasting and waste reports.
- Segregate clinical medication custody permissions, general supplies, lab reagents and consumables. Integrate procedure consumption and pharmacy dispensing to charge capture and GL/inventory accounting using reliable transactions.

#### E5. Fixed assets, biomedical engineering and facilities
- Asset register (building, generator, vehicles, medical equipment, IT, furniture), barcode/QR tag, assigned custodian and location, acquisition and disposal, depreciation methods, maintenance contracts, warranty and calibration logs, fault tickets, preventive maintenance schedules, certification and equipment status, repair cost tracking, maintenance approval and safe service withdrawal.
- Facility management: work orders, utility/fuel logs, generator uptime, sanitation/infection control checklists, housekeeping, housekeeping-dependent bed availability, waste management, safety inspections, ambulance fleet and travel logs where relevant.

#### E6. Hospital ancillary services and administration
- Optional kitchen/dietary/meal orders linked to inpatient restrictions and nutrition team, linen/laundry tracking, cleaning, ambulance dispatch (with patient confidentiality), visitor access, parking, facility booking, document/records management, executive correspondence, policy and SOP library, board/committee action items and departmental budgets.

#### E7. Quality, compliance, risk and internal audit
- Quality indicators, adverse events, patient safety incidents and near misses, protected reporting, investigation, CAPA/remediation, infection prevention surveillance tools, complaints/feedback, service turnaround times, mortality/morbidity reviews **with privacy safeguards**, clinical audit registers, policy versioning, legal holds, records retention, audit findings and action-tracking.
- Internal auditor read-only scoped access, immutable security/financial/procurement event histories, exception reports (duplicate patient records, override access, unapproved procurement, negative stock, high cancellation/refund rates, unreconciled cash, expiring drugs and staff credentials).

#### E8. Executive command center / business intelligence
- Role-aware dashboards: arrivals, registration/triage/consultation wait times, visit volumes and trends, inpatient census/occupancy, lab turnaround, pharmacy fill time, clinical follow-up queues, net revenue/collections/A/R aging, expenses, budgets, stockout and expiry risk, staff utilization and absenteeism, procurement cycle times, equipment downtime, patient satisfaction and quality indicators.
- Data quality provenance, time period and department filters, drill-down subject to permissions, clear denominator definitions, scheduled PDF/XLSX/CSV reports with secure delivery, saved reports and trend comparisons. For public health/MOH HMIS reporting, match **hospital-verified forms and data definitions**; support DHIS2 integration when a legitimate integration partner/API is available and approved. Use aggregates/anonymization whenever possible.

### F. Explicit end-to-end workflows to implement and prove

**Workflow 1 — Outpatient cash patient**: Online request/walk-in → identity match/new MRN → check-in/queue → triage and vitals → provider consultation and signed assessment → clinician orders labs/prescription → lab sample/result validation + pharmacist dispensing → itemized charges → payment/authorized credit workflow → receipt → patient-approved summary/appointment follow-up → accurate departmental and finance/stock reporting. The system must not require payment before life-saving emergency care.

**Workflow 2 — Inpatient**: Referral/OPD/emergency → admission authorization → bed allocation → nursing and medical rounds → medication administration/diagnostics/services → bed transfers and charges → clinician-approved discharge → billing/reconciliation → discharge summary and follow-up. Bed and ledger state must reconcile.

**Workflow 3 — Procurement-to-payment**: Reorder trigger or requisition → budget and approval → supplier/PO → goods receipt and lot/expiry capture → store stock → approved invoice/three-way match → payable/payment → GL entries → reconciliation and audit.

**Workflow 4 — Payroll-to-GL**: HR approved appointment → duty roster/attendance/leave/allowances → payroll draft → independent approval → approved payment export → payslip → GL posting → reconciliation. No employee sees another employee's compensation without authorization.

**Workflow 5 — Emergency/offline disruption**: Outage declared → approved paper/limited offline registration with unique downtime identifiers → priority care unaffected → return to service → controlled back-entry and duplicate reconciliation with signatures/provenance → incident report. Never overwrite conflicts blindly.

**Workflow 6 — Critical lab result**: Order → collection → verified result → configurable critical threshold flagged by qualified lab owner → actionable notification and acknowledgement by authorized clinician → timestamped escalation and closure, with backup pathway during downtime.

**Workflow 7 — Refund and reversal**: Posted charge/invoice → separate role submits documented adjustment → authorized approver → credit note/reversal and patient balance recalculation → proper GL trail → receipt and audit consistency.

**Workflow 8 — Patient proxy/dependent access**: Register lawful relationship and scope → verify identity/consent → patient/guardian access limited to released documents → revoke/expire delegation → audit every access. Age-of-majority and legal authority rules must be approved locally.

For every workflow, define swimlane states, transition guards, permission matrix, data changes, integration events, notification behavior, exception handling, reversal path, audit entries and automated acceptance tests.

### G. Enterprise roles and authorization contract

Use **deny by default** and **server-enforced** RBAC plus attribute-based policies using assigned hospital, department, treating relationship, sensitivity, duty status and purpose of access where applicable. Define permission sets for view/create/edit/sign/approve/release/export/delete(deletion normally prohibited)/override/break-glass. Offer a role-permission matrix and facility-specific role composer requiring approval. Examples:

- Registration can create demographics and encounters, not read full clinical notes or payroll.
- Physician can access authorized patient charts, write/sign assessments, order medicines/tests, not reconcile the bank.
- Nurse can chart assigned care and medication administration within privileges, not prescribe independently.
- Lab technician can process assigned samples; authorized reviewer releases validated results; cannot silently edit signed reports.
- Pharmacist reviews and dispenses approved prescriptions, controls pharmacy stock, not physician diagnosis.
- Cashier can receive approved payments, not approve own refunds or modify signed prescriptions.
- Finance can view billing/claims and accounting, not unrestricted psychotherapy/sensitive clinical notes.
- HR can access staff records, not patient treatment records.
- Admin IT manages configuration/identities but gets **no blanket clinical record access**; audited emergency access only through formal break-glass controls.
- Patient/proxy sees only verified records, consented care information, clinician-released results and bills.
- Auditor receives appropriately scoped read-only event/report access; protected audit events cannot be edited.

Strong authentication, MFA for privileged roles (prefer phishing-resistant options), session controls, secure invitation/onboarding, role approval, privileged action reauthentication, emergency access with reason/time-limited scope/alerts/post-hoc review, regular access recertification, immediate offboarding. No sample credentials or universal shared users in production.

### H. Technical architecture and implementation expectations

Use a maintainable **modular monolith first** with clear bounded domains, rather than unnecessary distributed microservices, while preserving clean APIs and eventual scaling. Preferred stack (alter only with clear technical justification and maintainability assessment):

- Frontend: TypeScript, Next.js/React, accessible component system, utility-first responsive styling, strong form validation and internationalization support.
- Backend: TypeScript NestJS or equivalent robust service/API framework, domain services, DTO validation, transaction-aware business rules, policy enforcement and generated API documentation. Do not implement clinical rules only in frontend code.
- Database: PostgreSQL, relational constraints and indexed keys, explicit migrations, unique IDs, soft archival/versioning where appropriate, immutable financial/audit ledgers, transactional outbox/idempotency keys for integration events.
- Background processing: Redis-backed queue (or equivalent) for reminders, report generation, notifications and noncritical async processes; dead-letter queue, retries, observability. Safety-critical workflows must have fail-safe fallbacks.
- Secure object storage with encryption, access control, antivirus/content scanning of uploads, signed limited-time download URLs, retention policies, verifiable integrity.
- Standards: design integration-ready FHIR R4 APIs/resources where appropriate (e.g., Patient, Encounter, Practitioner, Appointment, Observation, DiagnosticReport, ServiceRequest, MedicationRequest, MedicationDispense, AllergyIntolerance, Condition, Procedure, Coverage, Claim and AuditEvent); evaluate HL7 v2 lab messaging, DICOM/PACS and national reporting requirements as relevant. Model internal domains sensibly rather than assuming every table must be FHIR JSON.
- Clinical coding: terminology versioning and configuration; prefer WHO ICD-11 for new mappings while supporting mappings to locally required ICD-10, SNOMED CT/LOINC only where licensing and local standards permit; do not invent proprietary terminology rights.
- APIs: documented and versioned REST endpoints, OpenAPI, webhooks with signature verification, authentication scopes, pagination, idempotency and rate limits. Maintain automated contract tests. No unapproved PHI transfer to third parties.
- Internal integration/events: MRN→encounter→charge→invoice→payment→GL; order→specimen→result; prescription→dispense→inventory→charge; PO→GRN→inventory/AP; staff scheduling→payroll→GL. Use consistent stable identifiers and reconcile eventual inconsistencies.

#### Representative domain data model (create an ERD and migrations)
`Hospital/Facility`, `Department`, `Location/Ward/Room/Bed`, `Person`, `Patient`, `MRN`, `PatientAlias`, `GuardianRelationship`, `Consent`, `Employee`, `Practitioner`, `Credential`, `User`, `Role`, `Permission`, `Assignment`, `Appointment`, `QueueEntry`, `Encounter`, `Admission`, `TriageRecord`, `VitalObservation`, `ClinicalNote`, `Diagnosis/Problem`, `Allergy`, `Order`, `Specimen`, `LabTest`, `LabResult`, `DiagnosticReport`, `ImagingStudyReference`, `Prescription`, `MedicationAdministration`, `Dispense`, `DrugMaster`, `Batch/Lot`, `StockLedger`, `InventoryItem`, `StockLocation`, `Requisition`, `PurchaseOrder`, `GoodsReceipt`, `Supplier`, `SupplierInvoice`, `Contract`, `ServiceCatalog/ChargeMaster`, `Invoice`, `InvoiceLine`, `Payment`, `Refund/CreditNote`, `Payer/Coverage`, `Claim`, `ChartOfAccount`, `Journal/JournalLine`, `Budget`, `CostCenter`, `BankTransaction`, `Reconciliation`, `EmployeeContract`, `Shift/Attendance`, `Leave`, `PayrollRun/PayrollLine`, `Asset`, `MaintenanceWorkOrder`, `Incident`, `Notification`, `Attachment`, `AuditEvent`, `ExportJob`, `ConfigurationVersion`.

Specify relationships, unique constraints, fields, status machine, indexes, data provenance, field-level classification, consent rules, partitioning/archival if needed, concurrency strategy, migration/rollback and cross-module reconciliation. Do not seed production with fake encounters or financial figures.

### I. Security, privacy, clinical safety and regulatory review — non-negotiable

1. Treat health records as highly sensitive. Encryption in transit and at rest as configured, field-level protection as necessary, encrypted backups, least-privilege credentials, separate service accounts, MFA, secure password hashing, CSRF/XSS/injection protection, robust session/cookie settings, API access control, safe file handling, rate limiting, monitoring, secrets rotation and dependency scanning.
2. Design/test against OWASP ASVS 5.0.0 using a documented threat model and verification checklist. Perform an independent penetration test and remediation before production PHI onboarding. The absence of a known exploit is not evidence of safety.
3. Access- and change-audit events include user, facility, patient (when relevant), resource/action, time, reason, IP/session and context; tamper-evident/append-only storage with restricted access. Avoid including PHI and credentials in application/error logs or analytics.
4. Establish governance: clinical safety officer, medical director sign-off, pharmacy/laboratory SOP approval, privacy officer, data controller/processor agreements, cross-border storage analysis, data inventory, classification, breach-response playbook, backup/retention schedule and periodic review.
5. **Liberian legal and Ministry of Health validation is mandatory**: verify applicable privacy, health record retention, licensure, procurement, insurance, employment/payroll, tax, mobile-money and Ministry of Health HMIS/EMR requirements with current authoritative sources. Do not falsely claim that a specific draft data-protection bill is already law; record legal status and legal counsel review. Do not assume U.S. HIPAA applies to a Liberian hospital unless a specific contractual/jurisdictional basis exists. Use international guidance as design references, not as automatic certifications.
6. Provide safety analyses and high-risk control points for patient misidentification, medication errors, critical test alerts, wrong-patient results, unauthorized chart changes, downtime/duplicated records, and wrong-stock/expired medicine dispensing. Use clear clinical warnings; no autonomous diagnosis, final medication recommendation or silent AI clinical decisions.
7. All PHI use in AI assistants, external OCR, messaging, chatbots, transcription or third-party analytics is **disabled by default** until documented hospital consent, a privacy impact assessment and lawful supplier contracts. An AI FAQ may answer general public site questions without accessing patient data.
8. Public appointment and contact forms should collect minimal necessary data. Protect children and proxy relationships. Provide patient record corrections and access/release workflows as applicable, and distinguish correction from clinical-history deletion.

### J. Downtime, outages, paper-transition and resilience plan

Because electricity and connectivity may be unreliable, design a **tested continuity plan**: UPS/generator requirements, protected local network strategy, offline/manual paper packet templates, safe workflows for emergency/registration/order/sample/prescription/billing during outages, downtime-generated identifiers, resynchronization queue, duplicate/conflict detection, provenance and human reconciliation before records are finalized. If proposing offline electronic caching, limit PHI storage, encrypt devices, enforce device management and define which high-risk actions are expressly unavailable offline. Do not promise fully safe offline prescribing without validated design. RPO/RTO are to be agreed with the hospital based on risks. Perform backup/restore drills and downtime tabletop exercises.

Provide a structured legacy paper migration plan: inventory record types, scan/index with source and quality, authorized abstraction, patient matching, parallel-run strategy, integrity checks and signed migration acceptance; do not convert illegible records into imagined structured data.

### K. Messaging, payments and external integrations

- Appointment reminders, test-ready notifications, approved billing alerts and staff worklist alerts; user preferences, consent, retry/delivery status and templates. Prefer minimal sensitive content in SMS/WhatsApp/email (no diagnosis/results unless explicitly approved with robust delivery safeguards).
- MTN Mobile Money and other payment rails may be proposed, **not represented as live until merchant credentials and agreements are validated**. Payment processing must use server-side signed/verified callbacks, idempotency, settlement reconciliation, failure recovery, no storing of mobile money PINs or card credentials and clear invoice status. Support offline cash collection with controlled reconciliation.
- Resend/email service can be proposed for transactional mail, subject to domain verification. Integrate diagnostic equipment, LIS, PACS/DICOM, insurance, banking, SMS and DHIS2/HMIS via secure adapters only when available and approved.
- Build integration dashboard with connector status, mapping, retry controls, webhook audit and error queues, without exposing secrets.

### L. Product-ready and extensible design

Make J & J Memorial the **first isolated hospital installation** and architect for future lawful licensing to other hospitals: facility configuration, module feature flags, custom charges, departments, report definitions, branding, workflows and templates; optional multi-facility administration; strict tenancy/facility segregation including across searches, caches, jobs, storage, logs, exports and backups. Do **not** implement untested shared multi-tenant clinical databases just to advertise SaaS. Separate hospital data ownership from TOTAG software/IP contract terms; document export/exit, migration portability, API access and support SLAs. Include environment-specific licensing and support/maintenance documentation.

### M. User experience and operational quality gates

- Worklists should prioritize tasks requiring attention, overdue items, pending signatures/approvals, exceptions and clinical urgency—not generic tiles with numbers that cannot be traced to real transactions.
- Forms use sensible defaults, autosave only where safe, draft/sign separation, explicit irreversible action dialogs, undo/reversal mechanisms, keyboard shortcuts for frequent clinical tasks and clear timeline/event provenance.
- All filters/searches are scoped and indexed; large lists paginate. Every status badge must reflect persisted server state. Never claim `Complete` or remove a `Partial` label until acceptance criteria and role tests pass.
- Print and export: registration card, encounter summary, lab result, prescription, invoices/receipts, discharge papers, payroll slips, purchase orders, goods received note, asset tag, financial statements, HMIS reports—all with approved branding, unique document number and privacy-aware access control.
- Responsive PWA shell permitted for general access; handle session expiry and lost connectivity safely. Provide a secure navigation system across modules and user-specific dashboards.
- Every module includes role permissions, API, data model, UI, validations, empty/error/loading states, event audit, relevant reports and tests. No dead links, fake success notifications, static sample metrics mislabeled as live or client-side-only data storage.

### N. Required design and engineering deliverables

Deliver **actual project assets**, not a speculative description, organized and reviewed as follows:

1. Discovery and assumptions register: verified facts vs unverified hospital policies, department inventory, safety owners, legal concerns, scope and dependencies.
2. Product Requirements Document (PRD), system context diagram, hospital operating model, user personas, department/service catalog, complete public sitemap and portal navigation.
3. Clinical and ERP process swimlanes, end-to-end workflow state machines, role/permission and segregation-of-duties matrix, detailed user stories and acceptance criteria, integration contracts.
4. Visual design system, public website wireframes/high-fidelity screens, responsive dashboards for every key role, design tokens, components, accessibility tests.
5. Architecture decision records, threat model, privacy/security risk assessment, data residency assessment, FHIR/interface approach, ERD, database migration plan, OpenAPI specs, reporting dictionary and financial posting rules.
6. Working source repository with developer README, environment variable example (no secrets), safe setup scripts, service health checks, test/demo seed data **synthetic only**, container/Docker/Coolify configuration and CI/CD.
7. Functional website CMS + role-restricted HIS/EMR + ERP modules with real persisted data and cross-module transactions.
8. Automated unit, integration, permission, end-to-end and regression tests; multiuser concurrency tests, ledger integrity tests, patient identity tests, backup restore evidence, accessibility/security performance reports.
9. Deployment runbooks for staging/production, DNS/TLS, secrets, object storage, monitoring, backups/restore, maintenance windows, rollback, operational ownership and on-call support.
10. Clinical validation plan and signed department SOP approvals, training videos/manuals, super-user coaching, practice exercises, downtime drill, go-live checklist and hypercare support schedule.
11. Product backlog prioritized by risk and value, with honest status: `Not started`, `In progress`, `Ready for UAT`, `Clinically approved`, `Production-ready`, and `Deployed` (do not imply actual regulatory certification).

### O. Delivery phases — build a real foundation before expanding

**Phase 0 — Discovery, legal/clinical governance and infrastructure audit**: confirm J & J Memorial's actual departments, staffing, service catalog, billing policies, approval rules, cash controls, records ownership, retention and network/power conditions; assess Hostinger VPS suitability; define clinical safety gates. Deliver assumptions, PRD, ERD, architecture, acceptance matrix and staged release plan.

**Phase 1 — Website + secure identity + hospital master data + ERP foundations**: public polished site/CMS, appointment request, patient portal skeleton with secure access, facility/departments/services, identity/RBAC/MFA, audit, registration/MRN, queues, chart of accounts, service/charge catalog, general ledger primitives, cost centers, document/receipt templates, approval engine, reporting core and shared notifications. Distinguish usable scope from demo-only placeholders.

**Phase 2 — Operational OPD + finance + pharmacy/lab + core ERP**: end-to-end outpatient record and signed encounters; lab orders/worklists/results, prescription/pharmacist dispense, billing/payment/receipt/GL integration, supplier onboarding, purchasing, stocks/batches and physical stock ledger, clinical/financial dashboards. Test the complete cash/insurance/supply workflow with synthetic cases. Obtain clinician/lab/pharmacy/finance UAT before go-live.

**Phase 3 — Inpatient, HR/payroll and full back office**: ADT/ward/bed management, inpatient medications/charges/discharge, HR/shift/attendance/payroll, bank reconciliation, budgets and AP/AR, advanced purchasing/contracts, assets/maintenance, quality and audit reports. Complete cross-module month-end simulation.

**Phase 4 — Advanced clinical services & interoperability**: radiology/PACS integrations, high-risk departmental modules only with specialist validation, payer integrations, HMIS/DHIS2 reporting, FHIR exchange, advanced analytics and possible mobile-money live integration. No activation absent signed clinical and legal approvals.

**Phase 5 — Production readiness and controlled go-live**: restore tests, load and security testing, complete training, approved downtime plan, clinician sign-off, realistic parallel run, least-privilege staff accounts, controlled phased department launch, monitored incident response, and formal acceptance.

At the end of each phase provide: deployed staging URL if provisioned, GitHub commit/PR link, screenshots or reproducible test evidence, migration status, test pass/fail counts, exact features working, known issues, clinician approvals needed, and next safe deployment actions. **Do not falsely state something is deployed or tested.**

### P. Mandatory test/acceptance gates

At minimum, demonstrate automated and witnessed acceptance of these cases using synthetic data:

1. Duplicate-registration candidate is detected and safely resolved without chart loss.
2. Two users cannot book the same strictly single-capacity appointment/bed at the same time.
3. Unprivileged registration staff cannot retrieve an unrelated patient's clinical notes through either UI or direct API.
4. A nurse cannot sign a physician prescription using a crafted API request.
5. Medication dispense updates exact batch stock; insufficient/quarantined/expired stock is blocked according to approved clinical policy; transactions are recoverable from errors.
6. A signed lab report becomes patient-visible only following authorized release; critical result escalation is logged.
7. Cash payment, part payment, authorized refund and receipt produce reconciled invoice, patient ledger, cashier, bank/cashbook and GL balances.
8. Procurement receipt updates stock and accounts payable only through valid approved states; unauthorized invoice edit fails.
9. Payroll is invisible to unauthorized users, requires independent approval and posts balanced journal entries.
10. Concurrent staff work does not double-post payment, double-dispense, create duplicate MRN or generate two official receipt numbers.
11. Export, print, notifications and public search cannot leak PHI across roles, patients or facilities.
12. Backup restoration produces a working isolated recovered system, with timed evidence and integrity checks; downtime back-entry retains source/provenance.
13. Statuses and dashboards agree with the database and ledger; a test survives browser refresh, process restart and application redeployment.
14. A clinical safety officer approves medication, critical-alert, triage and downtime workflows before these features can be used in live care.
15. All public pages and authenticated critical workflows pass agreed mobile responsiveness, accessibility and baseline performance/security checks.

Adopt explicit severity thresholds and block live deployment on unresolved critical/high security, privacy, medication-safety, patient-identity, financial-integrity or data-loss defects. Provide manual UAT checklists with accountable approvers.

### Q. Product development operating rules for the AI/development team

- **Implement, do not merely describe.** Begin by auditing existing repo/infrastructure if access is actually available, then create a repository and working vertical slice in staging. If access is unavailable, produce locally reproducible source code and exact deployment runbook; state the access limitations accurately.
- Do not stop after writing UI markup or a landing page. Each delivered vertical slice must run with a real database, authorization, business logic, tests and validated outputs. Show code changes, migration files and what was verified.
- Protect all existing TOTAG deployments. Never change host DNS, ports, reverse proxy, database roles, firewalls or secrets for unrelated services. Perform sizing first; propose a separate VPS/managed hospital environment if necessary.
- Keep clinical safety input explicit; **do not substitute AI or general developer judgment for licensed clinicians**, pharmacists, lab directors, privacy/legal counsel or hospital management.
- Use no mock financial balances/patient lists in production. Demo mode must display a prominent synthetic-data banner and be isolated from live services.
- Implement permissions on the server, not only hidden frontend buttons. Reject unauthorized direct requests with meaningful errors and audit events.
- Use tests to drive fixes, avoid endless manual click-through loops, and report root causes when a test fails.
- Never ask the hospital to share raw production database credentials, patient records or encryption keys in chat. Use designated secret-management/admin setup paths.
- All releases require working rollback, reproducible migrations, backups and completion evidence.
- Where information is unknown, choose safe configurable defaults and mark `REQUIRES HOSPITAL CONFIRMATION`; do not fabricate.

### R. First execution response required from the implementing agent

Respond in this sequence:

1. **Product scope confirmation:** explicitly confirm this comprises a public website + patient portal + HIS/EMR + **full enterprise ERP**, not only appointment/clinical screens.
2. **Assumptions and clinical blockers:** list only truly decision-critical facts requiring hospital leadership/medical/legal confirmation; proceed with nonclinical scaffolding using placeholders.
3. **Reference architecture:** services, domain boundaries, PostgreSQL, role enforcement, audit, backups, staging/prod separation, and capacity constraints on existing Hostinger VPS.
4. **Detailed development backlog:** priority/risk/complexity/acceptance matrix for modules and cross-module workflows.
5. **Public site and portal sitemap:** navigation for patients and every staff group, plus sample polished design concepts.
6. **Data model and migration plan:** show initial master-patient, encounter, user-role, services, finance and inventory entities and key safety constraints.
7. **Concrete first vertical slice:** create working application code (if tools permit) for public home/CMS + secure authentication + facility config + registration/unique MRN + queue + services/charges + draft invoice + basic journal + auditing, with migrations/tests. Identify any workflows intentionally blocked pending clinical approval.
8. **Verification evidence:** actual commands/tests run and results; distinguish planned from accomplished actions.
9. **Deployment pathway:** GitHub repository, protected staging configuration and planned subdomains, with explicit steps/approvals before touching live DNS or patient data.
10. **Next phase:** choose the highest-value safe fully testable workflow; do not declare the entire e-Hospital product production-ready prematurely.

### S. Definition of finished product

J & J Memorial e-Hospital is considered finished only when an authorized patient can securely schedule and view permitted care records, staff can safely register/triage/treat/order/dispense/document/discharge within approved clinical workflows, all charges and payments reconcile to accounting, procurement and inventory connect to stock and finance, HR/payroll/asset/quality and management reports operate in real persistently stored data, permissions and audit are independently verified, backups/downtime recovery work, clinicians approve safety-critical workflows, hospital administration accepts the system, and production deployment is confirmed with evidence.

**End of master development prompt.**

---

## Supporting authoritative references for the implementation team

These sources inform design and review requirements; they do not establish that J & J Memorial is compliant or that any particular legal obligation applies without legal review.

- [HL7 FHIR R4 — official standard](https://hl7.org/fhir/R4/) — clinical interoperability, resources and security terminology.
- [WHO Digital Implementation Investment Guide](https://www.who.int/publications-detail-redirect/9789240010567) — user-centered planning, health-system alignment, costing and implementation.
- [WHO ICD classification](https://www.who.int/standards/classifications/classification-of-diseases) — classification and coding governance.
- [OWASP ASVS 5.0](https://asvs.owasp.org/) — web/API security verification requirements.
- [Liberia Ministry of Health — policy documents](https://moh.gov.lr/documents/policy-documents/) — review applicable quality and HMIS reporting requirements.
- [Liberia Ministry of Health — bids and digital health activities](https://moh.gov.lr/tender-bid/) — verify current national EMR/HMIS context.
- [ONC SAFER Guides — Implementing Health IT](https://healthit.gov/clinical-quality-and-safety/safer-guides/implementing-health-it/) — clinician involvement and downtime/contingency planning.

## Notes for reuse

Copy everything between **MASTER INSTRUCTION** and **End of master development prompt** into your AI development agent. Keep this file as the single source of scope. Ask the agent to create a tracked backlog, implement in verified milestones, and report evidence of working code rather than broad claims. No credentials, hospital patient records or hidden signing keys should be pasted into a prompt.

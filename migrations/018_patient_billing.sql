CREATE TABLE staging_invoices (
  id uuid PRIMARY KEY,
  patient_mrn uuid NOT NULL REFERENCES registry_patients(mrn),
  currency text NOT NULL CHECK (currency IN ('USD', 'LRD')),
  description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 240),
  amount_minor integer NOT NULL CHECK (amount_minor > 0),
  issued_by text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX staging_invoices_patient_date ON staging_invoices (patient_mrn, issued_at DESC, id);
CREATE TABLE staging_receipts (
  id uuid PRIMARY KEY,
  invoice_id uuid NOT NULL UNIQUE REFERENCES staging_invoices(id),
  recorded_by text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE registry_staff DROP CONSTRAINT registry_staff_role_check;
ALTER TABLE registry_staff ADD CHECK (role IN ('registrar','viewer','restricted','triage','clinician','nurse','lab_technician','lab_reviewer','pharmacist','super_admin','cashier'));

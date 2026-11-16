ALTER TABLE scheduled_visits DROP CONSTRAINT scheduled_visits_status_check;
ALTER TABLE scheduled_visits ADD CHECK (status IN ('scheduled','waiting_for_triage','triaged','completed','cancelled'));
ALTER TABLE scheduled_visits DROP CONSTRAINT scheduled_visits_slot_id_key;
CREATE UNIQUE INDEX scheduled_visits_active_slot ON scheduled_visits(slot_id) WHERE status <> 'cancelled';

CREATE TABLE appointment_changes (
  id uuid PRIMARY KEY,
  visit_id uuid NOT NULL REFERENCES scheduled_visits(id),
  kind text NOT NULL CHECK (kind IN ('cancel','reschedule')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  requested_by text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  original_slot_id uuid NOT NULL REFERENCES clinician_slots(id),
  replacement_slot_id uuid REFERENCES clinician_slots(id),
  decided_by text,
  decided_at timestamptz
);
CREATE UNIQUE INDEX appointment_changes_one_pending ON appointment_changes(visit_id) WHERE status='pending';

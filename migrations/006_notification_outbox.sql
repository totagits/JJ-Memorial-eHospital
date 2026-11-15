CREATE TABLE patient_notification_outbox (
  visit_id uuid NOT NULL REFERENCES scheduled_visits(id),
  event_type text NOT NULL CHECK (event_type = 'visit_scheduled'),
  channel text NOT NULL CHECK (channel = 'sms'),
  delivery_status text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending','sent','failed')),
  queued_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (visit_id,event_type,channel)
);

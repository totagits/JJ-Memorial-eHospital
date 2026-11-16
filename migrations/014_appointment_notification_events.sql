ALTER TABLE patient_notification_outbox DROP CONSTRAINT patient_notification_outbox_pkey;
ALTER TABLE patient_notification_outbox DROP CONSTRAINT patient_notification_outbox_event_type_check;
ALTER TABLE patient_notification_outbox DROP CONSTRAINT patient_notification_outbox_delivery_status_check;
ALTER TABLE patient_notification_outbox
  ADD COLUMN id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ADD COLUMN change_id uuid REFERENCES appointment_changes(id),
  ADD COLUMN slot_id uuid REFERENCES clinician_slots(id),
  ADD CHECK (event_type IN ('visit_scheduled','visit_rescheduled','visit_cancelled')),
  ADD CHECK (delivery_status IN ('pending','sent','failed','superseded')),
  ADD CHECK ((event_type='visit_scheduled') = (change_id IS NULL));

UPDATE patient_notification_outbox n SET
  slot_id=COALESCE(
    (SELECT c.original_slot_id FROM appointment_changes c WHERE c.visit_id=n.visit_id ORDER BY c.requested_at,c.id LIMIT 1),
    v.slot_id
  ),
  delivery_status=CASE WHEN n.delivery_status='pending' AND EXISTS (
    SELECT 1 FROM appointment_changes c WHERE c.visit_id=n.visit_id AND c.status='approved'
  ) THEN 'superseded' ELSE n.delivery_status END
FROM scheduled_visits v WHERE v.id=n.visit_id;

ALTER TABLE patient_notification_outbox ALTER COLUMN slot_id SET NOT NULL;
CREATE UNIQUE INDEX notification_initial_event ON patient_notification_outbox(visit_id,channel) WHERE change_id IS NULL;
CREATE UNIQUE INDEX notification_change_event ON patient_notification_outbox(change_id,channel) WHERE change_id IS NOT NULL;
CREATE INDEX notification_queue_recent ON patient_notification_outbox(queued_at DESC,id DESC);

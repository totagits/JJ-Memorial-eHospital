CREATE TABLE patient_lab_releases (
  work_id uuid PRIMARY KEY REFERENCES department_work_items(id),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 1500),
  released_by text NOT NULL,
  released_at timestamptz NOT NULL DEFAULT now()
);

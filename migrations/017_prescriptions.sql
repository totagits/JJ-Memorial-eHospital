CREATE TABLE encounter_prescriptions (
  work_id uuid PRIMARY KEY REFERENCES department_work_items(id),
  medication text NOT NULL CHECK (char_length(btrim(medication)) BETWEEN 1 AND 160),
  directions text NOT NULL CHECK (char_length(btrim(directions)) BETWEEN 1 AND 500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dispensed','clarification'))
);

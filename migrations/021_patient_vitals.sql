CREATE TABLE patient_vital_readings (
  work_id uuid PRIMARY KEY REFERENCES department_work_items(id),
  temperature_c numeric(4,1) NOT NULL CHECK (temperature_c BETWEEN 20 AND 50),
  pulse_bpm smallint NOT NULL CHECK (pulse_bpm BETWEEN 1 AND 350),
  recorded_by text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

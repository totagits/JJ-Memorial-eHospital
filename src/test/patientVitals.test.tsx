import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PatientVitalsTracker } from '../components/patient/PatientVitalsTracker';

describe('Patient Vitals Tracker & Recharts Component', () => {
  it('renders vitals tracking dashboard with baseline blood pressure and telemetry', () => {
    render(<PatientVitalsTracker patientId="pat-1" />);
    expect(screen.getByText(/Patient Vitals Tracker/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Blood Pressure/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Resting Heart Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Longitudinal Health Trend Analysis/i)).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TriageQueue } from '../components/staff/TriageQueue';
import { dbStore } from '../services/dbStore';

describe('OPD Emergency Triage Module', () => {
  it('renders triage queues with emergency Red urgency indicators', () => {
    render(<TriageQueue />);
    expect(screen.getByText(/Emergency Triage Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Active Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency \(Red\)/i)).toBeInTheDocument();
  });

  it('allows inputting new patient vitals and priority ranking', async () => {
    render(<TriageQueue />);
    const toggleBtn = screen.getByText(/Input Patient Vitals & Acuity/i);
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Patient Vitals Intake & Acuity Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Assigned Triage Urgency Level/i)).toBeInTheDocument();
  });
});

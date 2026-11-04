import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DigitalConsent } from '../components/patient/DigitalConsent';

describe('Digital Consent Electronic Signature Component', () => {
  it('renders consent document selector and electronic signature canvas pad', () => {
    render(
      <DigitalConsent
        patientId="pat-1"
        patientName="Korto Kollie"
        mrn="JJM-2026-0042"
      />
    );
    expect(screen.getByText(/Digital Medical Consent/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Consent Document to Execute/i)).toBeInTheDocument();
    expect(screen.getByText(/Electronic Signature Pad/i)).toBeInTheDocument();
    expect(screen.getByText(/Securely Sign & Save/i)).toBeInTheDocument();
  });
});

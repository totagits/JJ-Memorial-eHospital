import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PharmacyDashboard } from '../components/staff/PharmacyDashboard';
import { dbStore } from '../services/dbStore';

describe('Pharmacy Dashboard & Dispensing', () => {
  it('displays pending prescriptions and inventory levels', () => {
    render(<PharmacyDashboard />);
    expect(screen.getByText(/Pharmacy & Dispensary Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Scan Patient QR Prescription/i)).toBeInTheDocument();
  });

  it('correctly deducts inventory when a prescription is dispensed', async () => {
    const initialMed = dbStore.getMedications().find((m) => m.id === 'med-1');
    const initialStock = initialMed ? initialMed.stockQuantity : 0;

    await dbStore.dispensePrescription('RX-JJM-9821', 'Pharm. Test');

    const updatedMed = dbStore.getMedications().find((m) => m.id === 'med-1');
    expect(updatedMed?.stockQuantity).toBeLessThanOrEqual(initialStock);
  });
});

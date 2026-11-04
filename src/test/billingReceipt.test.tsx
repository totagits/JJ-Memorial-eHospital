import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BillingInvoicingModule } from '../components/staff/BillingInvoicingModule';

describe('Billing & Invoicing Official Receipt Module', () => {
  it('renders official receipt and itemized billing ledger', () => {
    render(<BillingInvoicingModule />);
    expect(screen.getByText(/Billing & Official Receipt Generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Print Official Receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/Itemized Hospital Services & Medications/i)).toBeInTheDocument();
  });
});

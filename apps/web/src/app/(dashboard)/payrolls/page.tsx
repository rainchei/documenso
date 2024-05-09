import React from 'react';

import type { Metadata } from 'next';

import { PayrollsPageView } from './payrolls-page-view';

export const metadata: Metadata = {
  title: 'Payrolls',
};

export default function PayrollsPage() {
  return <PayrollsPageView />;
}

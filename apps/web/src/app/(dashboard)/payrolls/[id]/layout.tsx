import React from 'react';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ChevronLeft, CircleDollarSign } from 'lucide-react';

import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { formatPayrollsPath } from '@documenso/lib/utils/teams';

import { PayrollType } from '~/components/formatter/payroll-type';

export type PayrollLayoutProps = {
  params: {
    id: string;
  };
  children: React.ReactNode;
};

export default async function PayrollLayout({ params, children }: PayrollLayoutProps) {
  const { id } = params;

  const payrollId = Number(id);
  const payrollRootPath = formatPayrollsPath();

  if (!payrollId || Number.isNaN(payrollId)) {
    redirect(payrollRootPath);
  }

  const { user } = await getRequiredServerComponentSession();

  const payroll = await getPayrollById({
    id: payrollId,
    userId: user.id,
  }).catch(() => null);

  if (!payroll) {
    redirect(`${payrollRootPath}`);
  }

  const isOwner = payroll?.ownerUserId === user.id;

  if (!isOwner) {
    redirect(`${payrollRootPath}`);
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-8">
      <Link href="/payrolls" className="flex items-center text-[#7AC455] hover:opacity-80">
        <ChevronLeft className="mr-2 inline-block h-5 w-5" />
        Payrolls
      </Link>

      <h1 className="mt-4 truncate text-2xl font-semibold md:text-3xl" title={payroll.title}>
        {payroll.title}
      </h1>

      <div className="mt-2.5 flex items-center gap-x-6">
        <div className="text-muted-foreground flex items-center">
          <CircleDollarSign className="mr-2 inline-block h-4 w-4" />
          {payroll.currency}
        </div>

        <PayrollType inheritColor type={payroll.type} className="text-muted-foreground" />
      </div>

      <div>{children}</div>
    </div>
  );
}

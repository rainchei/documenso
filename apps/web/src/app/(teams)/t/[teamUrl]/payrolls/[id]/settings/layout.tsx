import React from 'react';

import { redirect } from 'next/navigation';

import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { getTeamByUrl } from '@documenso/lib/server-only/team/get-team';
import { formatPayrollsPath } from '@documenso/lib/utils/teams';

import { DesktopNav } from '~/components/(payrolls)/settings/layout/desktop-nav';
import { MobileNav } from '~/components/(payrolls)/settings/layout/mobile-nav';

export type TeamPayrollSettingsLayoutProps = {
  params: {
    id: string;
    teamUrl: string;
  };
  children: React.ReactNode;
};

export default async function TeamPayrollSettingsLayout({
  params,
  children,
}: TeamPayrollSettingsLayoutProps) {
  const { id, teamUrl } = params;

  const payrollId = Number(id);
  const payrollRootPath = formatPayrollsPath(teamUrl);

  const { user } = await getRequiredServerComponentSession();
  const team = await getTeamByUrl({ userId: user.id, teamUrl });

  const payroll = await getPayrollById({
    id: payrollId,
    userId: user.id,
  }).catch(() => null);

  if (!payroll) {
    redirect(`${payrollRootPath}/${payrollId}`);
  }

  const isOwnerTeamMember = payroll?.ownerTeamId === team.id;

  if (!isOwnerTeamMember) {
    redirect(`${payrollRootPath}/${payrollId}`);
  }

  return (
    <div className="mt-4 grid grid-cols-12 gap-x-8 md:mt-8">
      <DesktopNav params={params} className="hidden md:col-span-3 md:flex" />
      <MobileNav params={params} className="col-span-12 mb-8 md:hidden" />

      <div className="col-span-12 md:col-span-9">{children}</div>
    </div>
  );
}

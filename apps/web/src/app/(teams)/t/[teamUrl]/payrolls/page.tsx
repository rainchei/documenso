import React from 'react';

import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getTeamByUrl } from '@documenso/lib/server-only/team/get-team';

import { PayrollsPageView } from '~/app/(dashboard)/payrolls/payrolls-page-view';

type TeamPayrollsPageProps = {
  params: {
    teamUrl: string;
  };
};

export default async function TeamPayrollsPage({ params }: TeamPayrollsPageProps) {
  const { teamUrl } = params;

  const { user } = await getRequiredServerComponentSession();
  const team = await getTeamByUrl({ userId: user.id, teamUrl });

  return <PayrollsPageView team={team} />;
}

import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { getTeamByUrl } from '@documenso/lib/server-only/team/get-team';

import { SettingsHeader } from '~/components/(dashboard)/settings/layout/header';
import { InvitePayeeDialog } from '~/components/(payrolls)/dialogs/invite-payee-dialog';
import { PayeePageDataTable } from '~/components/(payrolls)/tables/payee-page-data-table';

export type TeamPayrollSettingsPayeesPageProps = {
  params: {
    id: string;
    teamUrl: string;
  };
};

export default async function TeamPayrollsSettingsPayeesPage({
  params,
}: TeamPayrollSettingsPayeesPageProps) {
  const { id, teamUrl } = params;
  const payrollId = Number(id);

  const { user } = await getRequiredServerComponentSession();
  const team = await getTeamByUrl({ userId: user.id, teamUrl });

  const payroll = await getPayrollById({ id: payrollId, userId: user.id });

  return (
    <div>
      <SettingsHeader title="Payees" subtitle="Manage the payees or invite new payees.">
        <InvitePayeeDialog payrollId={payroll.id} teamId={team.id} />
      </SettingsHeader>

      <PayeePageDataTable
        payrollId={payroll.id}
        payrollTitle={payroll.title}
        payrollOwnerUserId={payroll.ownerUserId}
        teamId={team.id}
      />
    </div>
  );
}

import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { findDocuments } from '@documenso/lib/server-only/document/find-documents';
import { findPayees } from '@documenso/lib/server-only/payroll/find-payees';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { getTeamByUrl } from '@documenso/lib/server-only/team/get-team';

import { InvitePayeeDialog } from '~/components/(payrolls)/dialogs/invite-payee-dialog';
import { PayoutDialog } from '~/components/(payrolls)/dialogs/payout-dialog';
import { PayeePageDataTable } from '~/components/(payrolls)/tables/payee-page-data-table';

export type TeamPayrollPageProps = {
  params: {
    id: string;
    teamUrl: string;
  };
};

export default async function TeamPayrollPage({ params }: TeamPayrollPageProps) {
  const { id, teamUrl } = params;

  const payrollId = Number(id);

  const { user } = await getRequiredServerComponentSession();
  const team = await getTeamByUrl({ userId: user.id, teamUrl });

  const payroll = await getPayrollById({ id: payrollId, userId: user.id });

  const documents = await findDocuments({
    userId: user.id,
    teamId: team.id,
    status: 'COMPLETED',
    perPage: Number.MAX_SAFE_INTEGER,
  });

  const { data: payees } = await findPayees({
    userId: user.id,
    teamId: team.id,
    payrollId: payroll.id,
    perPage: Number.MAX_SAFE_INTEGER,
  });

  return (
    <div>
      <div className="flex justify-end space-x-4">
        <InvitePayeeDialog payrollId={payroll.id} teamId={team.id} documents={documents} />
        <PayoutDialog
          currency={payroll.currency}
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          beneficiaries={payees.map((payee) => payee.user.address as `0x${string}`)}
          amounts={payees.map((payee) => payee.amount.toString())}
        />
      </div>

      <PayeePageDataTable
        payrollId={payroll.id}
        payrollTitle={payroll.title}
        teamUrl={team.url}
        teamId={team.id}
      />
    </div>
  );
}

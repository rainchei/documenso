import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { findDocuments } from '@documenso/lib/server-only/document/find-documents';
import { findPayees } from '@documenso/lib/server-only/payroll/find-payees';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';

import { InvitePayeeDialog } from '~/components/(payrolls)/dialogs/invite-payee-dialog';
import { PayoutDialog } from '~/components/(payrolls)/dialogs/payout-dialog';
import { PayeePageDataTable } from '~/components/(payrolls)/tables/payee-page-data-table';

export type PayrollPageProps = {
  params: {
    id: string;
  };
};

export default async function PayrollPage({ params }: PayrollPageProps) {
  const { id } = params;

  const payrollId = Number(id);

  const { user } = await getRequiredServerComponentSession();

  const payroll = await getPayrollById({ id: payrollId, userId: user.id });

  const documents = await findDocuments({
    userId: user.id,
    status: 'COMPLETED',
    perPage: Number.MAX_SAFE_INTEGER,
  });

  const { data: payees } = await findPayees({
    userId: user.id,
    payrollId: payroll.id,
    perPage: Number.MAX_SAFE_INTEGER,
  });

  return (
    <div>
      <div className="flex justify-end space-x-4">
        <InvitePayeeDialog payrollId={payroll.id} documents={documents} />
        <PayoutDialog
          currency={payroll.currency}
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          beneficiaries={payees.map((payee) => payee.user.address as `0x${string}`)}
          amounts={payees.map((payee) => payee.amount.toString())}
        />
      </div>

      <PayeePageDataTable payrollId={payroll.id} payrollTitle={payroll.title} />
    </div>
  );
}

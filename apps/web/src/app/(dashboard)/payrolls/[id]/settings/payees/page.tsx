import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { findDocuments } from '@documenso/lib/server-only/document/find-documents';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';

import { SettingsHeader } from '~/components/(dashboard)/settings/layout/header';
import { InvitePayeeDialog } from '~/components/(payrolls)/dialogs/invite-payee-dialog';
import { PayeePageDataTable } from '~/components/(payrolls)/tables/payee-page-data-table';

export type PayrollSettingsPayeesPageProps = {
  params: {
    id: string;
  };
};

export default async function PayrollsSettingsPayeesPage({
  params,
}: PayrollSettingsPayeesPageProps) {
  const { id } = params;
  const payrollId = Number(id);

  const { user } = await getRequiredServerComponentSession();

  const payroll = await getPayrollById({ id: payrollId, userId: user.id });

  const results = await findDocuments({
    userId: user.id,
    status: 'COMPLETED',
    perPage: Number.MAX_SAFE_INTEGER,
  });

  return (
    <div>
      <SettingsHeader title="Payees" subtitle="Manage the payees or invite new payees.">
        <InvitePayeeDialog payrollId={payroll.id} results={results} />
      </SettingsHeader>

      <PayeePageDataTable payrollId={payroll.id} payrollTitle={payroll.title} />
    </div>
  );
}

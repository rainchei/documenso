import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
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

  const session = await getRequiredServerComponentSession();

  const payroll = await getPayrollById({ id: payrollId, userId: session.user.id });

  return (
    <div>
      <SettingsHeader title="Payees" subtitle="Manage the payees or invite new payees.">
        <InvitePayeeDialog payrollId={payroll.id} />
      </SettingsHeader>

      <PayeePageDataTable
        payrollId={payroll.id}
        payrollTitle={payroll.title}
        payrollOwnerUserId={payroll.ownerUserId}
      />
    </div>
  );
}

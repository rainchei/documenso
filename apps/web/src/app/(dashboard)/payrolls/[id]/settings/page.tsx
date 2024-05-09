import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';

import { SettingsHeader } from '~/components/(dashboard)/settings/layout/header';
import { DeletePayrollDialog } from '~/components/(payrolls)/dialogs/delete-payroll-dialog';
import { UpdatePayrollForm } from '~/components/(payrolls)/forms/update-payroll-form';

export type PayrollSettingsPageProps = {
  params: {
    id: string;
  };
};

export default async function PayrollSettingsPage({ params }: PayrollSettingsPageProps) {
  const { id } = params;
  const payrollId = Number(id);

  const { user } = await getRequiredServerComponentSession();

  const payroll = await getPayrollById({ id: payrollId, userId: user.id });

  return (
    <div>
      <SettingsHeader
        title="Payroll Profile"
        subtitle="Here you can edit your payroll's details."
      />

      <UpdatePayrollForm payrollId={payroll.id} payrollTitle={payroll.title} />

      <section className="mt-6 space-y-6">
        {payroll.ownerUserId === user.id && (
          <>
            <Alert
              className="flex flex-col justify-between p-6 sm:flex-row sm:items-center"
              variant="neutral"
            >
              <div className="mb-4 sm:mb-0">
                <AlertTitle>Delete payroll</AlertTitle>

                <AlertDescription className="mr-2">
                  This payroll, and any associated data excluding billing invoices will be
                  permanently deleted.
                </AlertDescription>
              </div>

              <DeletePayrollDialog payrollId={payroll.id} payrollTitle={payroll.title} />
            </Alert>
          </>
        )}
      </section>
    </div>
  );
}

'use client';

import { trpc } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type AcceptPayrollInvitationButtonProps = {
  payrollId: number;
};

export const AcceptPayrollInvitationButton = ({
  payrollId,
}: AcceptPayrollInvitationButtonProps) => {
  const { toast } = useToast();

  const {
    mutateAsync: acceptPayrollInvitation,
    isLoading,
    isSuccess,
  } = trpc.payroll.acceptPayrollInvitation.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Accepted payroll invitation',
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
        duration: 10000,
        description: 'Unable to join this payroll at this time.',
      });
    },
  });

  return (
    <Button
      onClick={async () => acceptPayrollInvitation({ payrollId })}
      loading={isLoading}
      disabled={isLoading || isSuccess}
    >
      Accept
    </Button>
  );
};

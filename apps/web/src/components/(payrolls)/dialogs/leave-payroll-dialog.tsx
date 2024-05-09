'use client';

import { useState } from 'react';

import { trpc } from '@documenso/trpc/react';
import { Alert } from '@documenso/ui/primitives/alert';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type LeavePayrollDialogProps = {
  payrollId: number;
  payrollTitle: string;
  trigger?: React.ReactNode;
};

export const LeavePayrollDialog = ({
  trigger,
  payrollId,
  payrollTitle,
}: LeavePayrollDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const { mutateAsync: leavePayroll, isLoading: isLeavingPayroll } =
    trpc.payroll.leavePayroll.useMutation({
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'You have successfully left this payroll.',
          duration: 5000,
        });

        setOpen(false);
      },
      onError: () => {
        toast({
          title: 'An unknown error occurred',
          variant: 'destructive',
          duration: 10000,
          description:
            'We encountered an unknown error while attempting to leave this payroll. Please try again later.',
        });
      },
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !isLeavingPayroll && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="destructive">Leave payroll</Button>}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>

          <DialogDescription className="mt-4">
            You are about to leave the following payroll.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral" padding="tight">
          <AvatarWithText
            avatarClass="h-12 w-12"
            avatarFallback={payrollTitle.slice(0, 1).toUpperCase()}
            primaryText={payrollTitle}
          />
        </Alert>

        <fieldset disabled={isLeavingPayroll}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              loading={isLeavingPayroll}
              onClick={async () => leavePayroll({ payrollId })}
            >
              Leave
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};

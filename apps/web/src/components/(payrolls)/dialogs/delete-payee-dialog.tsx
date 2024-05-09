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

export type DeletePayeeDialogProps = {
  payrollId: number;
  payrollTitle: string;
  payeeId: number;
  payeeName: string;
  payeeEmail: string;
  trigger?: React.ReactNode;
  teamId?: number;
};

export const DeletePayeeDialog = ({
  payrollId,
  payrollTitle,
  payeeId,
  payeeName,
  payeeEmail,
  trigger,
  teamId,
}: DeletePayeeDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const { mutateAsync: deletePayees, isLoading: isDeletingPayee } =
    trpc.payroll.deletePayees.useMutation({
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'You have successfully removed this user from the payroll.',
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
            'We encountered an unknown error while attempting to remove this user. Please try again later.',
        });
      },
    });

  return (
    <Dialog open={open} onOpenChange={(value) => !isDeletingPayee && setOpen(value)}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="secondary">Delete payroll member</Button>}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>

          <DialogDescription className="mt-4">
            You are about to remove the following user from{' '}
            <span className="font-semibold">{payrollTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="neutral" padding="tight">
          <AvatarWithText
            avatarClass="h-12 w-12"
            avatarFallback={payeeName.slice(0, 1).toUpperCase()}
            primaryText={<span className="font-semibold">{payeeName}</span>}
            secondaryText={payeeEmail}
          />
        </Alert>

        <fieldset disabled={isDeletingPayee}>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              loading={isDeletingPayee}
              onClick={async () => deletePayees({ payrollId, payeeIds: [payeeId], teamId })}
            >
              Delete
            </Button>
          </DialogFooter>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
};

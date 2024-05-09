'use client';

import { AnimatePresence } from 'framer-motion';
import { BellIcon } from 'lucide-react';

import { trpc } from '@documenso/trpc/react';
import { AnimateGenericFadeInOut } from '@documenso/ui/components/animate/animate-generic-fade-in-out';
import { Alert, AlertDescription } from '@documenso/ui/primitives/alert';
import { AvatarWithText } from '@documenso/ui/primitives/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';

import { AcceptPayrollInvitationButton } from './accept-payroll-invitation-button';

export const PayrollInvitations = () => {
  const { data, isInitialLoading } = trpc.payroll.getPayrollInvitations.useQuery();

  return (
    <AnimatePresence>
      {data && data.length > 0 && !isInitialLoading && (
        <AnimateGenericFadeInOut>
          <Alert variant="secondary">
            <div className="flex h-full flex-row items-center p-2">
              <BellIcon className="mr-4 h-5 w-5 text-blue-800" />

              <AlertDescription className="mr-2">
                You have <strong>{data.length}</strong> pending payroll invitation
                {data.length > 1 ? 's' : ''}.
              </AlertDescription>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="ml-auto text-sm font-medium text-blue-700 hover:text-blue-600">
                    View invites
                  </button>
                </DialogTrigger>

                <DialogContent position="center">
                  <DialogHeader>
                    <DialogTitle>Pending invitations</DialogTitle>

                    <DialogDescription className="mt-4">
                      You have {data.length} pending payroll invitation{data.length > 1 ? 's' : ''}.
                    </DialogDescription>
                  </DialogHeader>

                  <ul className="-mx-6 -mb-6 max-h-[80vh] divide-y overflow-auto px-6 pb-6 xl:max-h-[70vh]">
                    {data.map((invitation) => (
                      <li key={invitation.payrollId}>
                        <AvatarWithText
                          className="w-full max-w-none py-4"
                          avatarFallback={invitation.payroll.title.slice(0, 1)}
                          primaryText={
                            <span className="text-foreground/80 font-semibold">
                              {invitation.payroll.title}
                            </span>
                          }
                          rightSideComponent={
                            <div className="ml-auto">
                              <AcceptPayrollInvitationButton payrollId={invitation.payroll.id} />
                            </div>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </DialogContent>
              </Dialog>
            </div>
          </Alert>
        </AnimateGenericFadeInOut>
      )}
    </AnimatePresence>
  );
};

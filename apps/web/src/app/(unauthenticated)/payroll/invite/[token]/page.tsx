import Link from 'next/link';

import { DateTime } from 'luxon';

import { getServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { encryptSecondaryData } from '@documenso/lib/server-only/crypto/encrypt';
import { acceptPayrollInvitation } from '@documenso/lib/server-only/payroll/accept-payroll-invitation';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { prisma } from '@documenso/prisma';
import { PayeeInviteStatus } from '@documenso/prisma/client';
import { Button } from '@documenso/ui/primitives/button';

type AcceptInvitationPageProps = {
  params: {
    token: string;
  };
};

export default async function AcceptInvitationPage({
  params: { token },
}: AcceptInvitationPageProps) {
  const session = await getServerComponentSession();

  const payeeInvite = await prisma.payeeInvite.findUnique({
    where: {
      token,
    },
  });

  if (!payeeInvite) {
    return (
      <div className="w-screen max-w-lg px-4">
        <div className="w-full">
          <h1 className="text-4xl font-semibold">Invalid token</h1>

          <p className="text-muted-foreground mb-4 mt-2 text-sm">
            This token is invalid or has expired. Please contact your payroll admin for a new
            invitation.
          </p>

          <Button asChild>
            <Link href="/">Return</Link>
          </Button>
        </div>
      </div>
    );
  }

  const payroll = await getPayrollById({ id: payeeInvite.payrollId });

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: payeeInvite.email,
        mode: 'insensitive',
      },
    },
  });

  if (user) {
    if (!user.address) {
      return (
        <div>
          <h1 className="text-4xl font-semibold">Payroll invitation</h1>

          <p className="text-muted-foreground mt-2 text-sm">
            You have been invited to join payroll <strong>{payroll.title}</strong>.
          </p>

          <p className="text-muted-foreground mb-4 mt-1 text-sm">
            To accept this invitation you must register your wallet address.
          </p>

          <Button asChild>
            <Link href={`/settings/profile`}>Register address</Link>
          </Button>
        </div>
      );
    }
    // Convert the payeeInvite to a payee if they have an account and address
    await acceptPayrollInvitation({ userId: user.id, payrollId: payroll.id });
  }

  // For users who do not exist yet, set the payroll invite status to accepted, which is checked during
  // user creation to determine if we should add the user to the payroll at that time.
  if (!user && payeeInvite.status !== PayeeInviteStatus.ACCEPTED) {
    await prisma.payeeInvite.update({
      where: {
        id: payeeInvite.id,
      },
      data: {
        status: PayeeInviteStatus.ACCEPTED,
      },
    });
  }

  const email = encryptSecondaryData({
    data: payeeInvite.email,
    expiresAt: DateTime.now().plus({ days: 1 }).toMillis(),
  });

  if (!user) {
    return (
      <div>
        <h1 className="text-4xl font-semibold">Payroll invitation</h1>

        <p className="text-muted-foreground mt-2 text-sm">
          You have been invited to join payroll <strong>{payroll.title}</strong>.
        </p>

        <p className="text-muted-foreground mb-4 mt-1 text-sm">
          To accept this invitation you must create an account.
        </p>

        <Button asChild>
          <Link href={`/signup?email=${encodeURIComponent(email)}`}>Create account</Link>
        </Button>
      </div>
    );
  }

  const isSessionUserTheInvitedUser = user.id === session.user?.id;

  return (
    <div>
      <h1 className="text-4xl font-semibold">Invitation accepted!</h1>

      <p className="text-muted-foreground mb-4 mt-2 text-sm">
        You have accepted an invitation to join payroll <strong>{payroll.title}</strong>.
      </p>

      {isSessionUserTheInvitedUser ? (
        <Button asChild>
          <Link href="/">Continue</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href={`/signin?email=${encodeURIComponent(email)}`}>Continue to login</Link>
        </Button>
      )}
    </div>
  );
}

import { createElement } from 'react';

import { nanoid } from 'nanoid';

import { mailer } from '@documenso/email/mailer';
import { render } from '@documenso/email/render';
import type { PayrollInviteEmailProps } from '@documenso/email/templates/payroll-invite';
import { PayrollInviteEmailTemplate } from '@documenso/email/templates/payroll-invite';
import { WEBAPP_BASE_URL } from '@documenso/lib/constants/app';
import { FROM_ADDRESS, FROM_NAME } from '@documenso/lib/constants/email';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';
import { PayeeInviteStatus } from '@documenso/prisma/client';
import type { TCreatePayeeInvitesMutationSchema } from '@documenso/trpc/server/payroll-router/schema';

export type CreatePayeeInvitesOptions = {
  userId: number;
  teamId?: number;
  userName: string;
  payrollId: number;
  invitations: TCreatePayeeInvitesMutationSchema['invitations'];
};

/**
 * Invite payee via email to join a payroll.
 */
export const createPayeeInvites = async ({
  userId,
  teamId,
  userName,
  payrollId,
  invitations,
}: CreatePayeeInvitesOptions) => {
  let whereFilter: Prisma.PayrollWhereInput = {
    id: payrollId,
    ownerUserId: userId,
    ownerTeamId: null,
  };

  if (teamId !== undefined) {
    whereFilter = {
      id: payrollId,
      ownerTeam: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
    };
  }

  const payroll = await prisma.payroll.findFirstOrThrow({
    where: whereFilter,
    include: {
      payees: {
        select: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      invites: true,
      ownerTeam: {
        include: {
          members: {
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const isOwnerOrOwnerTeamMember = teamId
    ? payroll.ownerTeam?.members.find((member) => member.user.id === userId)
    : payroll.ownerUserId === userId;

  if (!isOwnerOrOwnerTeamMember) {
    throw new AppError(
      AppErrorCode.UNAUTHORIZED,
      'User not owner or member of team that owned this payroll.',
    );
  }

  const payeeEmails = payroll.payees.map((payee) => payee.user.email);
  const payeeInviteEmails = payroll.invites.map((invite) => invite.email);

  const usersToInvite = invitations.filter((invitation) => {
    // Filter out users that are already payees of the payroll.
    if (payeeEmails.includes(invitation.email)) {
      return false;
    }

    // Filter out users that have already been invited to the payroll.
    if (payeeInviteEmails.includes(invitation.email)) {
      return false;
    }

    return true;
  });

  const payeeInvites = usersToInvite.map(({ email, documentId }) => ({
    email,
    documentId,
    payrollId,
    status: PayeeInviteStatus.PENDING,
    token: nanoid(32),
  }));

  await prisma.payeeInvite.createMany({
    data: payeeInvites,
  });

  const sendEmailResult = await Promise.allSettled(
    payeeInvites.map(async ({ email, token }) =>
      sendPayeeInviteEmail({
        email,
        token,
        payrollTitle: payroll.title,
        senderName: userName,
      }),
    ),
  );

  const sendEmailResultErrorList = sendEmailResult.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (sendEmailResultErrorList.length > 0) {
    console.error(JSON.stringify(sendEmailResultErrorList));

    throw new AppError(
      'EmailDeliveryFailed',
      'Failed to send invite emails to one or more users.',
      `Failed to send invites to ${sendEmailResultErrorList.length}/${payeeInvites.length} users.`,
    );
  }
};

type SendPayeeInviteEmailOptions = Omit<PayrollInviteEmailProps, 'baseUrl' | 'assetBaseUrl'> & {
  email: string;
};

/**
 * Send an email to a user inviting them to join a payroll.
 */
export const sendPayeeInviteEmail = async ({
  email,
  ...emailTemplateOptions
}: SendPayeeInviteEmailOptions) => {
  const template = createElement(PayrollInviteEmailTemplate, {
    assetBaseUrl: WEBAPP_BASE_URL,
    baseUrl: WEBAPP_BASE_URL,
    ...emailTemplateOptions,
  });

  await mailer.sendMail({
    to: email,
    from: {
      name: FROM_NAME,
      address: FROM_ADDRESS,
    },
    subject: `You have been invited to join Payroll - ${emailTemplateOptions.payrollTitle} on Emplying`,
    html: render(template),
    text: render(template, { plainText: true }),
  });
};

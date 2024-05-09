import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';

import { sendPayeeInviteEmail } from './create-payee-invites';

export type ResendPayeeInvitationOptions = {
  /**
   * The ID of the user who is initiating this action.
   */
  userId: number;

  /**
   * The ID of the payroll who is initiating this action.
   */
  teamId?: number;

  /**
   * The name of the user who is initiating this action.
   */
  userName: string;

  /**
   * The ID of the payroll.
   */
  payrollId: number;

  /**
   * The IDs of the invitations to resend.
   */
  invitationId: number;
};

/**
 * Resend an email for a given payroll member invite.
 */
export const resendPayeeInvitation = async ({
  userId,
  teamId,
  userName,
  payrollId,
  invitationId,
}: ResendPayeeInvitationOptions) => {
  let whereFilter: Prisma.PayrollWhereUniqueInput = {
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

  await prisma.$transaction(
    async (tx) => {
      const payroll = await tx.payroll.findUniqueOrThrow({
        where: whereFilter,
        include: {
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

      const payeeInvite = await tx.payeeInvite.findUniqueOrThrow({
        where: {
          id: invitationId,
          payrollId,
        },
      });

      if (!payeeInvite) {
        throw new AppError(AppErrorCode.NOT_FOUND, 'No invite exists for this payee.');
      }

      await sendPayeeInviteEmail({
        email: payeeInvite.email,
        token: payeeInvite.token,
        payrollTitle: payroll.title,
        senderName: userName,
      });
    },
    { timeout: 30_000 },
  );
};

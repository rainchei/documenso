import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';

export type DeletePayeesOptions = {
  /**
   * The ID of the user who is initiating this action.
   */
  userId: number;

  /**
   * The ID of the team which is initiating this action.
   */
  teamId?: number;

  /**
   * The ID of the payroll to remove payees from.
   */
  payrollId: number;

  /**
   * The IDs of the payroll payees to remove.
   */
  payeeIds: number[];
};

export const deletePayees = async ({
  userId,
  teamId,
  payrollId,
  payeeIds,
}: DeletePayeesOptions) => {
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

  await prisma.$transaction(
    async (tx) => {
      // Find the payroll and validate the user is allowed to remove payees.
      const payroll = await tx.payroll.findFirstOrThrow({
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

      // Remove the payees.
      await tx.payee.deleteMany({
        where: {
          id: {
            in: payeeIds,
          },
          payrollId: payroll.id,
        },
      });
    },
    { timeout: 30_000 },
  );
};

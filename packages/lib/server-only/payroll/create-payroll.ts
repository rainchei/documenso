import { AppError } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import type { TCreatePayrollMutationSchema } from '@documenso/trpc/server/payroll-router/schema';

export type CreatePayrollOptions = TCreatePayrollMutationSchema & {
  /**
   * The title of the payroll.
   */
  title: string;

  /**
   * The ID of the user who is initiating this action.
   */
  userId: number;

  /**
   * The ID of the team who is initiating this action.
   */
  teamId?: number;
};

/**
 * Create a payroll.
 */
export const createPayroll = async ({ title, userId, teamId }: CreatePayrollOptions) => {
  if (teamId) {
    await prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
    });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  try {
    // Create the payroll
    await prisma.payroll.create({
      data: {
        title,
        ownerUserId: user.id,
        ownerTeamId: teamId,
      },
    });
  } catch (err) {
    console.error(err);

    throw AppError.parseError(err);
  }
};

import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';

export type GetPayeesOptions = {
  userId: number;
  teamId?: number;
  payrollId: number;
};

/**
 * Get all payees for a given userId and payrollId.
 */
export const getPayees = async ({ userId, teamId, payrollId }: GetPayeesOptions) => {
  const whereFilter: Prisma.PayrollWhereInput = {
    OR: [
      {
        id: payrollId,
        payees: {
          some: {
            userId,
          },
        },
      },
    ],
  };

  if (teamId !== undefined) {
    whereFilter['OR']?.push({
      ownerTeam: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
    });
  } else {
    whereFilter['OR']?.push({
      ownerUserId: userId,
    });
  }

  return await prisma.payee.findMany({
    where: {
      payroll: whereFilter,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
};

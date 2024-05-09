import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';

export type GetPayrollByIdOptions = {
  id: number;
  userId?: number;
};

/**
 * Get a payroll given a payrollId.
 *
 * Provide an optional userId to check that the user is a payee of the payroll.
 */
export const getPayrollById = async ({ id, userId }: GetPayrollByIdOptions) => {
  const whereFilter: Prisma.PayrollWhereUniqueInput = {
    id,
  };

  if (userId !== undefined) {
    whereFilter['OR'] = [
      {
        payees: {
          some: {
            userId,
          },
        },
      },
      {
        ownerUserId: userId,
      },
      {
        ownerTeam: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    ];
  }

  const result = await prisma.payroll.findUniqueOrThrow({
    where: whereFilter,
    include: {
      payees: {
        where: {
          userId,
        },
      },
    },
  });

  const { payees, ...payroll } = result;

  return {
    ...payroll,
    currentPayee: payees.length > 0 ? payees[0] : null,
  };
};

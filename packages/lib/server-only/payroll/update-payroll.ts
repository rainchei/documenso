import { AppError } from '@documenso/lib/errors/app-error';
import { prisma } from '@documenso/prisma';
import type { Prisma } from '@documenso/prisma/client';

export type UpdatePayrollOptions = {
  userId: number;
  teamId?: number;
  payrollId: number;
  data: {
    title?: string;
  };
};

export const updatePayroll = async ({ userId, teamId, payrollId, data }: UpdatePayrollOptions) => {
  let whereFilter: Prisma.PayrollWhereUniqueInput = {
    id: payrollId,
    ownerUserId: userId,
  };

  if (teamId !== undefined) {
    whereFilter = {
      id: payrollId,
      ownerTeam: {
        members: {
          some: {
            userId,
          },
        },
      },
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.update({
        where: whereFilter,
        data: {
          title: data.title,
        },
      });

      return payroll;
    });
  } catch (err) {
    console.error(err);

    throw AppError.parseError(err);
  }
};

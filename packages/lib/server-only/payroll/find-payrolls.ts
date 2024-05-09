import type { FindResultSet } from '@documenso/lib/types/find-result-set';
import { prisma } from '@documenso/prisma';
import type { Payroll } from '@documenso/prisma/client';
import { Prisma } from '@documenso/prisma/client';

export interface FindPayrollsOptions {
  userId: number;
  teamId?: number;
  term?: string;
  page?: number;
  perPage?: number;
  orderBy?: {
    column: keyof Payroll;
    direction: 'asc' | 'desc';
  };
}

export const findPayrolls = async ({
  userId,
  teamId,
  term,
  page = 1,
  perPage = 10,
  orderBy,
}: FindPayrollsOptions) => {
  const orderByColumn = orderBy?.column ?? 'title';
  const orderByDirection = orderBy?.direction ?? 'desc';

  let whereFilter: Prisma.PayrollWhereInput = {
    OR: [
      {
        payees: {
          some: {
            userId,
          },
        },
      },
      {
        ownerUserId: userId,
        ownerTeamId: null,
      },
    ],
  };

  if (teamId !== undefined) {
    whereFilter = {
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

  if (term && term.length > 0) {
    whereFilter.title = {
      contains: term,
      mode: Prisma.QueryMode.insensitive,
    };
  }

  const [data, count] = await Promise.all([
    prisma.payroll.findMany({
      where: whereFilter,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      orderBy: {
        [orderByColumn]: orderByDirection,
      },
      include: {
        payees: {
          where: {
            userId,
          },
        },
      },
    }),
    prisma.payroll.count({
      where: whereFilter,
    }),
  ]);

  const maskedData = data.map((payroll) => ({
    ...payroll,
    currentPayee: teamId !== undefined ? null : payroll.payees[0],
    payees: undefined,
  }));

  return {
    data: maskedData,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultSet<typeof maskedData>;
};

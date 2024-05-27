import { P, match } from 'ts-pattern';

import type { FindResultSet } from '@documenso/lib/types/find-result-set';
import { prisma } from '@documenso/prisma';
import type { Payee } from '@documenso/prisma/client';
import { Prisma } from '@documenso/prisma/client';

export interface FindPayeesOptions {
  userId: number;
  teamId?: number;
  payrollId: number;
  term?: string;
  page?: number;
  perPage?: number;
  orderBy?: {
    column: keyof Payee | 'name';
    direction: 'asc' | 'desc';
  };
}

export const findPayees = async ({
  userId,
  teamId,
  payrollId,
  term,
  page = 1,
  perPage = 10,
  orderBy,
}: FindPayeesOptions) => {
  const orderByColumn = orderBy?.column ?? 'name';
  const orderByDirection = orderBy?.direction ?? 'desc';

  const payrollFilter: Prisma.PayrollWhereInput = {
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
    payrollFilter['OR']?.push({
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
    payrollFilter['OR']?.push({
      ownerUserId: userId,
    });
  }

  // Check that the user owns the payroll that they are trying to find payees in.
  const payroll = await prisma.payroll.findFirstOrThrow({
    where: payrollFilter,
  });

  const termFilters: Prisma.PayeeWhereInput | undefined = match(term)
    .with(P.string.minLength(1), () => ({
      user: {
        name: {
          contains: term,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    }))
    .otherwise(() => undefined);

  const whereClause: Prisma.PayeeWhereInput = {
    ...termFilters,
    payrollId: payroll.id,
  };

  let orderByClause: Prisma.PayeeOrderByWithRelationInput = {
    [orderByColumn]: orderByDirection,
  };

  // Name field is nested in the user so we have to handle it differently.
  if (orderByColumn === 'name') {
    orderByClause = {
      user: {
        name: orderByDirection,
      },
    };
  }

  const [data, count] = await Promise.all([
    prisma.payee.findMany({
      where: whereClause,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      orderBy: orderByClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            address: true,
          },
        },
      },
    }),
    prisma.payee.count({
      where: whereClause,
    }),
  ]);

  return {
    data,
    count,
    currentPage: Math.max(page, 1),
    perPage,
    totalPages: Math.ceil(count / perPage),
  } satisfies FindResultSet<typeof data>;
};

import { P, match } from 'ts-pattern';

import type { FindResultSet } from '@documenso/lib/types/find-result-set';
import { prisma } from '@documenso/prisma';
import type { PayeeInvite } from '@documenso/prisma/client';
import { Prisma } from '@documenso/prisma/client';

export interface FindPayeeInvitesOptions {
  userId: number;
  teamId?: number;
  payrollId: number;
  term?: string;
  page?: number;
  perPage?: number;
  orderBy?: {
    column: keyof PayeeInvite;
    direction: 'asc' | 'desc';
  };
}

export const findPayeeInvites = async ({
  userId,
  teamId,
  payrollId,
  term,
  page = 1,
  perPage = 10,
  orderBy,
}: FindPayeeInvitesOptions) => {
  const orderByColumn = orderBy?.column ?? 'email';
  const orderByDirection = orderBy?.direction ?? 'desc';

  let payrollFilter: Prisma.PayrollWhereInput = {
    id: payrollId,
    ownerUserId: userId,
    ownerTeamId: null,
  };

  if (teamId !== undefined) {
    payrollFilter = {
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

  // Check that the user owns the payroll that they are trying to find invites in.
  const payroll = await prisma.payroll.findFirstOrThrow({
    where: payrollFilter,
  });

  const termFilters: Prisma.PayeeInviteWhereInput | undefined = match(term)
    .with(P.string.minLength(1), () => ({
      email: {
        contains: term,
        mode: Prisma.QueryMode.insensitive,
      },
    }))
    .otherwise(() => undefined);

  const payeeInviteFilter: Prisma.PayeeInviteWhereInput = {
    ...termFilters,
    payrollId: payroll.id,
  };

  const [data, count] = await Promise.all([
    prisma.payeeInvite.findMany({
      where: payeeInviteFilter,
      skip: Math.max(page - 1, 0) * perPage,
      take: perPage,
      orderBy: {
        [orderByColumn]: orderByDirection,
      },
      // Exclude token attribute.
      select: {
        id: true,
        payrollId: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.payeeInvite.count({
      where: payeeInviteFilter,
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

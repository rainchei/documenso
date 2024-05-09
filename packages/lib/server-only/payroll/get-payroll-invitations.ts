import { prisma } from '@documenso/prisma';

export type GetPayrollInvitationsOptions = {
  email: string;
};

export const getPayrollInvitations = async ({ email }: GetPayrollInvitationsOptions) => {
  return await prisma.payeeInvite.findMany({
    where: {
      email,
    },
    include: {
      payroll: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

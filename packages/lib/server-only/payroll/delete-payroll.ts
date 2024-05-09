import { prisma } from '@documenso/prisma';

export type DeletePayrollOptions = {
  id: number;
  userId: number;
};

export const deletePayroll = async ({ id, userId }: DeletePayrollOptions) => {
  await prisma.$transaction(
    async (tx) => {
      await tx.payroll.delete({
        where: {
          id,
          OR: [
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
          ],
        },
      });
    },
    { timeout: 30_000 },
  );
};

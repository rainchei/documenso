import { prisma } from '@documenso/prisma';

export type LeavePayrollOptions = {
  /**
   * The ID of the user who is leaving the payroll.
   */
  userId: number;

  /**
   * The ID of the payroll the user is leaving.
   */
  payrollId: number;
};

export const leavePayroll = async ({ userId, payrollId }: LeavePayrollOptions) => {
  await prisma.$transaction(
    async (tx) => {
      const payroll = await tx.payroll.findFirstOrThrow({
        where: {
          id: payrollId,
          payees: {
            some: {
              userId,
            },
          },
        },
        include: {
          payees: {
            where: {
              userId,
            },
          },
        },
      });

      await tx.payee.delete({
        where: {
          payrollId_userId_documentId: {
            userId: payroll.payees[0].userId,
            payrollId: payroll.id,
            documentId: payroll.payees[0].documentId,
          },
        },
      });
    },
    { timeout: 30_000 },
  );
};

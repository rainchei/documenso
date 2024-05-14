import { prisma } from '@documenso/prisma';

export type AcceptPayrollInvitationOptions = {
  userId: number;
  payrollId: number;
};

export const acceptPayrollInvitation = async ({
  userId,
  payrollId,
}: AcceptPayrollInvitationOptions) => {
  await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findFirstOrThrow({
        where: {
          id: userId,
        },
      });

      const payeeInvite = await tx.payeeInvite.findFirstOrThrow({
        where: {
          payrollId,
          email: user.email,
        },
      });

      await tx.payee.create({
        data: {
          payrollId: payeeInvite.payrollId,
          userId: user.id,
          documentId: payeeInvite.documentId,
        },
      });

      await tx.payeeInvite.delete({
        where: {
          id: payeeInvite.id,
        },
      });
    },
    { timeout: 30_000 },
  );
};

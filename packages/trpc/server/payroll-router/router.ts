import { AppError } from '@documenso/lib/errors/app-error';
import { acceptPayrollInvitation } from '@documenso/lib/server-only/payroll/accept-payroll-invitation';
import { createPayeeInvites } from '@documenso/lib/server-only/payroll/create-payee-invites';
import { createPayroll } from '@documenso/lib/server-only/payroll/create-payroll';
import { deletePayees } from '@documenso/lib/server-only/payroll/delete-payees';
import { deletePayroll } from '@documenso/lib/server-only/payroll/delete-payroll';
import { deletePayeeInvitations } from '@documenso/lib/server-only/payroll/delete-payroll-invitations';
import { findPayeeInvites } from '@documenso/lib/server-only/payroll/find-payee-invites';
import { findPayees } from '@documenso/lib/server-only/payroll/find-payees';
import { findPayrolls } from '@documenso/lib/server-only/payroll/find-payrolls';
import { getPayees } from '@documenso/lib/server-only/payroll/get-payees';
import { getPayrollById } from '@documenso/lib/server-only/payroll/get-payroll';
import { getPayrollInvitations } from '@documenso/lib/server-only/payroll/get-payroll-invitations';
import { leavePayroll } from '@documenso/lib/server-only/payroll/leave-payroll';
import { resendPayeeInvitation } from '@documenso/lib/server-only/payroll/resend-payee-invitation';
import { updatePayroll } from '@documenso/lib/server-only/payroll/update-payroll';

import { authenticatedProcedure, router } from '../trpc';
import {
  ZAcceptPayrollInvitationMutationSchema,
  ZCreatePayeeInvitesMutationSchema,
  ZCreatePayrollMutationSchema,
  ZDeletePayeeInvitationsMutationSchema,
  ZDeletePayeesMutationSchema,
  ZDeletePayrollMutationSchema,
  ZFindPayeeInvitesQuerySchema,
  ZFindPayeesQuerySchema,
  ZFindPayrollsQuerySchema,
  ZGetPayeesQuerySchema,
  ZGetPayrollQuerySchema,
  ZLeavePayrollMutationSchema,
  ZResendPayeeInvitationMutationSchema,
  ZUpdatePayrollMutationSchema,
} from './schema';

export const payrollRouter = router({
  acceptPayrollInvitation: authenticatedProcedure
    .input(ZAcceptPayrollInvitationMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await acceptPayrollInvitation({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  createPayroll: authenticatedProcedure
    .input(ZCreatePayrollMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await createPayroll({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  createPayeeInvites: authenticatedProcedure
    .input(ZCreatePayeeInvitesMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await createPayeeInvites({
          userId: ctx.user.id,
          userName: ctx.user.name ?? '',
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  deletePayroll: authenticatedProcedure
    .input(ZDeletePayrollMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await deletePayroll({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  deletePayeeInvitations: authenticatedProcedure
    .input(ZDeletePayeeInvitationsMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await deletePayeeInvitations({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  deletePayees: authenticatedProcedure
    .input(ZDeletePayeesMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await deletePayees({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  findPayeeInvites: authenticatedProcedure
    .input(ZFindPayeeInvitesQuerySchema)
    .query(async ({ input, ctx }) => {
      try {
        return await findPayeeInvites({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  findPayees: authenticatedProcedure.input(ZFindPayeesQuerySchema).query(async ({ input, ctx }) => {
    try {
      return await findPayees({
        userId: ctx.user.id,
        ...input,
      });
    } catch (err) {
      console.error(err);

      throw AppError.parseErrorToTRPCError(err);
    }
  }),

  findPayrolls: authenticatedProcedure
    .input(ZFindPayrollsQuerySchema)
    .query(async ({ input, ctx }) => {
      try {
        return await findPayrolls({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  getPayroll: authenticatedProcedure.input(ZGetPayrollQuerySchema).query(async ({ input, ctx }) => {
    try {
      return await getPayrollById({ userId: ctx.user.id, ...input });
    } catch (err) {
      console.error(err);

      throw AppError.parseErrorToTRPCError(err);
    }
  }),

  getPayrollInvitations: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      return await getPayrollInvitations({ email: ctx.user.email });
    } catch (err) {
      console.error(err);

      throw AppError.parseErrorToTRPCError(err);
    }
  }),

  getPayees: authenticatedProcedure.input(ZGetPayeesQuerySchema).query(async ({ input, ctx }) => {
    try {
      return await getPayees({ userId: ctx.user.id, ...input });
    } catch (err) {
      console.error(err);

      throw AppError.parseErrorToTRPCError(err);
    }
  }),

  leavePayroll: authenticatedProcedure
    .input(ZLeavePayrollMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await leavePayroll({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  updatePayroll: authenticatedProcedure
    .input(ZUpdatePayrollMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await updatePayroll({
          userId: ctx.user.id,
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),

  resendPayeeInvitation: authenticatedProcedure
    .input(ZResendPayeeInvitationMutationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await resendPayeeInvitation({
          userId: ctx.user.id,
          userName: ctx.user.name ?? '',
          ...input,
        });
      } catch (err) {
        console.error(err);

        throw AppError.parseErrorToTRPCError(err);
      }
    }),
});

import { z } from 'zod';

// Consider refactoring to use ZBaseTableSearchParamsSchema.
const GenericFindQuerySchema = z.object({
  term: z.string().optional(),
  page: z.number().min(1).optional(),
  perPage: z.number().min(1).optional(),
});

export const ZAcceptPayrollInvitationMutationSchema = z.object({
  payrollId: z.number(),
});

export const ZCreatePayrollMutationSchema = z.object({
  title: z.string().min(1).trim(),
  teamId: z.number().optional(),
});

export const ZCreatePayeeInvitesMutationSchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
  invitations: z.array(
    z.object({
      email: z.string().email().toLowerCase(),
      documentId: z.number(),
      amount: z.number().gt(0),
    }),
  ),
});

export const ZDeletePayeesMutationSchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
  payeeIds: z.array(z.number()),
});

export const ZDeletePayeeInvitationsMutationSchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
  invitationIds: z.array(z.number()),
});

export const ZDeletePayrollMutationSchema = z.object({
  id: z.number(),
});

export const ZFindPayeeInvitesQuerySchema = GenericFindQuerySchema.extend({
  payrollId: z.number(),
  teamId: z.number().optional(),
});

export const ZFindPayeesQuerySchema = GenericFindQuerySchema.extend({
  payrollId: z.number(),
  teamId: z.number().optional(),
});

export const ZFindPayrollsQuerySchema = GenericFindQuerySchema.extend({
  teamId: z.number().optional(),
});

export const ZGetPayrollQuerySchema = z.object({
  id: z.number(),
  teamId: z.number().optional(),
});

export const ZGetPayrollsQuerySchema = z.object({
  teamId: z.number().optional(),
});

export const ZGetPayeesQuerySchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
});

export const ZLeavePayrollMutationSchema = z.object({
  payrollId: z.number(),
});

export const ZUpdatePayrollMutationSchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
  data: z.object({
    title: z.string().min(1).trim(),
  }),
});

export const ZResendPayeeInvitationMutationSchema = z.object({
  payrollId: z.number(),
  teamId: z.number().optional(),
  invitationId: z.number(),
});

export type TCreatePayrollMutationSchema = z.infer<typeof ZCreatePayrollMutationSchema>;
export type TCreatePayeeInvitesMutationSchema = z.infer<typeof ZCreatePayeeInvitesMutationSchema>;
export type TDeletePayeesMutationSchema = z.infer<typeof ZDeletePayeesMutationSchema>;
export type TDeletePayeeInvitationsMutationSchema = z.infer<
  typeof ZDeletePayeeInvitationsMutationSchema
>;
export type TDeletePayrollMutationSchema = z.infer<typeof ZDeletePayrollMutationSchema>;
export type TFindPayeeInvitesQuerySchema = z.infer<typeof ZFindPayeesQuerySchema>;
export type TFindPayeesQuerySchema = z.infer<typeof ZFindPayeesQuerySchema>;
export type TFindPayrollsQuerySchema = z.infer<typeof ZFindPayrollsQuerySchema>;
export type TGetPayrollQuerySchema = z.infer<typeof ZGetPayrollQuerySchema>;
export type TGetPayrollsQuerySchema = z.infer<typeof ZGetPayrollsQuerySchema>;
export type TGetPayeesQuerySchema = z.infer<typeof ZGetPayeesQuerySchema>;
export type TLeavePayrollMutationSchema = z.infer<typeof ZLeavePayrollMutationSchema>;
export type TUpdatePayrollMutationSchema = z.infer<typeof ZUpdatePayrollMutationSchema>;
export type TResendPayeeInvitationMutationSchema = z.infer<
  typeof ZResendPayeeInvitationMutationSchema
>;

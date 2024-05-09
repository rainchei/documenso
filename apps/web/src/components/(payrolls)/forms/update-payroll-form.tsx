'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { trpc } from '@documenso/trpc/react';
import { ZUpdatePayrollMutationSchema } from '@documenso/trpc/server/payroll-router/schema';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type UpdatePayrollDialogProps = {
  payrollId: number;
  payrollTitle: string;
  teamId?: number;
};

const ZUpdatePayrollFormSchema = ZUpdatePayrollMutationSchema.shape.data.pick({
  title: true,
});

type TUpdatePayrollFormSchema = z.infer<typeof ZUpdatePayrollFormSchema>;

export const UpdatePayrollForm = ({
  payrollId,
  payrollTitle,
  teamId,
}: UpdatePayrollDialogProps) => {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(ZUpdatePayrollFormSchema),
    defaultValues: {
      title: payrollTitle,
    },
  });

  const { mutateAsync: updatePayroll } = trpc.payroll.updatePayroll.useMutation();

  const onFormSubmit = async ({ title }: TUpdatePayrollFormSchema) => {
    try {
      await updatePayroll({
        data: {
          title,
        },
        payrollId,
        teamId,
      });

      toast({
        title: 'Success',
        description: 'Your payroll has been successfully updated.',
        duration: 5000,
      });

      form.reset({
        title,
      });
    } catch (err) {
      console.error(err);

      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to update your payroll. Please try again later.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)}>
        <fieldset className="flex h-full flex-col space-y-4" disabled={form.formState.isSubmitting}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Payroll Title</FormLabel>
                <FormControl>
                  <Input className="bg-background" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-row justify-end space-x-4">
            <AnimatePresence>
              {form.formState.isDirty && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                >
                  <Button type="button" variant="secondary" onClick={() => form.reset()}>
                    Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="transition-opacity"
              disabled={!form.formState.isDirty}
              loading={form.formState.isSubmitting}
            >
              Update payroll
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};

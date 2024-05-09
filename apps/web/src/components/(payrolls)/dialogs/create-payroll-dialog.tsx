'use client';

import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { ListPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { trpc } from '@documenso/trpc/react';
import { ZCreatePayrollMutationSchema } from '@documenso/trpc/server/payroll-router/schema';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
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

export type CreatePayrollDialogProps = {
  trigger?: React.ReactNode;
  teamId?: number;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZCreatePayrollFormSchema = ZCreatePayrollMutationSchema.pick({
  title: true,
});

type TCreatePayrollFormSchema = z.infer<typeof ZCreatePayrollFormSchema>;

export const CreatePayrollDialog = ({ trigger, teamId, ...props }: CreatePayrollDialogProps) => {
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const [open, setOpen] = useState(false);

  const actionSearchParam = searchParams?.get('action');

  const form = useForm({
    resolver: zodResolver(ZCreatePayrollFormSchema),
    defaultValues: {
      title: '',
    },
  });

  const { mutateAsync: createPayroll } = trpc.payroll.createPayroll.useMutation();

  const onFormSubmit = async ({ title }: TCreatePayrollFormSchema) => {
    try {
      await createPayroll({
        title,
        teamId,
      });

      setOpen(false);

      toast({
        title: 'Success',
        description: 'Your payroll has been created.',
        duration: 5000,
      });
    } catch (err) {
      console.error(err);

      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to create a payroll. Please try again later.',
      });
    }
  };

  useEffect(() => {
    if (actionSearchParam === 'add-payroll') {
      setOpen(true);
      updateSearchParams({ action: null });
    }
  }, [actionSearchParam, open, setOpen, updateSearchParams]);

  useEffect(() => {
    form.reset();
  }, [open, form]);

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild={true}>
        {trigger ?? (
          <Button className="cursor-pointer">
            <ListPlus className="-ml-1 mr-2 h-4 w-4" />
            Create Payroll
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>Create Payroll</DialogTitle>

          <DialogDescription className="mt-4">
            Create a payroll for paying your payees.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <fieldset
              className="flex h-full flex-col space-y-4"
              disabled={form.formState.isSubmitting}
            >
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

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button
                  type="submit"
                  data-testid="dialog-create-payroll-button"
                  loading={form.formState.isSubmitting}
                >
                  Create Payroll
                </Button>
              </DialogFooter>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

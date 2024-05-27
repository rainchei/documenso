'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { Mail, PlusCircle, Trash } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import type { FindResultSet } from '@documenso/lib/types/find-result-set';
import type { Document, Recipient, Team, User } from '@documenso/prisma/client';
import { trpc } from '@documenso/trpc/react';
import { ZCreatePayeeInvitesMutationSchema } from '@documenso/trpc/server/payroll-router/schema';
import { cn } from '@documenso/ui/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@documenso/ui/primitives/select';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { EmptyDocumentState } from '~/app/(dashboard)/documents/empty-state';

export type InvitePayeeDialogProps = {
  payrollId: number;
  documents: FindResultSet<
    Document & {
      Recipient: Recipient[];
      User: Pick<User, 'id' | 'name' | 'email'>;
      team: Pick<Team, 'id'> | null;
    }
  >;
  trigger?: React.ReactNode;
  teamId?: number;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZInvitePayeesFormSchema = z
  .object({
    invitations: ZCreatePayeeInvitesMutationSchema.shape.invitations,
  })
  // Display exactly which rows are duplicates.
  .superRefine((items, ctx) => {
    const uniqueEmails = new Map<string, number>();

    for (const [index, invitation] of items.invitations.entries()) {
      const email = invitation.email.toLowerCase();

      const firstFoundIndex = uniqueEmails.get(email);

      if (firstFoundIndex === undefined) {
        uniqueEmails.set(email, index);
        continue;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Emails must be unique',
        path: ['invitations', index, 'email'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Emails must be unique',
        path: ['invitations', firstFoundIndex, 'email'],
      });
    }
  });

type TInvitePayeesFormSchema = z.infer<typeof ZInvitePayeesFormSchema>;

export const InvitePayeeDialog = ({
  payrollId,
  documents,
  trigger,
  teamId,
  ...props
}: InvitePayeeDialogProps) => {
  const [open, setOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<TInvitePayeesFormSchema>({
    resolver: zodResolver(ZInvitePayeesFormSchema),
    defaultValues: {
      invitations: [
        {
          email: '',
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          documentId: '' as unknown as number,
          amount: 0,
        },
      ],
    },
  });

  const {
    append: appendPayeeInvite,
    fields: payeeInvites,
    remove: removePayeeInvite,
  } = useFieldArray({
    control: form.control,
    name: 'invitations',
  });

  const { mutateAsync: createPayeeInvites } = trpc.payroll.createPayeeInvites.useMutation();

  const onAddPayeeInvite = () => {
    appendPayeeInvite({
      email: '',
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      documentId: '' as unknown as number,
      amount: 0,
    });
  };

  const onFormSubmit = async ({ invitations }: TInvitePayeesFormSchema) => {
    try {
      await createPayeeInvites({
        payrollId,
        invitations,
        teamId,
      });

      toast({
        title: 'Success',
        description: 'Payroll invitations have been sent.',
        duration: 5000,
      });

      setOpen(false);
    } catch {
      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to invite payees. please try again later.',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger ?? (
          <Button variant="secondary">
            <Mail className="mr-2 h-4 w-4" />
            Invite payee
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center" className="sm:max-w-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Invite payees to join this payroll</DialogTitle>

          <DialogDescription className="mt-4">
            An email containing an invitation will be sent to each payee.
          </DialogDescription>
        </DialogHeader>

        {documents.count > 0 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <fieldset
                className="flex h-full flex-col space-y-4"
                disabled={form.formState.isSubmitting}
              >
                <div className="custom-scrollbar -m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1">
                  {payeeInvites.map((payeeInvite, index) => (
                    <div className="flex w-full flex-row space-x-4" key={payeeInvite.id}>
                      <FormField
                        control={form.control}
                        name={`invitations.${index}.documentId`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            {index === 0 && <FormLabel required>Completed document</FormLabel>}
                            <FormControl>
                              <Select
                                {...form.register(`invitations.${index}.documentId`, {
                                  required: true,
                                })}
                                {...field}
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={String(field.value)}
                              >
                                <SelectTrigger className="text-muted-foreground w-[250px] [&>span]:truncate">
                                  <SelectValue placeholder="Select a document" />
                                </SelectTrigger>

                                <SelectContent position="popper">
                                  {documents.data.map((document) => (
                                    <SelectItem key={document.id} value={String(document.id)}>
                                      {document.title.trim()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`invitations.${index}.email`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            {index === 0 && <FormLabel required>Email address</FormLabel>}
                            <FormControl>
                              <Select
                                {...field}
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!form.watch(`invitations.${index}.documentId`)}
                              >
                                <SelectTrigger className="text-muted-foreground w-[200px] [&>span]:truncate">
                                  <SelectValue placeholder="Select a payee" />
                                </SelectTrigger>

                                <SelectContent position="popper">
                                  {documents.data
                                    .filter(
                                      (document) =>
                                        String(document.id) ===
                                        String(form.watch(`invitations.${index}.documentId`)),
                                    )
                                    .map((document) =>
                                      document.Recipient.map((recipient) => (
                                        <SelectItem key={recipient.id} value={recipient.email}>
                                          {recipient.email}
                                        </SelectItem>
                                      )),
                                    )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`invitations.${index}.amount`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            {index === 0 && <FormLabel required>Amount</FormLabel>}
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-background"
                                type="number"
                                onChange={(v) => field.onChange(Number(v.target.value))}
                                disabled={!form.watch(`invitations.${index}.email`)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <button
                        type="button"
                        className={cn(
                          'justify-left inline-flex h-10 w-10 items-center text-slate-500 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50',
                          index === 0 ? 'mt-8' : 'mt-0',
                        )}
                        disabled={payeeInvites.length === 1}
                        onClick={() => removePayeeInvite(index)}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-fit"
                  onClick={() => onAddPayeeInvite()}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add more
                </Button>

                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>

                  <Button type="submit" loading={form.formState.isSubmitting}>
                    {!form.formState.isSubmitting && <Mail className="mr-2 h-4 w-4" />}
                    Invite
                  </Button>
                </DialogFooter>
              </fieldset>
            </form>
          </Form>
        )}
        {documents.count === 0 && <EmptyDocumentState status="COMPLETED" />}
      </DialogContent>
    </Dialog>
  );
};

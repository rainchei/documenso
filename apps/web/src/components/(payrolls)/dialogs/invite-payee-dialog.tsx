'use client';

import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { Download, Mail, MailIcon, PlusCircle, Trash, Upload, UsersIcon } from 'lucide-react';
import Papa, { type ParseResult } from 'papaparse';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { downloadFile } from '@documenso/lib/client-only/download-file';
import { trpc } from '@documenso/trpc/react';
import { ZCreatePayeeInvitesMutationSchema } from '@documenso/trpc/server/payroll-router/schema';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';
import { Card, CardContent } from '@documenso/ui/primitives/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@documenso/ui/primitives/tabs';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type InvitePayeeDialogProps = {
  payrollId: number;
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

type TabTypes = 'INDIVIDUAL' | 'BULK';

const ZImportPayeeSchema = z.array(
  z.object({
    email: z.string().email(),
  }),
);

export const InvitePayeeDialog = ({
  payrollId,
  trigger,
  teamId,
  ...props
}: InvitePayeeDialogProps) => {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [invitationType, setInvitationType] = useState<TabTypes>('INDIVIDUAL');

  const { toast } = useToast();

  const form = useForm<TInvitePayeesFormSchema>({
    resolver: zodResolver(ZInvitePayeesFormSchema),
    defaultValues: {
      invitations: [
        {
          email: '',
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
          'We encountered an unknown error while attempting to invite payroll payees. Please try again later.',
      });
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setInvitationType('INDIVIDUAL');
    }
  }, [open, form]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }

    const csvFile = e.target.files[0];

    Papa.parse(csvFile, {
      skipEmptyLines: true,
      comments: 'Work email,Job title',
      complete: (results: ParseResult<string[]>) => {
        const payees = results.data.map((row) => {
          const [email] = row;

          return {
            email: email.trim(),
          };
        });

        // Remove the first row if it contains the headers.
        if (payees.length > 1) {
          payees.shift();
        }

        try {
          const importedInvitations = ZImportPayeeSchema.parse(payees);

          form.setValue('invitations', importedInvitations);
          form.clearErrors('invitations');

          setInvitationType('INDIVIDUAL');
        } catch (err) {
          console.error(err.message);

          toast({
            variant: 'destructive',
            title: 'Something went wrong',
            description: 'Please check the CSV file and make sure it is according to our format',
          });
        }
      },
    });
  };

  const downloadTemplate = () => {
    const data = [{ email: 'john.doe@emplying.xyz' }, { email: 'jane.doe@emplying.xyz' }];

    const csvContent = 'Email address\n' + data.map((row) => `${row.email}`).join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv',
    });

    downloadFile({
      filename: 'emplying-payroll-payee-invites-template.csv',
      data: blob,
    });
  };

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger ?? <Button variant="secondary">Invite payee</Button>}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>Invite payees to join this payroll</DialogTitle>

          <DialogDescription className="mt-4">
            An email containing an invitation will be sent to each payee.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="INDIVIDUAL"
          value={invitationType}
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          onValueChange={(value) => setInvitationType(value as TabTypes)}
        >
          <TabsList className="w-full">
            <TabsTrigger value="INDIVIDUAL" className="hover:text-foreground w-full">
              <MailIcon size={20} className="mr-2" />
              Invite payees
            </TabsTrigger>

            <TabsTrigger value="BULK" className="hover:text-foreground w-full">
              <UsersIcon size={20} className="mr-2" /> Bulk Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="INDIVIDUAL">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFormSubmit)}>
                <fieldset
                  className="flex h-full flex-col space-y-4"
                  disabled={form.formState.isSubmitting}
                >
                  <div className="custom-scrollbar -m-1 max-h-[60vh] space-y-4 overflow-y-auto p-1">
                    {payeeInvites.map((payrollpayeeInvite, index) => (
                      <div className="flex w-full flex-row space-x-4" key={payrollpayeeInvite.id}>
                        <FormField
                          control={form.control}
                          name={`invitations.${index}.email`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              {index === 0 && <FormLabel required>Email address</FormLabel>}
                              <FormControl>
                                <Input className="bg-background" {...field} />
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
          </TabsContent>

          <TabsContent value="BULK">
            <div className="mt-4 space-y-4">
              <Card gradient className="h-32">
                <CardContent
                  className="text-muted-foreground/80 hover:text-muted-foreground/90 flex h-full cursor-pointer flex-col items-center justify-center rounded-lg p-0 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />

                  <p className="mt-1 text-sm">Click here to upload</p>

                  <input
                    onChange={onFileInputChange}
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    hidden
                  />
                </CardContent>
              </Card>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

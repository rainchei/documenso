'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { z } from 'zod';

import type { User } from '@documenso/prisma/client';
import { TRPCClientError } from '@documenso/trpc/client';
import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
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

export const ZAddressFormSchema = z.object({
  address: z.string(),
});

export type TAddressFormSchema = z.infer<typeof ZAddressFormSchema>;

export type AddressFormProps = {
  className?: string;
  user: User;
};

export const AddressForm = ({ className, user }: AddressFormProps) => {
  const router = useRouter();

  const account = useAccount();

  const { toast } = useToast();

  const form = useForm<TAddressFormSchema>({
    values: {
      address: user.address || '',
    },
    resolver: zodResolver(ZAddressFormSchema),
  });

  const isSubmitting = form.formState.isSubmitting;

  const { mutateAsync: updateAddress } = trpc.profile.updateAddress.useMutation();

  const onFormSubmit = async () => {
    try {
      const address = account.address as string;

      await updateAddress({
        address,
      });

      toast({
        title: 'Address updated',
        description: 'Your address has been updated successfully.',
        duration: 5000,
      });

      router.refresh();
    } catch (err) {
      if (err instanceof TRPCClientError && err.data?.code === 'BAD_REQUEST') {
        toast({
          title: 'An error occurred',
          description: err.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'An unknown error occurred',
          variant: 'destructive',
          description:
            'We encountered an unknown error while attempting to update your address. Please try again later.',
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn('flex w-full gap-x-4 gap-y-4', className)}
        onSubmit={form.handleSubmit(onFormSubmit)}
      >
        <fieldset className="flex w-full flex-col gap-y-4" disabled={isSubmitting}>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input type="text" {...field} className="bg-muted" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <Button
          type="submit"
          loading={isSubmitting}
          className="flex-shrink-0 self-end"
          disabled={!account.isConnected}
        >
          {isSubmitting ? 'Updating address...' : 'Use connected'}
        </Button>
      </form>
    </Form>
  );
};

'use client';

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useEffect, useState } from 'react';

import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { Banknote } from 'lucide-react';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { type BaseError, useWaitForTransactionReceipt } from 'wagmi';

import type { Currency } from '@documenso/prisma/client';
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
import { useToast } from '@documenso/ui/primitives/use-toast';

import { useERC20Approve, useERC20Approved } from '../hooks/use-erc20-approve';
import { useERC20Payout } from '../hooks/use-erc20-payout';

export type PayoutDialogProps = {
  currency: Currency;
  beneficiaries: `0x${string}`[];
  amounts: string[];
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

export const PayoutDialog = ({
  currency,
  beneficiaries,
  amounts,
  trigger,
  ...props
}: PayoutDialogProps) => {
  const [open, setOpen] = useState(false);

  const account = useAccount();

  const { toast } = useToast();

  const isApproved = useERC20Approved({
    address: account.address,
    chainId: Number(account.chainId),
    currency,
  });

  const { hash: approveHash, isPending: approveIsPending, approve } = useERC20Approve();

  const { isLoading: approveIsConfirming, isSuccess: approveIsConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { hash: payoutHash, isPending: payoutIsPending, payout } = useERC20Payout();

  const { isLoading: payoutIsConfirming, isSuccess: payoutIsConfirmed } =
    useWaitForTransactionReceipt({
      hash: payoutHash,
    });

  const onPayout = async () => {
    try {
      if (!isApproved) {
        await approve({
          chainId: Number(account.chainId),
          currency,
        });
      }
      await payout({
        chainId: Number(account.chainId),
        currency,
        beneficiaries,
        amounts: amounts.map((i) => parseEther(i)),
      });
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: (error as BaseError).shortMessage || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (approveIsConfirming || payoutIsConfirming) {
      toast({
        title: 'Waiting for confirmation',
        description: 'Your transaction has been sent to the chain successfully.',
      });
    }
    if (approveIsConfirmed || payoutIsConfirmed) {
      toast({
        title: 'Transaction confirmed',
        description: 'Your transaction has been confirmed on the chain successfully.',
      });
    }
  }, [approveIsConfirming, approveIsConfirmed, payoutIsConfirming, payoutIsConfirmed, toast]);

  return (
    <Dialog {...props} open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild>
        {trigger ?? (
          <Button disabled={!account.isConnected || beneficiaries.length === 0}>
            <Banknote className="-ml-1 mr-2 h-4 w-4" />
            Payout
          </Button>
        )}
      </DialogTrigger>

      <DialogContent position="center" className="sm:max-w-4xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle>Disburse payments to your payees</DialogTitle>

          <DialogDescription className="mt-4">
            A transaction request will be sent to your connected wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto grid grid-cols-1 gap-3">
          <div className="text-left text-sm text-slate-500">
            {approveHash && <p className="text-green-500">ERC20 Approve Hash: {approveHash}</p>}
            {payoutHash && <p className="text-green-500">ERC20 Payout Hash: {payoutHash}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!account.isConnected}
            loading={approveIsPending || payoutIsPending}
            onClick={onPayout}
          >
            <Banknote className="-ml-1 mr-2 h-4 w-4" />
            {clsx({
              'Confirming...': approveIsPending || payoutIsPending,
              Payout: account.isConnected && !approveIsPending && !payoutIsPending,
              'Wallet Disconnected':
                account.isDisconnected && !approveIsPending && !payoutIsPending,
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { maxUint256 } from 'viem';

import { getERC20Address } from '~/helpers/erc20-address-book';
import { useReadIerc20Allowance, useWriteIerc20Approve } from '~/helpers/generated-abi';

type useERC20ApprovedParams = {
  address?: `0x${string}`;
  chainId?: number;
  currency: string;
};

type ERC20ApproveParams = {
  chainId: number;
  currency: string;
};

export const useERC20Approved = ({
  address = '0x0',
  chainId = 0,
  currency,
}: useERC20ApprovedParams) => {
  const token = getERC20Address(chainId, currency);

  const { data: allowance } = useReadIerc20Allowance({
    address: token,
    args: [address, process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS],
  });

  return allowance === maxUint256;
};

export const useERC20Approve = () => {
  const { data: hash, isPending, writeContractAsync } = useWriteIerc20Approve();

  const approve = async ({ chainId, currency }: ERC20ApproveParams) => {
    const token = getERC20Address(chainId, currency);

    if (!token) {
      const errMessage = `Token not found for chainId: ${chainId} and currency: ${currency}`;
      console.error(errMessage);
      throw new Error(errMessage);
    }

    await writeContractAsync({
      address: token,
      args: [process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS, maxUint256],
    });
  };

  return { hash, isPending, approve };
};

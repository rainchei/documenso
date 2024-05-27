import { getERC20Address } from '~/helpers/erc20-address-book';
import { useWritePayroll } from '~/helpers/generated-abi';

export type ERC20PayoutParams = {
  chainId: number;
  currency: string;
  beneficiaries: `0x${string}`[];
  amounts: bigint[];
};

export const useERC20Payout = () => {
  const { data: hash, isPending, writeContractAsync } = useWritePayroll();

  const payout = async ({ chainId, currency, beneficiaries, amounts }: ERC20PayoutParams) => {
    const token = getERC20Address(chainId, currency);

    if (!token) {
      const errMessage = `Token not found for chainId: ${chainId} and currency: ${currency}`;
      console.error(errMessage);
      throw new Error(errMessage);
    }

    await writeContractAsync({
      address: process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS,
      functionName: 'payoutERC20',
      args: [beneficiaries, amounts, token],
    });
  };

  return { hash, isPending, payout };
};

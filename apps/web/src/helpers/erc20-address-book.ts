type ADDRESS_BOOK = { [key: string]: `0x${string}` };
type ERC20_ADDRESS_BOOK = { [chainId: number]: ADDRESS_BOOK };

export const ERC20_ADDRESS_BOOK: ERC20_ADDRESS_BOOK = {
  // Ethereum Mainnet
  1: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  // Foundry
  31337: {
    MOCK: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  },
};

export const getERC20Address = (chainId: number, currency: string): `0x${string}` | undefined => {
  const addressBook = ERC20_ADDRESS_BOOK[chainId];
  return addressBook ? addressBook[currency] : undefined;
};

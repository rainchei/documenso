'use client';

import React from 'react';

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { foundry, mainnet } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID', // NOTE: Every dApp that relies on WalletConnect needs to obtain a projectId from WalletConnect Cloud.
  ssr: true,
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  chains: [mainnet, ...(process.env.NEXT_PUBLIC_PAYROLL_ENABLE_TESTNET ? [foundry] : [])],
});

const queryClient = new QueryClient();

type WalletProviderProps = {
  children: React.ReactNode;
};

export const WalletProvider = ({ children }: WalletProviderProps) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

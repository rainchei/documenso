import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';
import { react } from '@wagmi/cli/plugins';

export default defineConfig({
  out: 'src/helpers/generated-abi.ts',
  contracts: [],
  plugins: [
    foundry({
      project: '../../../crypto-payroll-contract',
      include: ['Payroll.json', 'IERC20.json'],
    }),
    react(),
  ],
});

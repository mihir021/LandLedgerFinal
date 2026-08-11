import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const CONTRACT_ADDRESS = '0x1a9250a291fa960b10082e6c38935b8016123f1b';

export const web3Config = getDefaultConfig({
  appName: 'LandLedger',
  projectId: 'a0280ebdb26c11b1bfbe9c3b838c64bb', // Required for WalletConnect (using a public template ID for now, user can change later if needed)
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http(),
  },
});

/**
 * Arbitrum Sepolia's base fee can move between wallet estimation and broadcast.
 * Use the latest network fee plus a 50% base-fee buffer so a transaction is not
 * rejected for being a few wei below the next block's base fee.
 */
export async function getSafeFeeOverrides(publicClient) {
  try {
    const [fees, block] = await Promise.all([
      publicClient.estimateFeesPerGas(),
      publicClient.getBlock({ blockTag: 'latest' }),
    ]);
    const priority = fees.maxPriorityFeePerGas ?? 0n;
    const bufferedBaseFee = (block.baseFeePerGas ?? 0n) * 3n / 2n + 1n;
    const estimatedMaxFee = fees.maxFeePerGas ?? 0n;

    return {
      maxPriorityFeePerGas: priority,
      maxFeePerGas: (estimatedMaxFee > bufferedBaseFee ? estimatedMaxFee : bufferedBaseFee) + priority,
    };
  } catch (error) {
    console.warn('Could not retrieve live gas fees; using wallet estimate.', error);
    return {};
  }
}

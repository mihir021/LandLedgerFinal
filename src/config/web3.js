import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

// Set VITE_CONTRACT_ADDRESS after deploying the current Stylus contract.
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xdf7f1c05ce7380019f0f8fbd8cce6a6a41aa3b50';
export const BLOCK_EXPLORER_TX_URL = 'https://sepolia.arbiscan.io/tx/';

export const web3Config = getDefaultConfig({
  appName: 'LandLedger',
  projectId: 'a0280ebdb26c11b1bfbe9c3b838c64bb', // Required for WalletConnect (using a public template ID for now, user can change later if needed)
  chains: [arbitrumSepolia],
  transports: {
    [arbitrumSepolia.id]: http('https://sepolia-rollup.arbitrum.io/rpc'),
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
    // Do not leave fee selection entirely to the wallet: some MetaMask
    // Arbitrum Sepolia sessions show "Network fee unavailable" in that case.
    // 0.1 gwei is well above the testnet base fee while still only charging
    // the fee actually used by the transaction.
    console.warn('Could not retrieve live gas fees; using safe Arbitrum Sepolia fallback.', error);
    return {
      maxPriorityFeePerGas: 1_000_000n,
      maxFeePerGas: 100_000_000n,
    };
  }
}

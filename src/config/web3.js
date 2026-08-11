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

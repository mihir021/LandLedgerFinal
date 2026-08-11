/**
 * Uses the same real wallet connection as the navigation and transaction
 * screens.  The previous component only displayed a mock address.
 */
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnectButton({ className = '' }) {
  return (
    <div className={className}>
      <ConnectButton />
    </div>
  );
}

/**
 * Crypto Purchase Configuration
 * Centralized constants for the INR / Crypto toggle feature.
 *
 * DEMO_INR_TO_ETH_RATE — Cosmetic conversion rate used to compute a
 *   realistic-looking ETH display price from the INR listing price.
 *   This number is NEVER used as the actual on-chain transfer value.
 *
 * ACTUAL_TRANSFER_ETH_AMOUNT — The real, small amount of testnet ETH
 *   transferred wallet-to-wallet on Arbitrum Sepolia when a buyer
 *   completes a crypto purchase. Kept minimal to conserve testnet funds.
 *
 * ESTIMATED_GAS_RESERVE_ETH — Additional ETH the buyer's wallet must
 *   hold on top of ACTUAL_TRANSFER_ETH_AMOUNT to cover gas fees.
 *   The pre-flight balance check uses the sum of both values.
 */

/** 1 ETH = ₹25,00,000 (demo purposes only) */
export const DEMO_INR_TO_ETH_RATE = 2_500_000;

/** Real ETH transferred on-chain per purchase (testnet-safe) */
export const ACTUAL_TRANSFER_ETH_AMOUNT = 0.0005;

/** Gas fee buffer so the balance check doesn't cut it too close */
export const ESTIMATED_GAS_RESERVE_ETH = 0.0003;

/** Minimum wallet balance required before opening MetaMask */
export const MIN_BALANCE_REQUIRED_ETH =
  ACTUAL_TRANSFER_ETH_AMOUNT + ESTIMATED_GAS_RESERVE_ETH;

/**
 * Compute a cosmetic ETH price from an INR amount.
 * @param {number} priceINR — The property's INR listing price.
 * @returns {{ eth: number, formatted: string }}
 */
export function calculateDemoEthPrice(priceINR) {
  if (!priceINR || priceINR <= 0) return { eth: 0, formatted: '0.00' };
  const eth = priceINR / DEMO_INR_TO_ETH_RATE;
  return {
    eth,
    formatted: eth < 0.01 ? eth.toFixed(6) : eth.toFixed(4),
  };
}

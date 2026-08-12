import { parseAbi } from 'viem';

export const LandLedgerABI = parseAbi([
  'function init() external',
  'function registerLand(string parcel_id, string location, uint64 area_sqft) external',
  'function transferOwnership(string parcel_id, address new_owner) external',
  'function requestPurchase(string parcel_id) external payable',
  'function approveSale(string parcel_id, address buyer) external',
  'function acceptPurchase(string parcel_id) external',
  'function finalizeTransfer(string parcel_id) external',
  'function verifyLand(string parcel_id) external',
  'function getLand(string parcel_id) external view returns (address, string, uint64, bool, uint64)'
]);

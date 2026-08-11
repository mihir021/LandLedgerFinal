import { parseAbi } from 'viem';

export const LandLedgerABI = parseAbi([
  'function init() external',
  'function registerLand(string parcel_id, string location, uint64 area_sqft) external',
  'function transferOwnership(string parcel_id, address new_owner) external',
  'function verifyLand(string parcel_id) external',
  'function getLand(string parcel_id) external view returns (address, string, uint64, bool, uint64)'
]);

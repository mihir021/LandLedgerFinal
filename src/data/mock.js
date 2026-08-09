/**
 * mock.js — Local mock data for LandLedger
 * Structured to mirror the real backend schemas.
 * Swap individual arrays with real API calls as backend grows.
 */

// ── Users ──────────────────────────────────────────
export const MOCK_USERS = [
  { id: 'u1', name: 'Arjun Mehta',    email: 'arjun@example.com',  role: 'seller', walletAddress: '0x4f9Bc...3A2e', kycStatus: 'verified',  createdAt: '2024-01-15' },
  { id: 'u2', name: 'Priya Sharma',   email: 'priya@example.com',  role: 'buyer',  walletAddress: '0x82aD1...F7c3', kycStatus: 'verified',  createdAt: '2024-02-20' },
  { id: 'u3', name: 'Rahul Verma',    email: 'rahul@example.com',  role: 'seller', walletAddress: null,              kycStatus: 'pending',   createdAt: '2024-03-08' },
  { id: 'u4', name: 'Anjali Singh',   email: 'anjali@example.com', role: 'buyer',  walletAddress: '0xC1d8F...9aB2', kycStatus: 'verified',  createdAt: '2024-03-22' },
  { id: 'u5', name: 'Vikram Nair',    email: 'vikram@example.com', role: 'seller', walletAddress: null,              kycStatus: 'pending',   createdAt: '2024-04-11' },
  { id: 'u6', name: 'Meera Pillai',   email: 'meera@example.com',  role: 'buyer',  walletAddress: '0xA3e9c...1bF4', kycStatus: 'rejected',  createdAt: '2024-04-18' },
  { id: 'u7', name: 'Suresh Iyer',    email: 'suresh@example.com', role: 'seller', walletAddress: '0xD7f2B...8aC1', kycStatus: 'verified',  createdAt: '2024-05-02' },
  { id: 'u8', name: 'Divya Kapoor',   email: 'divya@example.com',  role: 'buyer',  walletAddress: null,              kycStatus: 'pending',   createdAt: '2024-05-19' },
];

// ── Lifecycle Stages ────────────────────────────────
export const LIFECYCLE_STAGES = [
  { key: 'draft',             label: 'Draft',               actor: 'seller',  description: 'Property record created' },
  { key: 'pending_verify',    label: 'Pending Verification',actor: 'officer', description: 'Awaiting government review' },
  { key: 'verified',          label: 'Verified',            actor: 'officer', description: 'Documents verified by officer' },
  { key: 'listed',            label: 'Listed for Sale',     actor: 'seller',  description: 'Property listed on marketplace' },
  { key: 'transfer_requested',label: 'Transfer Requested',  actor: 'buyer',   description: 'Buyer submitted purchase request' },
  { key: 'seller_approved',   label: 'Seller Approved',     actor: 'seller',  description: 'Seller accepted the request' },
  { key: 'buyer_signed',      label: 'Buyer Signed',        actor: 'buyer',   description: 'Buyer signed transaction' },
  { key: 'officer_approved',  label: 'Officer Approved',    actor: 'officer', description: 'Officer compliance confirmed' },
  { key: 'chain_processing',  label: 'Blockchain Processing',actor:'chain',   description: 'Smart contract executing transfer' },
  { key: 'completed',         label: 'Transfer Complete',   actor: 'chain',   description: 'Ownership updated on blockchain' },
];

// ── Blockchain History Events ───────────────────────
export const MOCK_BLOCKCHAIN_HISTORY = [
  {
    id: 'bh1',
    event: 'PropertyRegistered',
    fromAddress: '0x0000000000000000000000000000000000000000',
    toAddress: '0x4f9Bc8E1a23F1d456A7e89C2D3B4E5F6A7B8C9D3A2e',
    txHash: '0x8a3f2b1c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    blockNumber: 18924512,
    timestamp: '2024-01-15T09:23:41Z',
    gasUsed: '142,381',
    propertyId: 'PROP-CB547556',
  },
  {
    id: 'bh2',
    event: 'PropertyVerified',
    fromAddress: '0xGov1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0',
    toAddress: '0x4f9Bc8E1a23F1d456A7e89C2D3B4E5F6A7B8C9D3A2e',
    txHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c',
    blockNumber: 18941238,
    timestamp: '2024-01-22T14:11:07Z',
    gasUsed: '87,420',
    propertyId: 'PROP-CB547556',
  },
  {
    id: 'bh3',
    event: 'OwnershipTransferred',
    fromAddress: '0x4f9Bc8E1a23F1d456A7e89C2D3B4E5F6A7B8C9D3A2e',
    toAddress: '0x82aD1C3E5F7A9B2D4F6A8C0E2F4A6B8C0D2F4A6B8F7c3',
    txHash: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    blockNumber: 18975422,
    timestamp: '2024-02-14T16:44:29Z',
    gasUsed: '198,650',
    propertyId: 'PROP-CB547556',
  },
];

// ── Properties ─────────────────────────────────────
export const MOCK_PROPERTIES = [
  {
    id: 'PROP-CB547556',
    title: 'HSR Layout Residential Plot',
    address: 'Sector 4, HSR Layout',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'residential',
    price: 8500000,
    area: 2400,
    ownerId: 'u1',
    status: 'listed',
    surveyNumber: 'SRV-1024-A',
    blockchainTx: '0x9c0d1e2f3a4b5c6d7e8f',
    blockchainPropertyId: 'LAND-REG-8812',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format'],
    documents: [{ name: 'Title Deed.pdf', verified: true }, { name: 'Survey Map.pdf', verified: true }],
    blockchainHistory: MOCK_BLOCKCHAIN_HISTORY,
    createdAt: '2024-01-15',
  },
  {
    id: 'PROP-2E265507',
    title: 'Hinjawadi Commercial Plot',
    address: 'Hinjawadi Phase 3',
    district: 'Pune',
    state: 'Maharashtra',
    city: 'Pune',
    type: 'commercial',
    price: 16500000,
    area: 5000,
    ownerId: 'u7',
    status: 'verified',
    surveyNumber: 'SRV-8840-B',
    blockchainTx: '0x4e29b1837c72f1092a40',
    blockchainPropertyId: 'LAND-REG-9014',
    images: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format'],
    documents: [{ name: 'Title Deed.pdf', verified: true }, { name: 'NOC.pdf', verified: false }],
    blockchainHistory: MOCK_BLOCKCHAIN_HISTORY.slice(0,2),
    createdAt: '2024-02-10',
  },
  {
    id: 'PROP-45DC7BD4',
    title: 'GIFT City Agricultural Land',
    address: 'GIFT City Zone 2',
    district: 'Gandhinagar',
    state: 'Gujarat',
    city: 'Gandhinagar',
    type: 'agricultural',
    price: 12000000,
    area: 12000,
    ownerId: 'u3',
    status: 'pending_verify',
    surveyNumber: 'SRV-3312-C',
    blockchainTx: null,
    blockchainPropertyId: null,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format'],
    documents: [{ name: 'Revenue Records.pdf', verified: false }],
    blockchainHistory: [],
    createdAt: '2024-03-01',
  },
  {
    id: 'PROP-A92F1C38',
    title: 'Koramangala Mixed-Use Plot',
    address: '5th Block, Koramangala',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    city: 'Bengaluru',
    type: 'mixed',
    price: 22000000,
    area: 3800,
    ownerId: 'u1',
    status: 'transfer_requested',
    surveyNumber: 'SRV-7720-D',
    blockchainTx: '0x7b1c2d3e4f5a6b7c8d9e',
    blockchainPropertyId: 'LAND-REG-7721',
    images: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format'],
    documents: [{ name: 'Title Deed.pdf', verified: true }, { name: 'Khata.pdf', verified: true }],
    blockchainHistory: MOCK_BLOCKCHAIN_HISTORY,
    createdAt: '2023-11-22',
  },
];

// ── Purchase Requests ───────────────────────────────
export const MOCK_PURCHASE_REQUESTS = [
  {
    id: 'REQ-001',
    propertyId: 'PROP-CB547556',
    propertyTitle: 'HSR Layout Residential Plot',
    buyerId: 'u2',
    buyerName: 'Priya Sharma',
    sellerId: 'u1',
    sellerName: 'Arjun Mehta',
    status: 'pending',
    amount: 8500000,
    createdAt: '2024-04-10',
    timeline: [
      { stage: 'Request Submitted', actor: 'buyer', timestamp: '2024-04-10T10:30:00Z' },
    ],
  },
  {
    id: 'REQ-002',
    propertyId: 'PROP-A92F1C38',
    propertyTitle: 'Koramangala Mixed-Use Plot',
    buyerId: 'u4',
    buyerName: 'Anjali Singh',
    sellerId: 'u1',
    sellerName: 'Arjun Mehta',
    status: 'seller_approved',
    amount: 22000000,
    createdAt: '2024-03-28',
    timeline: [
      { stage: 'Request Submitted',  actor: 'buyer',   timestamp: '2024-03-28T09:00:00Z' },
      { stage: 'Seller Approved',    actor: 'seller',  timestamp: '2024-03-30T14:20:00Z' },
    ],
  },
  {
    id: 'REQ-003',
    propertyId: 'PROP-2E265507',
    propertyTitle: 'Hinjawadi Commercial Plot',
    buyerId: 'u2',
    buyerName: 'Priya Sharma',
    sellerId: 'u7',
    sellerName: 'Suresh Iyer',
    status: 'completed',
    amount: 16500000,
    createdAt: '2024-01-18',
    timeline: [
      { stage: 'Request Submitted',   actor: 'buyer',   timestamp: '2024-01-18T11:00:00Z' },
      { stage: 'Seller Approved',     actor: 'seller',  timestamp: '2024-01-20T10:15:00Z' },
      { stage: 'Buyer Signed',        actor: 'buyer',   timestamp: '2024-01-21T16:00:00Z' },
      { stage: 'Officer Approved',    actor: 'officer', timestamp: '2024-01-22T13:45:00Z' },
      { stage: 'Transfer Complete',   actor: 'chain',   timestamp: '2024-01-22T14:10:00Z' },
    ],
  },
];

// ── Notifications ───────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', message: 'Your property PROP-CB547556 has been verified by a government officer.',  read: false, type: 'success',  createdAt: '2024-04-22T09:10:00Z' },
  { id: 'n2', message: 'Purchase request REQ-001 has been submitted for HSR Layout Residential Plot.',  read: false, type: 'info',    createdAt: '2024-04-10T10:31:00Z' },
  { id: 'n3', message: 'Anjali Singh accepted the transfer for Koramangala Plot — sign the transaction.',  read: true,  type: 'warning', createdAt: '2024-03-30T14:25:00Z' },
  { id: 'n4', message: 'Your KYC verification was approved. You can now register properties.',  read: true,  type: 'success', createdAt: '2024-01-16T08:00:00Z' },
  { id: 'n5', message: 'Property PROP-45DC7BD4 is pending document review.',  read: false, type: 'info',    createdAt: '2024-03-05T11:00:00Z' },
];

// ── Mock Wallet Transactions ────────────────────────
export const MOCK_WALLET_TRANSACTIONS = [
  { id: 'wt1', type: 'purchase', description: 'Hinjawadi Commercial Plot',       amount: -16500000, txHash: '0x9c0d1e2f3a4b5c6d', date: '2024-01-22' },
  { id: 'wt2', type: 'deposit',  description: 'Wallet funded via UPI',           amount:  25000000, txHash: '0x1a2b3c4d5e6f7a8b', date: '2024-01-10' },
  { id: 'wt3', type: 'fee',      description: 'Registration fee — PROP-45DC7BD4',amount:    -15000, txHash: '0x4d5e6f7a8b9c0d1e', date: '2024-03-01' },
];

// ── Admin System Stats ──────────────────────────────
export const MOCK_SYSTEM_STATS = {
  totalUsers:          847,
  pendingKyc:           23,
  pendingProperties:     8,
  activeTransfers:      12,
  completedTransfers:  394,
  totalProperties:     512,
};

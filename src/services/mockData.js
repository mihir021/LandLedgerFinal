/**
 * Mock Data Service
 * Static JSON data used across the application in place of backend API calls.
 * Each export represents a different data domain.
 */

// ────────────────────────────────────────
// Property Listings
// ────────────────────────────────────────
export const properties = [
  {
    id: 'PROP-2024-001',
    surveyNumber: 'SRV/MH/PUN/2024/1042',
    title: 'Premium Residential Plot – Baner',
    address: 'Plot No. 42, Baner Road, Near Westend Mall',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    area: '2400 sq ft',
    areaValue: 2400,
    landType: 'Residential',
    price: 8500000,
    status: 'verified',
    owner: 'Rajesh Kumar Sharma',
    ownerId: 'USR-001',
    description: 'A premium corner residential plot with excellent connectivity to IT hubs, schools, and hospitals. Approved layout with clear title and NA order.',
    images: ['#3b82f6', '#6366f1', '#8b5cf6'],
    documents: ['Title Deed', 'NA Order', 'Survey Report', '7/12 Extract'],
    listedDate: '2024-11-15',
    verifiedDate: '2024-11-20',
    blockchainTxHash: '0x7a3f...e82c',
    blockchainHistory: [
      { date: '2024-11-15', event: 'Property Registered', hash: '0x7a3f...e82c', actor: 'Rajesh Sharma' },
      { date: '2024-11-18', event: 'Documents Uploaded', hash: '0x4b2d...a91f', actor: 'Rajesh Sharma' },
      { date: '2024-11-20', event: 'Verified by Officer', hash: '0x9c1e...d73b', actor: 'Officer Patel' },
      { date: '2024-12-01', event: 'Listed for Sale', hash: '0x2f8a...c45e', actor: 'Rajesh Sharma' },
    ],
  },
  {
    id: 'PROP-2024-002',
    surveyNumber: 'SRV/KA/BLR/2024/2087',
    title: 'Commercial Land – Whitefield',
    address: '14/2, ITPL Main Road, Whitefield',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    area: '5000 sq ft',
    areaValue: 5000,
    landType: 'Commercial',
    price: 25000000,
    status: 'pending',
    owner: 'Anita Deshmukh',
    ownerId: 'USR-002',
    description: 'Prime commercial land located on the IT corridor. Ideal for office complex or tech park development. BBMP approved.',
    images: ['#8b5cf6', '#ec4899', '#f43f5e'],
    documents: ['Title Deed', 'Khata Certificate', 'Encumbrance Certificate'],
    listedDate: '2024-12-05',
    verifiedDate: null,
    blockchainTxHash: '0x3d7c...f12a',
    blockchainHistory: [
      { date: '2024-12-05', event: 'Property Registered', hash: '0x3d7c...f12a', actor: 'Anita Deshmukh' },
      { date: '2024-12-06', event: 'Documents Uploaded', hash: '0x6e4a...b28d', actor: 'Anita Deshmukh' },
      { date: '2024-12-08', event: 'Pending Verification', hash: '0x1f9b...e47c', actor: 'System' },
    ],
  },
  {
    id: 'PROP-2024-003',
    surveyNumber: 'SRV/DL/ND/2024/3012',
    title: 'Agricultural Farm – Greater Noida',
    address: 'Village Roja, Tehsil Dadri, Greater Noida',
    city: 'Greater Noida',
    district: 'Gautam Buddha Nagar',
    state: 'Uttar Pradesh',
    area: '10 Acres',
    areaValue: 435600,
    landType: 'Agricultural',
    price: 15000000,
    status: 'verified',
    owner: 'Suresh Yadav',
    ownerId: 'USR-003',
    description: 'Fertile agricultural land with irrigation facility. Road access from NH-91. Suitable for farming and future development.',
    images: ['#10b981', '#059669', '#047857'],
    documents: ['Title Deed', 'Khasra/Khatauni', 'Revenue Records'],
    listedDate: '2024-10-20',
    verifiedDate: '2024-10-25',
    blockchainTxHash: '0x5e2b...a93d',
    blockchainHistory: [
      { date: '2024-10-20', event: 'Property Registered', hash: '0x5e2b...a93d', actor: 'Suresh Yadav' },
      { date: '2024-10-22', event: 'Documents Uploaded', hash: '0x8d1f...c76e', actor: 'Suresh Yadav' },
      { date: '2024-10-25', event: 'Verified by Officer', hash: '0x4a7c...d82f', actor: 'Officer Mehta' },
      { date: '2024-11-01', event: 'Listed for Sale', hash: '0x9b3e...f15a', actor: 'Suresh Yadav' },
    ],
  },
  {
    id: 'PROP-2024-004',
    surveyNumber: 'SRV/TN/CHN/2024/4055',
    title: 'Industrial Plot – Sriperumbudur',
    address: 'SIPCOT Industrial Area, Sriperumbudur',
    city: 'Chennai',
    district: 'Kancheepuram',
    state: 'Tamil Nadu',
    area: '8000 sq ft',
    areaValue: 8000,
    landType: 'Industrial',
    price: 32000000,
    status: 'transfer',
    owner: 'Vikram Industries Pvt Ltd',
    ownerId: 'USR-004',
    description: 'Fully developed industrial plot in SIPCOT area. Power, water and road connectivity available. Multiple MNCs in vicinity.',
    images: ['#f59e0b', '#d97706', '#b45309'],
    documents: ['Title Deed', 'Industrial License', 'Environmental Clearance', 'SIPCOT Allotment'],
    listedDate: '2024-09-10',
    verifiedDate: '2024-09-15',
    blockchainTxHash: '0x1c4d...b67e',
    blockchainHistory: [
      { date: '2024-09-10', event: 'Property Registered', hash: '0x1c4d...b67e', actor: 'Vikram Industries' },
      { date: '2024-09-12', event: 'Documents Uploaded', hash: '0x7f2a...e93c', actor: 'Vikram Industries' },
      { date: '2024-09-15', event: 'Verified by Officer', hash: '0x3b8e...a41d', actor: 'Officer Iyer' },
      { date: '2024-10-01', event: 'Transfer Initiated', hash: '0x6d5c...f28a', actor: 'Vikram Industries' },
      { date: '2024-10-05', event: 'Transfer Pending Approval', hash: '0x2e9a...c73f', actor: 'System' },
    ],
  },
  {
    id: 'PROP-2024-005',
    surveyNumber: 'SRV/RJ/JPR/2024/5098',
    title: 'Luxury Villa Plot – Jagatpura',
    address: 'JDA Approved Colony, Jagatpura Extension',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    area: '3200 sq ft',
    areaValue: 3200,
    landType: 'Residential',
    price: 6400000,
    status: 'verified',
    owner: 'Priya Mathur',
    ownerId: 'USR-005',
    description: 'JDA approved luxury villa plot in a premium gated community. Parks, club house, and 24/7 security available.',
    images: ['#06b6d4', '#0891b2', '#0e7490'],
    documents: ['Title Deed', 'JDA Approval', 'Layout Map', 'NOC'],
    listedDate: '2024-11-01',
    verifiedDate: '2024-11-08',
    blockchainTxHash: '0x8a1f...d92c',
    blockchainHistory: [
      { date: '2024-11-01', event: 'Property Registered', hash: '0x8a1f...d92c', actor: 'Priya Mathur' },
      { date: '2024-11-04', event: 'Documents Uploaded', hash: '0x5c3b...a87e', actor: 'Priya Mathur' },
      { date: '2024-11-08', event: 'Verified by Officer', hash: '0x2d7e...f14c', actor: 'Officer Singh' },
      { date: '2024-11-15', event: 'Listed for Sale', hash: '0x9f4a...b63d', actor: 'Priya Mathur' },
    ],
  },
  {
    id: 'PROP-2024-006',
    surveyNumber: 'SRV/GJ/AMD/2024/6071',
    title: 'Mixed-Use Land – SG Highway',
    address: 'SG Highway, Near Iscon Cross Roads',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    area: '12000 sq ft',
    areaValue: 12000,
    landType: 'Commercial',
    price: 45000000,
    status: 'rejected',
    owner: 'Mehta Realty Group',
    ownerId: 'USR-006',
    description: 'Prime commercial land on SG Highway with high footfall area. Suitable for mall, showroom, or mixed-use development.',
    images: ['#ef4444', '#dc2626', '#b91c1c'],
    documents: ['Title Deed', 'NA Order'],
    listedDate: '2024-08-20',
    verifiedDate: null,
    blockchainTxHash: '0x4b9c...e51a',
    blockchainHistory: [
      { date: '2024-08-20', event: 'Property Registered', hash: '0x4b9c...e51a', actor: 'Mehta Realty' },
      { date: '2024-08-22', event: 'Documents Uploaded', hash: '0x1d6e...f83b', actor: 'Mehta Realty' },
      { date: '2024-08-28', event: 'Rejected – Incomplete Documents', hash: '0x7a2c...b94d', actor: 'Officer Joshi' },
    ],
  },
];

// ────────────────────────────────────────
// Users
// ────────────────────────────────────────
export const users = [
  { id: 'USR-001', name: 'Rajesh Kumar Sharma', email: 'rajesh@example.com', role: 'seller', status: 'verified', joinDate: '2024-06-15', properties: 3 },
  { id: 'USR-002', name: 'Anita Deshmukh', email: 'anita@example.com', role: 'seller', status: 'verified', joinDate: '2024-07-22', properties: 1 },
  { id: 'USR-003', name: 'Suresh Yadav', email: 'suresh@example.com', role: 'seller', status: 'verified', joinDate: '2024-05-10', properties: 2 },
  { id: 'USR-004', name: 'Vikram Industries Pvt Ltd', email: 'vikram@example.com', role: 'seller', status: 'verified', joinDate: '2024-03-01', properties: 5 },
  { id: 'USR-005', name: 'Priya Mathur', email: 'priya@example.com', role: 'buyer', status: 'verified', joinDate: '2024-08-12', properties: 0 },
  { id: 'USR-006', name: 'Mehta Realty Group', email: 'mehta@example.com', role: 'seller', status: 'pending', joinDate: '2024-09-05', properties: 1 },
  { id: 'USR-007', name: 'Amit Patel', email: 'amit@example.com', role: 'buyer', status: 'verified', joinDate: '2024-04-18', properties: 2 },
  { id: 'USR-008', name: 'Officer Patel', email: 'officer.patel@gov.in', role: 'officer', status: 'verified', joinDate: '2024-01-10', properties: 0 },
  { id: 'USR-009', name: 'Admin Verma', email: 'admin@gov.in', role: 'admin', status: 'verified', joinDate: '2023-11-01', properties: 0 },
];

// ────────────────────────────────────────
// Dashboard Statistics
// ────────────────────────────────────────
export const sellerStats = {
  totalProperties: 5,
  pendingVerification: 2,
  listedForSale: 3,
  transferRequests: 1,
  recentActivity: [
    { id: 1, action: 'Property PROP-2024-001 listed for sale', time: '2 hours ago', type: 'listing' },
    { id: 2, action: 'Transfer request received for PROP-2024-004', time: '5 hours ago', type: 'transfer' },
    { id: 3, action: 'Documents uploaded for PROP-2024-002', time: '1 day ago', type: 'document' },
    { id: 4, action: 'Property PROP-2024-005 verified by officer', time: '2 days ago', type: 'verified' },
    { id: 5, action: 'New property PROP-2024-002 registered', time: '3 days ago', type: 'registration' },
  ],
};

export const buyerStats = {
  searchProperties: 142,
  purchaseRequests: 3,
  ownedProperties: 2,
  walletBalance: 5000000,
  notifications: [
    { id: 1, message: 'Your purchase request for PROP-2024-001 is under review', time: '1 hour ago', read: false },
    { id: 2, message: 'Property PROP-2024-005 price reduced by 10%', time: '3 hours ago', read: false },
    { id: 3, message: 'Transfer for PROP-2024-003 completed successfully', time: '1 day ago', read: true },
    { id: 4, message: 'New properties listed in Pune matching your search', time: '2 days ago', read: true },
  ],
};

export const officerStats = {
  pendingUserVerification: 12,
  pendingPropertyVerification: 8,
  pendingTransfers: 5,
  disputes: 3,
  blockchainActivity: [
    { id: 1, action: 'Property PROP-2024-002 verification pending', time: '30 min ago', status: 'pending' },
    { id: 2, action: 'User USR-006 verification pending', time: '1 hour ago', status: 'pending' },
    { id: 3, action: 'Transfer PROP-2024-004 approved', time: '3 hours ago', status: 'approved' },
    { id: 4, action: 'Dispute #D-2024-003 investigation ongoing', time: '1 day ago', status: 'investigating' },
    { id: 5, action: 'Property PROP-2024-001 verified', time: '2 days ago', status: 'completed' },
  ],
};

export const adminStats = {
  totalUsers: 1247,
  verifiedUsers: 1089,
  governmentOfficers: 24,
  pendingTransfers: 18,
  blockchainStatus: 'Healthy',
  blockchainBlocks: 15482,
  auditLogs: [
    { id: 1, action: 'Officer Patel verified property PROP-2024-005', user: 'Officer Patel', time: '2 hours ago', level: 'info' },
    { id: 2, action: 'New officer registration: Officer Kumar', user: 'Admin', time: '5 hours ago', level: 'info' },
    { id: 3, action: 'Failed login attempt for admin@gov.in', user: 'System', time: '8 hours ago', level: 'warning' },
    { id: 4, action: 'Blockchain node sync completed', user: 'System', time: '12 hours ago', level: 'success' },
    { id: 5, action: 'Property PROP-2024-006 rejected by officer', user: 'Officer Joshi', time: '1 day ago', level: 'warning' },
    { id: 6, action: 'System backup completed successfully', user: 'System', time: '1 day ago', level: 'success' },
  ],
};

// ────────────────────────────────────────
// Filter Options
// ────────────────────────────────────────
export const states = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu', 'Rajasthan', 'Gujarat', 'Delhi', 'Telangana'];
export const cities = ['Pune', 'Bangalore', 'Greater Noida', 'Chennai', 'Jaipur', 'Ahmedabad', 'Mumbai', 'Hyderabad'];
export const landTypes = ['Residential', 'Commercial', 'Agricultural', 'Industrial'];
export const priceRanges = [
  { label: 'Under ₹50 Lakh', min: 0, max: 5000000 },
  { label: '₹50 Lakh – ₹1 Cr', min: 5000000, max: 10000000 },
  { label: '₹1 Cr – ₹3 Cr', min: 10000000, max: 30000000 },
  { label: 'Above ₹3 Cr', min: 30000000, max: Infinity },
];

// ────────────────────────────────────────
// Features for Landing Page
// ────────────────────────────────────────
export const features = [
  {
    title: 'Immutable Records',
    description: 'Every land record is stored on the blockchain, making it tamper-proof and permanently verifiable.',
    icon: 'shield',
  },
  {
    title: 'Instant Verification',
    description: 'Government officers can verify property ownership and documents in minutes, not weeks.',
    icon: 'check',
  },
  {
    title: 'Transparent Transfers',
    description: 'Property transfers are recorded in real time with complete audit trails visible to all parties.',
    icon: 'transfer',
  },
  {
    title: 'Fraud Prevention',
    description: 'Blockchain consensus mechanisms eliminate duplicate registrations and fraudulent claims.',
    icon: 'lock',
  },
  {
    title: 'Digital Documents',
    description: 'Upload and manage all property documents digitally with encrypted storage and easy retrieval.',
    icon: 'document',
  },
  {
    title: 'Smart Contracts',
    description: 'Automated contract execution ensures seamless, condition-based property transfers.',
    icon: 'code',
  },
];

export const howItWorks = [
  { step: 1, title: 'Register & Verify', description: 'Create your account, select your role, and complete identity verification through the government portal.' },
  { step: 2, title: 'List Your Property', description: 'Submit property details, upload documents, and the data is recorded on the blockchain.' },
  { step: 3, title: 'Government Verification', description: 'Designated officers verify documents and approve the property listing on-chain.' },
  { step: 4, title: 'Search & Purchase', description: 'Buyers search verified properties, submit purchase requests, and initiate smart-contract transfers.' },
  { step: 5, title: 'Secure Transfer', description: 'Once approved, ownership transfers automatically via blockchain with an immutable record.' },
];

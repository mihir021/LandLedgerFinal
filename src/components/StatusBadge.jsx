/** StatusBadge — light theme pill for property/user/request status */
const STATUS_CONFIG = {
  // Property lifecycle
  verified:           { label: 'Verified',          cls: 'status-verified'  },
  pending:            { label: 'Pending',           cls: 'status-pending'   },
  pending_verify:     { label: 'Pending Review',    cls: 'status-pending'   },
  pending_verification: { label: 'Pending Review',    cls: 'status-pending'   },
  rejected:           { label: 'Rejected',          cls: 'status-rejected'  },
  draft:              { label: 'Draft',             cls: 'status-draft'     },
  listed:             { label: 'Listed',            cls: 'status-listed'    },
  under_transfer:     { label: 'Under Transfer',    cls: 'status-transfer'  },
  transferred:        { label: 'Transferred',       cls: 'status-completed' },
  requested:          { label: 'Transfer Req.',     cls: 'status-transfer'  },
  transfer_requested: { label: 'Transfer Req.',     cls: 'status-transfer'  },
  seller_approved:    { label: 'Seller Approved',   cls: 'status-transfer'  },
  buyer_signed:       { label: 'Buyer Signed',      cls: 'status-transfer'  },
  officer_approved:   { label: 'Officer Approved',  cls: 'status-transfer'  },
  ownership_updated:  { label: 'Ownership Updated', cls: 'status-transfer'  },
  chain_processing:   { label: 'Processing',        cls: 'status-pending'   },
  completed:          { label: 'Completed',         cls: 'status-completed' },
  // Transfer statuses as stored in the DB
  pendingRequest:     { label: 'Pending Confirmation', cls: 'status-pending' },
  pending_request:    { label: 'Pending Confirmation', cls: 'status-pending' },
  Initiated:          { label: 'Transfer Requested',   cls: 'status-transfer'  },
  'Pending Verification': { label: 'Pending Verification', cls: 'status-pending' },
  Approved:           { label: 'Approved',          cls: 'status-verified'  },
  Rejected:           { label: 'Rejected',          cls: 'status-rejected'  },
  failed:             { label: 'Failed',            cls: 'status-rejected'  },
  Failed:             { label: 'Failed',            cls: 'status-rejected'  },
  sellerApproved:     { label: 'Seller Approved',   cls: 'status-transfer'  },
  buyerApproved:      { label: 'Buyer Signed',      cls: 'status-transfer'  },
  officerApproved:    { label: 'Officer Approved',  cls: 'status-transfer'  },
  'in-progress':      { label: 'In Progress',       cls: 'status-listed'    },
  closed:             { label: 'Closed',            cls: 'status-draft'     },
  pending:            { label: 'Pending',           cls: 'status-pending'   },
  // User KYC
  kyc_verified:       { label: 'KYC Verified',      cls: 'status-verified'  },
  kyc_pending:        { label: 'KYC Pending',       cls: 'status-pending'   },
  kyc_rejected:       { label: 'KYC Rejected',      cls: 'status-rejected'  },
  active:             { label: 'Active',            cls: 'status-verified'  },
  inactive:           { label: 'Inactive',          cls: 'status-draft'     },
  suspended:          { label: 'Suspended',         cls: 'status-rejected'  },
  // Disputes
  open:               { label: 'Open',              cls: 'status-transfer'  },
  resolved:           { label: 'Resolved',          cls: 'status-verified'  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'status-draft' };
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`${cfg.cls} ${sizeClass} inline-flex items-center rounded-full font-semibold tracking-wide`}>
      {cfg.label}
    </span>
  );
}

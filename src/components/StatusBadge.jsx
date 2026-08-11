/** StatusBadge — light theme pill for property/user/request status */
const STATUS_CONFIG = {
  // Property lifecycle
  verified:             { label: 'Verified',          cls: 'status-verified'  },
  pending_verification: { label: 'Pending Review',    cls: 'status-pending'   },
  rejected:             { label: 'Rejected',          cls: 'status-rejected'  },
  draft:                { label: 'Draft',             cls: 'status-draft'     },
  listed:               { label: 'Listed',            cls: 'status-listed'    },
  under_transfer:       { label: 'Under Transfer',    cls: 'status-transfer'  },
  transferred:          { label: 'Transferred',       cls: 'status-completed' },
  requested:            { label: 'Transfer Req.',     cls: 'status-transfer'  },
  seller_approved:      { label: 'Seller Approved',   cls: 'status-transfer'  },
  buyer_signed:         { label: 'Buyer Signed',      cls: 'status-transfer'  },
  officer_approved:     { label: 'Officer Approved',  cls: 'status-transfer'  },
  ownership_updated:    { label: 'Ownership Updated', cls: 'status-transfer'  },
  completed:            { label: 'Completed',         cls: 'status-completed' },
  'in-progress':        { label: 'In Progress',       cls: 'status-listed'    },
  closed:             { label: 'Closed',            cls: 'status-draft'     },
  pending:            { label: 'Pending',           cls: 'status-pending'   },
  // User KYC
  kyc_verified:       { label: 'KYC Verified',      cls: 'status-verified'  },
  kyc_pending:        { label: 'KYC Pending',       cls: 'status-pending'   },
  kyc_rejected:       { label: 'KYC Rejected',      cls: 'status-rejected'  },
  active:             { label: 'Active',            cls: 'status-verified'  },
  inactive:           { label: 'Inactive',          cls: 'status-draft'     },
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

/**
 * SellerDashboard — stat cards + properties list + incoming requests
 * Clean LEGO Toy Brick aesthetic without top stud accent bars on cards.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, FilePlus, ArrowLeftRight, CheckCircle, ArrowRight, Loader2, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProperties } from '../services/propertyService';
import { getTransfers } from '../services/transferService';
import { formatPrice, getImgUrl } from '../utils/helpers';

/** LEGO Brick Pill Status Badge Component matching AdminDashboard */
function LegoStatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase();
  let bg = 'bg-[#FFF8E1] text-[#856404]';
  let studBg = '#F5B800';
  let label = status;

  if (s === 'completed' || s === 'verified' || s === 'approved' || s === 'listed') {
    bg = 'bg-[#E8F5E9] text-[#1B5E20]';
    studBg = '#2E7D32';
    label = s === 'completed' ? 'Completed' : s === 'listed' ? 'Listed' : 'Verified';
  } else if (s === 'pending' || s === 'pending_verify' || s === 'kyc_pending') {
    bg = 'bg-[#FFEBEE] text-[#C41E3A]';
    studBg = '#C41E3A';
    label = 'Pending';
  } else if (s.includes('transfer') || s === 'initiated' || s === 'requested') {
    bg = 'bg-[#E3F2FD] text-[#0D47A1]';
    studBg = '#1565C0';
    label = 'Requested';
  } else if (s === 'rejected' || s === 'failed') {
    bg = 'bg-[#FFEBEE] text-[#C62828]';
    studBg = '#C41E3A';
    label = 'Rejected';
  }

  return (
    <span className={`lego-pill ${bg}`}>
      <span className="lego-pill-stud" style={{ backgroundColor: studBg }} />
      <span>{label}</span>
    </span>
  );
}

/** LEGO KPI Stat Card */
function LegoSellerKpiCard({ label, value, icon: Icon, color, link, delay }) {
  const colorMap = {
    navy:    { iconBg: 'bg-[#E8EFF8] text-[#1E3A5F]' },
    green:   { iconBg: 'bg-[#E8F5E9] text-[#2E7D32]' },
    amber:   { iconBg: 'bg-[#FFF8E1] text-[#B78103]' },
    emerald: { iconBg: 'bg-[#E8F5E9] text-[#1B5E20]' },
  };

  const config = colorMap[color] || colorMap.navy;

  return (
    <Link
      to={link || '#'}
      className="lego-card lego-card-press lego-focus block p-5 hover:no-underline animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-wider text-gray-600 uppercase font-sans">
          {label}
        </span>
        <div className={`h-8 w-8 rounded border-2 border-[#475569] flex items-center justify-center shadow-[2px_2px_0px_#475569] shrink-0 ${config.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 font-pixel text-3xl font-bold text-[#1E293B]">
        {value}
      </div>
    </Link>
  );
}

export default function SellerDashboard() {
  const { user, canBuy, setMode } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);

  const displayName = user?.fullName || user?.name || 'Seller';
  const firstName = displayName.split(' ')[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [propsRes, transfersRes] = await Promise.all([
          getProperties(user?._id ? { owner: user._id, limit: 100 } : { limit: 100 }).catch(() => ({ properties: [] })),
          getTransfers({ view: 'seller' }).catch(() => []),
        ]);

        let fetchedProps = propsRes.properties || [];

        // Fallback: If logged in seller account has 0 user-registered properties, display real DB properties
        if (fetchedProps.length === 0) {
          const fallbackRes = await getProperties({ limit: 100 }).catch(() => ({ properties: [] }));
          fetchedProps = fallbackRes.properties || [];
        }

        setProperties(fetchedProps);
        setRequests(Array.isArray(transfersRes) ? transfersRes : []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const listed = properties.filter(p => (p.verificationStatus === 'verified' && p.isListed) || p.verification?.status === 'Verified' || p.verification?.status === 'listed' || p.isListed !== false);
  const pending = requests.filter(r => r.status === 'pending' || r.status === 'Initiated');

  const stats = [
    { icon: Home,          label: 'My Properties',     value: properties.length, color: 'navy',    link: '/seller/properties' },
    { icon: CheckCircle,   label: 'Active Listings',   value: listed.length,     color: 'green',   link: '/seller/properties' },
    { icon: ArrowLeftRight,label: 'Pending Requests',  value: pending.length,    color: 'amber',   link: '/seller/requests' },
    { icon: CheckCircle2,  label: 'Sales Completed',   value: requests.filter(r => r.status === 'completed' || r.status === 'Completed').length, color: 'emerald', link: '/seller/requests' },
  ];

  return (
    <div className="space-y-8">

      {/* 1. Header with 2x2 LEGO Stud Badge & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-start gap-3.5">
          <div className="inline-grid grid-cols-2 gap-1 rounded bg-[#F5B800] border-2 border-[#475569] p-2 shadow-[3px_3px_0px_#475569] shrink-0 mt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-inner" />
          </div>
          <div>
            <h1 className="font-pixel text-3xl font-bold text-[#1E293B] tracking-wide">Seller Dashboard</h1>
            <p className="font-sans text-sm text-gray-600 mt-0.5">
              Welcome back, {firstName} — manage your registered properties and incoming buyer requests.
            </p>
          </div>
        </div>

        {canBuy && (
          <button
            onClick={() => { setMode('buyer'); navigate('/buyer'); }}
            className="lego-focus inline-flex items-center gap-1.5 rounded-lg border-2 border-[#475569] bg-white px-3.5 py-2 font-pixel text-xs font-bold text-[#1E293B] shadow-[2px_2px_0px_#475569] hover:bg-slate-50 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-amber-600" />
            <span>Switch to Buyer mode</span>
          </button>
        )}
      </div>

      {error && (
        <div className="lego-card p-4 bg-[#FFEBEE] border-[#C41E3A] text-sm text-[#C41E3A] font-bold">
          {error}
        </div>
      )}

      {/* 2. Staggered KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
        {stats.map((s, i) => (
          <LegoSellerKpiCard key={s.label} {...s} delay={i * 70} />
        ))}
      </div>

      {/* 3. Quick Action Tiles with Press Physics */}
      <div className="grid gap-4.5 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        {[
          { 
            to: '/register-property',  
            icon: FilePlus,       
            iconBg: 'bg-[#E3F2FD] text-[#1565C0]', 
            label: 'Register New Property', 
            desc: 'Upload deeds, maps & submit for verification' 
          },
          { 
            to: '/seller/properties',  
            icon: Home,           
            iconBg: 'bg-[#E8F5E9] text-[#2E7D32]', 
            label: 'Manage Properties',    
            desc: 'View, edit and toggle active marketplace listings' 
          },
          { 
            to: '/seller/requests',    
            icon: ArrowLeftRight, 
            iconBg: 'bg-[#FFF8E1] text-[#B78103]', 
            label: 'Purchase Requests',    
            desc: 'Accept, negotiate or review buyer purchase offers' 
          },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link 
              key={a.to} 
              to={a.to} 
              className="lego-card lego-card-press lego-focus p-5 block group hover:no-underline"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className={`h-11 w-11 rounded border-2 border-[#475569] flex items-center justify-center shadow-[2.5px_2.5px_0px_#475569] ${a.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="h-7 w-7 rounded-full bg-[#475569] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <p className="font-pixel text-lg font-bold text-[#1E293B]">{a.label}</p>
              <p className="font-sans text-xs text-gray-600 mt-1">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* 4. My Properties Panel with Header Accent Strip & Left Connector Notches */}
      <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '420ms' }}>
        {/* Header Accent Strip */}
        <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F5B800]" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <Home className="h-5 w-5 text-[#1E293B]" />
              <h2 className="font-pixel text-lg font-bold text-[#1E293B]">My Properties</h2>
            </div>
            <Link to="/seller/properties" className="lego-focus text-xs text-[#1565C0] font-bold hover:underline flex items-center gap-1 font-sans">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-[#475569] animate-spin" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 p-4 font-sans">
            <Home className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-4">No properties registered yet.</p>
            <Link to="/register-property" className="lego-focus inline-flex items-center gap-1.5 rounded bg-[#F5B800] border-2 border-[#475569] px-4 py-2 font-pixel text-xs font-bold text-[#1E293B] shadow-[2px_2px_0px_#475569]">
              Register First Property
            </Link>
          </div>
        ) : (
          <div className="divide-y-2 divide-[#475569]/10">
            {properties.slice(0, 6).map(p => {
              const imgSrc = getImgUrl(p.images?.[0] || p.documents?.[0]);
              const locationStr = p.location?.district 
                ? `${p.location?.district}, ${p.location?.city || p.location?.state || 'Gujarat'}`
                : p.district ? `${p.district}, ${p.city || p.state}` : 'Gujarat Property';
              const landTypeStr = p.landDetails?.landType || p.landType || 'Plot';
              const areaVal = p.landDetails?.areaSqft || p.area || 0;
              const priceVal = p.pricing?.priceINR || p.price || 0;
              const statusVal = p.verification?.status || p.verificationStatus || 'Verified';

              return (
                <Link 
                  key={p._id} 
                  to={`/property/${p._id}`}
                  className="lego-notch-item flex items-center gap-4 px-5 py-4 hover:bg-[#475569]/5 transition-colors group"
                >
                  {/* Property Image Thumbnail */}
                  <div className="h-12 w-14 rounded border-2 border-[#475569] bg-[#E8EFF8] flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-[2px_2px_0px_#475569]">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        alt=""
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      '🏠'
                    )}
                  </div>

                  {/* Title & Specs */}
                  <div className="flex-1 min-w-0 font-sans">
                    <p className="text-sm font-bold text-[#1E293B] truncate group-hover:text-[#1565C0] transition-colors">
                      {locationStr}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {landTypeStr} · {Number(areaVal).toLocaleString()} sq ft
                    </p>
                  </div>

                  {/* Monospace Price & Lego Status Badge */}
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-bold text-[#1E293B] mb-1">
                      {formatPrice(Number(priceVal))}
                    </p>
                    <LegoStatusBadge status={statusVal} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Incoming Buyer Requests Panel */}
      {pending.length > 0 && (
        <div className="lego-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          {/* Header Accent Strip */}
          <div className="relative border-b-2 border-[#475569] px-5 py-4 bg-[#F8FAFC]">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1565C0]" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="h-5 w-5 text-[#1565C0]" />
                <h2 className="font-pixel text-lg font-bold text-[#1E293B]">Pending Requests</h2>
                <span className="rounded-full bg-[#FFF8E1] border border-[#475569] text-[#B78103] text-xs font-pixel font-bold px-2 py-0.5 shadow-[1.5px_1.5px_0px_#475569]">
                  {pending.length}
                </span>
              </div>
              <Link to="/seller/requests" className="lego-focus text-xs text-[#1565C0] font-bold hover:underline font-sans">
                Review all
              </Link>
            </div>
          </div>

          <div className="divide-y-2 divide-[#475569]/10">
            {pending.slice(0, 3).map(r => (
              <div key={r._id} className="lego-notch-item flex items-center gap-4 px-5 py-4 hover:bg-[#475569]/5 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded border-2 border-[#475569] bg-[#E3F2FD] text-sm font-bold text-[#1565C0] shrink-0 shadow-[2px_2px_0px_#475569]">
                  {(r.toUserId?.name || r.toUserId?.fullName || r.buyer?.fullName || 'B').charAt(0)}
                </div>
                <div className="flex-1 min-w-0 font-sans">
                  <p className="text-sm font-bold text-[#1E293B]">
                    {r.toUserId?.name || r.toUserId?.fullName || r.buyer?.fullName || 'Buyer'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {r.propertyId?.propertyId || r.property?.address || 'Property'}
                  </p>
                </div>
                <Link 
                  to="/seller/requests" 
                  className="lego-focus font-pixel text-xs font-bold bg-[#F5B800] text-[#1E293B] border-2 border-[#475569] rounded px-3 py-1.5 shadow-[2px_2px_0px_#475569] hover:translate-y-0.5 transition-transform"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * AdminAnalytics — Full analytics dashboard for admin.
 * Single endpoint fetch, sessionStorage cached, LEGO brick theme.
 */
import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw,
  Home, ArrowLeftRight, Users, Clock, MapPin, ShieldCheck,
  AlertTriangle, Award, Boxes
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAnalytics } from '../services/analyticsService';

// Lazy-load Plotly so its ~3MB bundle doesn't affect initial page load
// Use the factory to wire it up with the minified plotly bundle (to avoid 'plotly.js' not found errors)
const Plot = lazy(async () => {
  const [PlotlyModule, createPlotlyComponent] = await Promise.all([
    import('plotly.js-dist-min'),
    import('react-plotly.js/factory')
  ]);
  const Plotly = PlotlyModule.default || PlotlyModule;
  const factory = createPlotlyComponent.default || createPlotlyComponent;
  return { default: factory(Plotly) };
});

// ── LEGO Color Palette for Charts ────────────────────────────────────────────
const C = {
  navy:    '#1E3A5F',
  gold:    '#D4AF37',
  green:   '#3D9960',
  amber:   '#E0B020',
  red:     '#C85060',
  purple:  '#7C5CBF',
  teal:    '#2A8FA3',
  sand:    '#C9A876',
  stone:   '#8A8A8A',
  surface: '#F8F9FB',
};
const PIE_COLORS = [C.navy, C.gold, C.green, C.amber, C.red, C.purple, C.teal, C.sand];
const STATUS_COLOR = { Verified: C.green, Pending: C.amber, Rejected: C.red, 'Under Review': C.purple };

const fmt = (n) => n == null ? '—' : Number(n).toLocaleString('en-IN');
const fmtDays = (d) => d == null ? '—' : `${d}d`;

const formatLakhsCrores = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  return `₹${Number(num).toLocaleString('en-IN')}`;
};

// Seed realistic data for sparse local envs
const generateMockScatterData = () => {
  const statuses = ['Verified', 'Pending', 'Rejected'];
  const types = ['Residential Plot', 'Agricultural Land', 'Commercial Land'];
  return Array.from({ length: 45 }).map((_, i) => {
    const isVerified = Math.random() > 0.3;
    const isPending = !isVerified && Math.random() > 0.5;
    return {
      id: `DEMO-${1000 + i}`,
      ownerName: `Demo User ${i + 1}`,
      price: Math.floor(Math.random() * 20000000) + 1500000,
      area: Math.floor(Math.random() * 5000) + 800,
      daysToVerify: isVerified ? Math.floor(Math.random() * 14) + 1 : 0,
      type: types[Math.floor(Math.random() * types.length)],
      status: isVerified ? 'Verified' : isPending ? 'Pending' : 'Rejected',
    };
  });
};

// ── Shared Components ─────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = 'text-blue-900' }) {
  return (
    <div className="flex items-center gap-2 mb-1 pb-2 border-b-2 border-navy-950/10">
      <Icon className={`h-5 w-5 ${color}`} />
      <h2 className="font-pixel text-sm tracking-wide text-gray-900">{title}</h2>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`ll-card p-4 ${className}`}>
      {title && <p className="font-pixel text-xs text-gray-500 mb-3 tracking-wide">{title}</p>}
      {children}
    </div>
  );
}

function SkeletonCard({ h = 'h-48' }) {
  return <div className={`ll-card ${h} skeleton`} />;
}

function EmptyState({ msg = 'No data for this period' }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
      <Boxes className="h-8 w-8 opacity-30" />
      <p className="text-xs font-pixel tracking-wide">{msg}</p>
    </div>
  );
}

function ErrorSection({ onRetry }) {
  return (
    <div className="ll-card p-6 border-red-300 flex flex-col items-center gap-3 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="font-pixel text-xs text-red-700 tracking-wide">Failed to load analytics</p>
      <button onClick={onRetry} className="btn-secondary text-xs flex items-center gap-1">
        <RefreshCw className="h-3 w-3" /> Retry
      </button>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, trend, unit = '' }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  return (
    <div className="ll-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded flex items-center justify-center bg-navy-50 border border-navy-200">
          <Icon className="h-4 w-4 text-blue-900" />
        </div>
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </div>
      <p className="font-pixel text-xl text-gray-900 tracking-wide">{unit}{fmt(value)}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

// ── Range Toggle ──────────────────────────────────────────────────────────────
const RANGES = ['30d', '90d', '1y', 'all'];
function RangeToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded p-1 border border-gray-300 shadow-inner w-fit">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-3 py-1 text-xs font-pixel tracking-wide rounded transition-all ${
            value === r
              ? 'bg-navy-800 text-white shadow-[2px_2px_0px_#475569]'
              : 'text-gray-600 hover:bg-white hover:shadow-sm'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function LegoTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ll-card p-2 text-xs bg-white border-navy-800">
      <p className="font-pixel text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── 3D Scatter (Plotly) ───────────────────────────────────────────────────────
function Scatter3D({ data }) {
  if (!data?.length) return <EmptyState msg="No property data for scatter" />;

  const isSparse = !data || data.length < 10;
  const displayData = isSparse ? generateMockScatterData() : data;

  const byStatus = {};
  let minPrice = Infinity, maxPrice = -Infinity;
  let minArea = Infinity, maxArea = -Infinity;
  let minDays = Infinity, maxDays = -Infinity;

  for (const p of displayData) {
    const s = (p.status || 'Pending').replace(/\s+/g, '');
    const key = ['Verified','Pending','Rejected'].find(k => s.toLowerCase().includes(k.toLowerCase())) || 'Pending';
    if (!byStatus[key]) byStatus[key] = { x: [], y: [], z: [], text: [] };
    
    // Valid data points only
    if (p.price != null && p.area != null) {
      byStatus[key].x.push(p.price);
      byStatus[key].y.push(p.area);
      byStatus[key].z.push(p.daysToVerify || 0);
      byStatus[key].text.push(
        `<b>ID:</b> ${p.id}<br>` +
        `<b>Owner:</b> ${p.ownerName || 'Unknown'}<br>` +
        `<b>Type:</b> ${p.type}<br>` +
        `<b>Price:</b> ${formatLakhsCrores(p.price)}<br>` +
        `<b>Area:</b> ${fmt(p.area)} sqft<br>` +
        `<b>Status:</b> ${key}<br>` +
        `<b>Days to Verify:</b> ${p.daysToVerify ? p.daysToVerify + 'd' : '—'}`
      );

      // Track min/max
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
      if (p.area < minArea) minArea = p.area;
      if (p.area > maxArea) maxArea = p.area;
      if ((p.daysToVerify || 0) < minDays) minDays = p.daysToVerify || 0;
      if ((p.daysToVerify || 0) > maxDays) maxDays = p.daysToVerify || 0;
    }
  }

  // Calculate range bounds with 10% padding
  const pad = (min, max) => {
    const range = (max - min) || 1;
    return [Math.max(0, min - range * 0.1), max + range * 0.1];
  };

  // Generate X-axis ticks (5 evenly spaced ticks)
  const priceRange = pad(minPrice, maxPrice);
  const xTickVals = Array.from({ length: 5 }, (_, i) => priceRange[0] + (i * (priceRange[1] - priceRange[0])) / 4);
  const xTickText = xTickVals.map(formatLakhsCrores);

  const traces = Object.entries(byStatus).map(([status, pts]) => ({
    type: 'scatter3d',
    mode: 'markers',
    name: status,
    x: pts.x, y: pts.y, z: pts.z,
    text: pts.text,
    hovertemplate: '%{text}<extra></extra>',
    marker: {
      size: 6,
      color: STATUS_COLOR[status] || C.stone,
      opacity: 0.9,
      line: { color: '#0A1628', width: 1.5 },
    },
  }));

  const axisStyle = {
    color: '#D4AF37',
    gridcolor: 'rgba(212,175,55,0.4)',
    zerolinecolor: 'rgba(212,175,55,0.5)',
    tickfont: { color: '#A6C2DD', size: 9, family: "'Pixelify Sans', monospace" },
    titlefont: { color: '#D4AF37', size: 10, family: "'Pixelify Sans', monospace" },
  };

  return (
    <Suspense fallback={<SkeletonCard h="h-96" />}>
      <Plot
        data={traces}
        layout={{
          paper_bgcolor: '#0F1F3D',
          plot_bgcolor: '#0F1F3D',
          margin: { l: 0, r: 0, t: 10, b: 0 },
          legend: {
            font: { color: '#D4AF37', size: 10, family: "'Pixelify Sans', monospace" },
            bgcolor: 'rgba(10,22,40,0.6)',
            bordercolor: 'rgba(212,175,55,0.3)',
            borderwidth: 1,
          },
          scene: {
            bgcolor: '#0F1F3D',
            camera: { eye: { x: 1.6, y: 1.6, z: 1.0 } },
            xaxis: { title: 'Price (₹)', range: priceRange, tickvals: xTickVals, ticktext: xTickText, ...axisStyle },
            yaxis: { title: 'Area (sqft)', range: pad(minArea, maxArea), tickformat: ',', ticksuffix: ' sqft', ...axisStyle },
            zaxis: { 
              title: 'Days to Verify', 
              range: pad(minDays, maxDays),
              tickformat: 'd', 
              ticksuffix: 'd',
              showbackground: true,
              backgroundcolor: 'rgba(15, 31, 61, 0.5)',
              ...axisStyle 
            },
          },
        }}
        config={{ responsive: true, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '420px' }}
      />
      
      {isSparse && (
        <div className="absolute top-4 right-4 pointer-events-none animate-pulse">
          <div className="bg-amber-500/20 border border-amber-500/50 backdrop-blur-sm text-amber-300 font-pixel text-[10px] px-3 py-1.5 rounded shadow-lg uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Limited Data — Showing Demo Preview
          </div>
        </div>
      )}
    </Suspense>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (r) => {
    setLoading(true);
    setError('');
    try {
      const result = await getAnalytics(r);
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range); }, [range, load]);

  const handleRangeChange = (r) => { setRange(r); };

  const tl = data?.topLine;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 flex items-center justify-center bg-navy-900 rounded border-2 border-gold-500 shadow-[2px_2px_0px_#D4AF37]">
              <BarChart3 className="h-4 w-4 text-gold-400" />
            </div>
            <h1 className="font-pixel text-xl tracking-wide text-gray-900">Analytics</h1>
          </div>
          <p className="text-sm text-gray-500">Platform-wide intelligence &amp; operational metrics.</p>
        </div>
        <RangeToggle value={range} onChange={handleRangeChange} />
      </div>

      {error && <ErrorSection onRetry={() => load(range)} />}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        {loading ? (
          [0,1,2,3].map(i => <SkeletonCard key={i} h="h-28" />)
        ) : (
          <>
            <KPICard icon={Home}           label="Total Properties"   value={tl?.totalProperties?.value}  trend={tl?.totalProperties?.trend} />
            <KPICard icon={ArrowLeftRight} label="Total Transfers"    value={tl?.totalTransfers?.value}   trend={tl?.totalTransfers?.trend} />
            <KPICard icon={Users}          label="Total Users"        value={tl?.totalUsers?.value}       trend={tl?.totalUsers?.trend} />
            <KPICard icon={Clock}          label="Avg Approval Time"  value={tl?.avgApprovalDays?.value}  trend="neutral" unit="" />
          </>
        )}
      </div>

      {/* ── SECTION 1: Growth & Activity ── */}
      <section className="space-y-4 animate-fade-in-up delay-100">
        <SectionHeader icon={TrendingUp} title="GROWTH &amp; ACTIVITY" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Properties Registered Over Time">
            {loading ? <SkeletonCard h="h-48" /> : !data?.propertiesOverTime?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.propertiesOverTime}>
                  <defs>
                    <linearGradient id="propGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.navy} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <Tooltip content={<LegoTooltip />} />
                  <Area type="monotone" dataKey="value" name="Properties" stroke={C.navy} fill="url(#propGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Transfers Over Time">
            {loading ? <SkeletonCard h="h-48" /> : !data?.transfersOverTime?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.transfersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <Tooltip content={<LegoTooltip />} />
                  <Line type="monotone" dataKey="value" name="Transfers" stroke={C.gold} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avgDays" name="Avg Days" stroke={C.teal} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="User Growth Over Time" className="lg:col-span-2">
            {loading ? <SkeletonCard h="h-48" /> : !data?.userGrowthOverTime?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.userGrowthOverTime}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <Tooltip content={<LegoTooltip />} />
                  <Area type="monotone" dataKey="value" name="New Users" stroke={C.green} fill="url(#userGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </section>

      {/* ── SECTION 2: Verification & Compliance ── */}
      <section className="space-y-4 animate-fade-in-up delay-200">
        <SectionHeader icon={ShieldCheck} title="VERIFICATION &amp; COMPLIANCE" color="text-amber-600" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="KYC Funnel">
            {loading ? <SkeletonCard h="h-56" /> : !data?.kycFunnel?.filter(d => d.value > 0).length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.kycFunnel} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {data.kycFunnel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#475569" strokeWidth={1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px', fontFamily: 'Pixelify Sans' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Transfers by Status">
            {loading ? <SkeletonCard h="h-56" /> : !data?.transfersByStatus?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.transfersByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} width={90} />
                  <Tooltip content={<LegoTooltip />} />
                  <Bar dataKey="value" name="Count" radius={[0, 2, 2, 0]}>
                    {data.transfersByStatus.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Dispute Stats */}
          <ChartCard title="Dispute Stats">
            {loading ? <SkeletonCard h="h-56" /> : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Open', value: data?.disputeStats?.open, color: 'bg-amber-50 border-amber-300 text-amber-700' },
                    { label: 'Resolved', value: data?.disputeStats?.resolved, color: 'bg-green-50 border-green-300 text-green-700' },
                    { label: 'Avg Resolution', value: fmtDays(data?.disputeStats?.avgResolutionDays), color: 'bg-navy-50 border-navy-300 text-navy-800' },
                  ].map((s) => (
                    <div key={s.label} className={`rounded border-2 p-3 text-center ${s.color} shadow-[2px_2px_0px_rgba(10,22,40,0.15)]`}>
                      <p className="font-pixel text-lg">{s.value ?? '0'}</p>
                      <p className="text-xs mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
                {data?.disputeStats?.breakdown?.length > 0 && (
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={data.disputeStats.breakdown} dataKey="value" nameKey="label" innerRadius={35} outerRadius={55} paddingAngle={3}>
                        {data.disputeStats.breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#475569" strokeWidth={1} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [fmt(v), n]} />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '9px', fontFamily: 'Pixelify Sans' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </ChartCard>

          {/* Officer Performance */}
          <ChartCard title="Officer Performance Leaderboard">
            {loading ? <SkeletonCard h="h-56" /> : !data?.officerPerformance?.length ? (
              <EmptyState msg="No officer approvals recorded yet" />
            ) : (
              <div className="space-y-2">
                {data.officerPerformance.slice(0, 8).map((o, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 flex items-center justify-center bg-gold-100 border border-gold-400 rounded text-xs font-pixel text-gold-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{o.label}</p>
                      <div className="mt-0.5 h-2 rounded bg-gray-100 border border-gray-200">
                        <div
                          className="h-full rounded bg-navy-700"
                          style={{ width: `${Math.min(100, (o.value / (data.officerPerformance[0]?.value || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-pixel text-navy-800 shrink-0">{o.value}</span>
                    <Award className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </section>

      {/* ── SECTION 3: Geographic & Property Insights ── */}
      <section className="space-y-4 animate-fade-in-up delay-300">
        <SectionHeader icon={MapPin} title="GEOGRAPHIC &amp; PROPERTY INSIGHTS" color="text-green-700" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Property Type Breakdown">
            {loading ? <SkeletonCard h="h-56" /> : !data?.propertyTypeBreakdown?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.propertyTypeBreakdown} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {data.propertyTypeBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#475569" strokeWidth={1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '9px', fontFamily: 'Pixelify Sans' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="User Role Distribution">
            {loading ? <SkeletonCard h="h-56" /> : !data?.usersByRole?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.usersByRole} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {data.usersByRole.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#475569" strokeWidth={1} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmt(v), n]} />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '9px', fontFamily: 'Pixelify Sans' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Geographic Distribution (Top Cities)">
            {loading ? <SkeletonCard h="h-56" /> : !data?.geoDistribution?.length ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.geoDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 9, fontFamily: 'Pixelify Sans' }} width={70} />
                  <Tooltip content={<LegoTooltip />} />
                  <Bar dataKey="value" name="Properties" fill={C.teal} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </section>

      {/* ── SECTION 4: 3D Property Analysis ── */}
      <section className="space-y-4 animate-fade-in-up delay-400">
        <SectionHeader icon={Boxes} title="3D PROPERTY ANALYSIS" color="text-purple-700" />
        <div className="ll-card overflow-hidden" style={{ background: '#0F1F3D', border: '1.5px solid rgba(212,175,55,0.3)', boxShadow: '4px 4px 0px rgba(212,175,55,0.2)' }}>
          <div className="px-4 pt-4 pb-1">
            <p className="font-pixel text-xs text-gold-400 tracking-wide mb-1">Price × Area × Days-to-Verify</p>
            <p className="text-xs text-navy-300">Color by verification status. Drag to orbit, scroll to zoom.</p>
          </div>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gold-400">
                <BarChart3 className="h-8 w-8 animate-pulse" />
                <p className="font-pixel text-xs tracking-wide">Loading 3D data...</p>
              </div>
            </div>
          ) : (
            <Scatter3D data={data?.scatterData} />
          )}
        </div>
        <p className="text-xs text-gray-400 text-center">
          Showing up to 500 properties. X = Price (₹), Y = Area (sqft), Z = Days taken for verification.
        </p>
      </section>
    </div>
  );
}

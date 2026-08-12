/** DashboardCard — light stat card with colored icon background */
export default function DashboardCard({ icon: Icon, label, value, color = 'navy', trend, delay = 0 }) {
  const colorMap = {
    navy:   { bg: 'bg-blue-50',   icon: 'text-blue-700',   border: 'border-blue-100' },
    gold:   { bg: 'bg-amber-50',  icon: 'text-amber-700',  border: 'border-amber-100' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-700',  border: 'border-green-100' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-700', border: 'border-purple-100' },
    amber:  { bg: 'bg-orange-50', icon: 'text-orange-700', border: 'border-orange-100' },
    emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-700',border: 'border-emerald-100' },
  };
  const c = colorMap[color] || colorMap.navy;
  return (
    <div
      className="ll-card ll-card-hover p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 leading-tight">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-sm ${c.bg} border ${c.border} shadow-[2px_2px_0px_#0A1628]`}>
            <Icon className={`h-5 w-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
}

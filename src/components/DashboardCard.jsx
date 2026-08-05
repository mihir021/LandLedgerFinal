/**
 * DashboardCard Component
 * Reusable stat card with icon, value, label, and optional trend indicator.
 * Used across all dashboard pages.
 */
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function DashboardCard({ icon: Icon, label, value, trend, trendValue, color = 'blue', delay = 0 }) {
  /** Map color name to gradient and icon-bg classes */
  const colorMap = {
    blue:    { gradient: 'from-blue-500 to-blue-600',    bg: 'bg-blue-500/15', text: 'text-blue-400' },
    indigo:  { gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
    emerald: { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    amber:   { gradient: 'from-amber-500 to-amber-600',  bg: 'bg-amber-500/15', text: 'text-amber-400' },
    red:     { gradient: 'from-red-500 to-red-600',      bg: 'bg-red-500/15', text: 'text-red-400' },
    purple:  { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/15', text: 'text-purple-400' },
    cyan:    { gradient: 'from-cyan-500 to-cyan-600',    bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="glass-card group relative overflow-hidden p-6 transition-all duration-300 hover:border-white/20 hover:bg-glass-hover animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background accent glow */}
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${c.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`} />

      <div className="relative flex items-start justify-between">
        {/* Icon */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}>
          {Icon && <Icon className={`h-6 w-6 ${c.text}`} />}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend === 'up' ? <FiTrendingUp className="h-3.5 w-3.5" /> : <FiTrendingDown className="h-3.5 w-3.5" />}
            {trendValue}
          </div>
        )}
      </div>

      {/* Value & Label */}
      <div className="relative mt-4">
        <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm text-navy-400">{label}</p>
      </div>
    </div>
  );
}

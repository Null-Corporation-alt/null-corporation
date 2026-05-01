import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { hacksService, activityService } from '@/lib/supabase';
import { 
  Code2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#00f3ff', '#ff00ff', '#8b5cf6', '#22c55e', '#f97316'];
const RISK_COLORS = {
  low: '#22c55e',
  medium: '#f97316', 
  high: '#ef4444',
  critical: '#dc2626'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activityStats, setActivityStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hackStats, actStats, recent] = await Promise.all([
        hacksService.getStats(user.id),
        activityService.getStats(user.id),
        activityService.getRecent(user.id, 10)
      ]);
      setStats(hackStats);
      setActivityStats(actStats);
      setRecentActivity(recent);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryData = stats?.byCategory 
    ? Object.entries(stats.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  const riskData = stats?.byRiskLevel
    ? Object.entries(stats.byRiskLevel).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-wider text-white">
          PANEL DE <span className="text-cyan glow-cyan-subtle">CONTROL</span>
        </h1>
        <p className="text-sm text-white/40 tracking-wide">
          Bienvenido de vuelta, {user?.email?.split('@')[0] || 'operador'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Code2}
          label="TOTAL HACKS"
          value={stats?.total || 0}
          color="cyan"
        />
        <StatCard
          icon={Activity}
          label="ACTIVIDAD HOY"
          value={activityStats?.byDay?.[activityStats.byDay.length - 1]?.count || 0}
          color="magenta"
        />
        <StatCard
          icon={AlertTriangle}
          label="RIESGO CRÍTICO"
          value={stats?.byRiskLevel?.critical || 0}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="ACTIVOS"
          value={stats?.byStatus?.active || 0}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-card border border-cyan/10 rounded p-6">
          <h3 className="text-sm font-bold tracking-wider text-white/80 mb-6 flex items-center gap-2">
            <Activity size={16} className="text-cyan" />
            ACTIVIDAD SEMANAL
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityStats?.byDay || []}>
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10}
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#0f172a', 
                    border: '1px solid #00f3ff33',
                    borderRadius: '4px'
                  }}
                  labelFormatter={(date) => format(new Date(date), 'dd MMM yyyy')}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00f3ff" 
                  fillOpacity={1} 
                  fill="url(#colorActivity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-card border border-cyan/10 rounded p-6">
          <h3 className="text-sm font-bold tracking-wider text-white/80 mb-6 flex items-center gap-2">
            <Code2 size={16} className="text-magenta" />
            HACKS POR CATEGORÍA
          </h3>
          <div className="h-64 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f172a', 
                      border: '1px solid #ff00ff33',
                      borderRadius: '4px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-white/30">
                <Code2 size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Sin datos todavía</p>
              </div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-white/60">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="uppercase tracking-wider">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Risk Level & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-card border border-cyan/10 rounded p-6">
          <h3 className="text-sm font-bold tracking-wider text-white/80 mb-6 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            NIVELES DE RIESGO
          </h3>
          <div className="space-y-4">
            {['low', 'medium', 'high', 'critical'].map((level) => (
              <div key={level} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60 uppercase tracking-wider">{level}</span>
                  <span style={{ color: RISK_COLORS[level] }}>{stats?.byRiskLevel?.[level] || 0}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((stats?.byRiskLevel?.[level] || 0) / (stats?.total || 1)) * 100}%`,
                      backgroundColor: RISK_COLORS[level]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-card border border-cyan/10 rounded p-6">
          <h3 className="text-sm font-bold tracking-wider text-white/80 mb-6 flex items-center gap-2">
            <Clock size={16} className="text-cyan" />
            ACTIVIDAD RECIENTE
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-secondary/30 rounded border border-white/5 hover:border-cyan/20 transition-colors"
                >
                  <Zap size={14} className="text-cyan mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{activity.action}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/30">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    cyan: 'text-cyan border-cyan/20 bg-cyan/5',
    magenta: 'text-fuchsia-500 border-fuchsia-500/20 bg-fuchsia-500/5',
    red: 'text-red-500 border-red-500/20 bg-red-500/5',
    green: 'text-green-500 border-green-500/20 bg-green-500/5'
  };

  return (
    <div className={`p-5 rounded border ${colorClasses[color]} transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={20} />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs tracking-wider text-white/50">{label}</p>
    </div>
  );
}

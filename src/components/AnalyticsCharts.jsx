// frontend/src/components/AnalyticsCharts.jsx
// Reusable analytics charts component — used inside AdminDashboard

import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, RefreshCw } from 'lucide-react';

// ── Custom tooltip for bar chart ──────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-xs text-green-600 mt-0.5">
        {payload[0].value} complaint{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

// ── Custom tooltip for pie chart ──────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{name}</p>
      <p className="text-xs text-gray-500">{value} complaints</p>
    </div>
  );
};

// ── Custom pie label ───────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;   // hide label if slice is too small
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main AnalyticsCharts component ────────────────────────────────────────
export default function AnalyticsCharts() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await API.get('/admin/analytics');
      setData(res);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-6 h-64 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading chart...</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { monthlyData, statusData, totals } = data;

  // Calculate resolution rate for summary
  const resolutionRate = totals.total > 0
    ? Math.round((totals.resolved / totals.total) * 100)
    : 0;

  return (
    <div className="mb-8">

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-600" />
          Analytics Overview
        </h2>
        <button
          onClick={fetchAnalytics}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* ── Summary row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: 'Resolution Rate',
            value: `${resolutionRate}%`,
            sub:   `${totals.resolved} resolved`,
            color: 'text-green-600',
            bg:    'bg-green-50',
          },
          {
            label: 'Pending',
            value: totals.pending,
            sub:   'awaiting action',
            color: 'text-yellow-600',
            bg:    'bg-yellow-50',
          },
          {
            label: 'In Progress',
            value: totals.inProgress,
            sub:   'being handled',
            color: 'text-blue-600',
            bg:    'bg-blue-50',
          },
          {
            label: 'Total Reports',
            value: totals.total,
            sub:   'all time',
            color: 'text-gray-700',
            bg:    'bg-gray-50',
          },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-200`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Bar Chart — takes 3/5 width on large screens */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Complaints per Month
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Last 6 months</p>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthlyData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#f0fdf4' }} />
              <Bar
                dataKey="complaints"
                radius={[6, 6, 0, 0]}    // rounded top corners
                maxBarSize={48}
              >
                {/* Color each bar — darker for recent months */}
                {monthlyData.map((_, index) => {
                  const shades = [
                    '#86efac','#4ade80','#22c55e',
                    '#16a34a','#15803d','#166534',
                  ];
                  return <Cell key={index} fill={shades[index] || '#16a34a'} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — takes 2/5 width on large screens */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <PieIcon size={16} className="text-blue-600" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Status Distribution
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">All complaints</p>

          {totals.total === 0 ? (
            <div className="flex items-center justify-center h-52 text-gray-400">
              <div className="text-center">
                <PieIcon size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No data yet</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}    // donut hole
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={<PieLabel />}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend below the chart */}
              <div className="space-y-2 mt-2">
                {statusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-xs text-gray-600">{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">
                        {value}
                      </span>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {totals.total > 0
                          ? `${Math.round((value / totals.total) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
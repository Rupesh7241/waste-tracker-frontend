import { useEffect, useState, useCallback } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import {
  Users, ClipboardList, Clock, CheckCircle,
  AlertTriangle, X, Save, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AnalyticsCharts from '../components/AnalyticsCharts';

// ── Status update modal ────────────────────────────────────────────────────
function UpdateModal({ complaint, onClose, onSaved }) {
  const [status,     setStatus]     = useState(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '');
  const [adminNote,  setAdminNote]  = useState(complaint.adminNote  || '');
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await API.put(`/admin/complaints/${complaint._id}`, {
        status, assignedTo, adminNote,
      });
      toast.success('Complaint updated!');
      onSaved(data);
      onClose();
    } catch (err) {
      toast.error('Failed to update complaint');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-xl">

        {/* Modal header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Update Complaint
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {complaint.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          {/* Status buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <div className="flex gap-2">
              {['Pending', 'In Progress', 'Resolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    status === s
                      ? s === 'Pending'
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                        : s === 'In Progress'
                        ? 'bg-blue-100 border-blue-400 text-blue-800'
                        : 'bg-green-100 border-green-400 text-green-800'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Assign to */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assign to
            </label>
            <input
              type="text"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              placeholder="e.g. Team A, Ramesh Kumar"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Admin note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note for citizen (optional)
            </label>
            <textarea
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              rows={3}
              placeholder="e.g. Team dispatched, will arrive by Friday"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Save size={16} /> Save Changes</>
              }
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminDashboard ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');
  const [selected,   setSelected]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [compRes, statsRes] = await Promise.all([
        API.get('/admin/complaints'),
        API.get('/admin/stats'),
      ]);
      setComplaints(compRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaved = (updated) => {
    setComplaints(prev =>
      prev.map(c => c._id === updated._id ? updated : c)
    );
    API.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});
  };

  const statCards = stats ? [
    { label: 'Total Complaints', value: stats.totalComplaints, icon: ClipboardList, color: 'text-green-700  dark:text-green-400  bg-green-50  dark:bg-green-900/30'  },
    { label: 'Pending',          value: stats.pendingCount,    icon: Clock,         color: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' },
    { label: 'In Progress',      value: stats.inProgressCount, icon: AlertTriangle, color: 'text-blue-700   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/30'   },
    { label: 'Resolved',         value: stats.resolvedCount,   icon: CheckCircle,   color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Total Users',      value: stats.totalUsers,      icon: Users,         color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
  ] : [];

  const FILTERS  = ['All', 'Pending', 'In Progress', 'Resolved'];
  const displayed = filter === 'All'
    ? complaints
    : complaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      {selected && (
        <UpdateModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Manage and resolve all citizen complaints
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/users"
              className="flex items-center gap-2 px-4 py-2 border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            >
              <Users size={15} /> Manage Users
            </Link>
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 transition-colors"
              >
                <div className={`p-2.5 rounded-lg ${color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnalyticsCharts />

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {f}
              {f !== 'All' && stats && (
                <span className="ml-1 opacity-60">
                  ({f === 'Pending'     ? stats.pendingCount
                    : f === 'In Progress' ? stats.inProgressCount
                    : stats.resolvedCount})
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {displayed.length} complaint{displayed.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 dark:text-gray-500">
            Loading complaints...
          </div>

        ) : displayed.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center transition-colors">
            <CheckCircle className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No complaints in this category
            </p>
          </div>

        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {['Description','Location','Citizen','Date','Status','Assigned To','Action'].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {displayed.map(c => (
                    <tr
                      key={c._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-gray-800 dark:text-white truncate">
                          {c.description}
                        </p>
                        {c.adminNote && (
                          <p className="text-xs text-blue-500 truncate">
                            Note: {c.adminNote}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                        {c.location}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="text-gray-700 dark:text-gray-200 font-medium">
                          {c.user?.name || 'Unknown'}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">
                          {c.user?.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                        {c.assignedTo || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(c)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {displayed.map(c => (
                <div
                  key={c._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm flex-1 pr-3">
                      {c.description}
                    </p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {c.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    {c.user?.name} · {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  {c.assignedTo && (
                    <p className="text-xs text-green-700 dark:text-green-400 mb-3">
                      Assigned: {c.assignedTo}
                    </p>
                  )}
                  <button
                    onClick={() => setSelected(c)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
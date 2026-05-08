// frontend/src/pages/UserManagement.jsx

import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Users, ShieldCheck, UserCircle,
  Search, RefreshCw, Crown, UserMinus,
  AlertTriangle, X, Check,
} from 'lucide-react';

function stringToColor(str) {
  const colors = [
    '#16a34a','#2563eb','#7c3aed','#db2777',
    '#d97706','#0891b2','#dc2626','#059669',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ── Confirm modal ─────────────────────────────────────────────────────────
function ConfirmModal({ user, action, onConfirm, onCancel, loading }) {
  const isPromote = action === 'admin';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">

        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isPromote ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          {isPromote
            ? <Crown size={28} className="text-yellow-600 dark:text-yellow-400" />
            : <UserMinus size={28} className="text-red-500 dark:text-red-400" />
          }
        </div>

        <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center mb-1">
          {isPromote ? 'Promote to Admin' : 'Demote to User'}
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
          {isPromote
            ? `Give ${user.name} full admin access to the dashboard?`
            : `Remove admin privileges from ${user.name}?`
          }
        </p>

        {/* User info card */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            style={{ background: stringToColor(user.name) }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Warning */}
        <div className={`flex items-start gap-2 p-3 rounded-lg mb-5 text-xs ${
          isPromote
            ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            {isPromote
              ? 'Admins can view all complaints, update statuses, and manage users.'
              : 'This user will lose access to the admin dashboard immediately.'
            }
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
              isPromote
                ? 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white'
                : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white'
            }`}
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check size={16} /> Confirm</>
            }
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function UserManagement() {
  const { user: currentAdmin }      = useAuth();
  const [users,      setUsers]      = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected,   setSelected]   = useState(null);
  const [saving,     setSaving]     = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        u => u.name.toLowerCase().includes(q) ||
             u.email.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, roleFilter, users]);

  const handleRoleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await API.put(
        `/admin/users/${selected.user._id}/role`,
        { role: selected.action }
      );
      setUsers(prev =>
        prev.map(u =>
          u._id === selected.user._id
            ? { ...u, role: selected.action }
            : u
        )
      );
      toast.success(data.message, {
        icon: selected.action === 'admin' ? '👑' : '👤',
      });
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const totalUsers   = users.length;
  const adminCount   = users.filter(u => u.role === 'admin').length;
  const citizenCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      {selected && (
        <ConfirmModal
          user={selected.user}
          action={selected.action}
          onConfirm={handleRoleUpdate}
          onCancel={() => setSelected(null)}
          loading={saving}
        />
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Promote citizens to admin or revoke admin access
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Users', value: totalUsers,   icon: Users,       color: 'bg-green-50  dark:bg-green-900/30  text-green-700  dark:text-green-400'  },
            { label: 'Admins',      value: adminCount,   icon: ShieldCheck, color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
            { label: 'Citizens',    value: citizenCount, icon: UserCircle,  color: 'bg-blue-50   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400'   },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-3 transition-colors"
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

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all',   label: 'All',      count: totalUsers   },
              { value: 'user',  label: 'Citizens', count: citizenCount },
              { value: 'admin', label: 'Admins',   count: adminCount   },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setRoleFilter(f.value)}
                className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  roleFilter === f.value
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">({f.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading users...</p>
          </div>

        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center transition-colors">
            <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
          </div>

        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors">
            {filtered.map((u, index) => {
              const isMe    = u._id === currentAdmin?._id;
              const isAdmin = u.role === 'admin';

              return (
                <div
                  key={u._id}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index !== filtered.length - 1
                      ? 'border-b border-gray-100 dark:border-gray-700'
                      : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base flex-shrink-0"
                    style={{ background: stringToColor(u.name) }}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">
                        {u.name}
                      </span>
                      {isMe && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        isAdmin
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {u.email}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Joined {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                      {' · '}
                      {u.complaintCount} complaint{u.complaintCount !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Action */}
                  {isMe ? (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic flex-shrink-0">
                      (your account)
                    </span>
                  ) : isAdmin ? (
                    <button
                      onClick={() => setSelected({ user: u, action: 'user' })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    >
                      <UserMinus size={14} /> Demote
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelected({ user: u, action: 'admin' })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 text-xs font-medium hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors flex-shrink-0"
                    >
                      <Crown size={14} /> Promote
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
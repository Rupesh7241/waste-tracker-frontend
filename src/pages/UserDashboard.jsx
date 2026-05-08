// frontend/src/pages/UserDashboard.jsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import {
  AlertTriangle, CalendarCheck, CheckCircle,
  Clock, Plus, TrendingUp,
} from 'lucide-react';

export default function UserDashboard() {
  const { user }                    = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await API.get('/complaints/my');
        setComplaints(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const total      = complaints.length;
  const pending    = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved   = complaints.filter(c => c.status === 'Resolved').length;

  const statCards = [
    { label: 'Total Reports', value: total,      icon: TrendingUp,    color: 'bg-green-50  dark:bg-green-900/30  text-green-700  dark:text-green-400'  },
    { label: 'Pending',       value: pending,    icon: Clock,         color: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { label: 'In Progress',   value: inProgress, icon: AlertTriangle, color: 'bg-blue-50   dark:bg-blue-900/30   text-blue-700   dark:text-blue-400'   },
    { label: 'Resolved',      value: resolved,   icon: CheckCircle,   color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome banner */}
        <div className="bg-green-800 dark:bg-green-900 text-white rounded-2xl p-6 mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-green-200 dark:text-green-300 text-sm">
            Help keep your community clean. Report issues, schedule pickups,
            and track your complaints.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 transition-colors"
            >
              <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <Link
            to="/report"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 hover:border-green-400 dark:hover:border-green-500 hover:shadow-sm transition-all group"
          >
            <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 p-3 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
              <Plus size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
                Report a Garbage Issue
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload photo + location
              </p>
            </div>
          </Link>

          <Link
            to="/schedule"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all group"
          >
            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 p-3 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
              <CalendarCheck size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-white">
                Schedule Pickup
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Book a time slot
              </p>
            </div>
          </Link>
        </div>

        {/* Recent complaints header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Recent Complaints
          </h2>
          <Link
            to="/my-complaints"
            className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
          >
            View all →
          </Link>
        </div>

        {/* Complaint list */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            Loading...
          </div>

        ) : complaints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center transition-colors">
            <AlertTriangle className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No complaints yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Tap "Report a Garbage Issue" to get started.
            </p>
          </div>

        ) : (
          <div className="space-y-3">
            {complaints.slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-colors"
              >
                {/* Thumbnail */}
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt="complaint"
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                    {c.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {c.location}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>

                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
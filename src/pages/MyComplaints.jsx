import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';

const STEPS      = ['Pending', 'In Progress', 'Resolved'];
const STEP_PCT   = { 'Pending': 33, 'In Progress': 66, 'Resolved': 100 };
const STEP_COLOR = { 'Pending': 'bg-yellow-400', 'In Progress': 'bg-blue-500', 'Resolved': 'bg-green-500' };

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get('/complaints/my');
      setComplaints(data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await API.delete(`/complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
      toast.success('Complaint deleted');
    } catch (err) {
      toast.error('Could not delete complaint');
    }
  };

  const filters   = ['All', 'Pending', 'In Progress', 'Resolved'];
  const displayed = filter === 'All'
    ? complaints
    : complaints.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              My Complaints
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {complaints.length} total reports
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === f
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            Loading your complaints...
          </div>

        ) : displayed.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center transition-colors">
            <AlertTriangle className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No complaints found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Try a different filter or report a new issue.
            </p>
          </div>

        ) : (
          <div className="space-y-4">
            {displayed.map((c) => (
              <div
                key={c._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-sm dark:hover:shadow-gray-700/50 transition-all"
              >
                {/* Image */}
                {c.imageUrl && (
                  <img
                    src={c.imageUrl}
                    alt="complaint"
                    className="w-full h-40 object-cover"
                  />
                )}

                <div className="p-5">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-semibold text-gray-800 dark:text-white leading-snug">
                      {c.description}
                    </p>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {c.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User size={12} /> Assigned: {c.assignedTo}
                      </span>
                    )}
                  </div>

                  {/* Admin note */}
                  {c.adminNote && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 text-xs rounded-lg px-3 py-2 mb-4">
                      <strong>Note from admin:</strong> {c.adminNote}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="mb-1">
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                      {STEPS.map(s => (
                        <span
                          key={s}
                          className={
                            c.status === s
                              ? 'font-semibold text-gray-700 dark:text-gray-200'
                              : ''
                          }
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${STEP_COLOR[c.status]}`}
                        style={{ width: `${STEP_PCT[c.status]}%` }}
                      />
                    </div>
                  </div>

                  {/* Delete button */}
                  {c.status === 'Pending' && (
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="mt-3 flex items-center gap-1 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 size={13} /> Delete complaint
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
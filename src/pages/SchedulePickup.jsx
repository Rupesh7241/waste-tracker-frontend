// frontend/src/pages/SchedulePickup.jsx

import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { CalendarCheck, MapPin, Clock, Trash2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const TIME_SLOTS  = ['Morning (6am–10am)', 'Afternoon (12pm–4pm)', 'Evening (5pm–8pm)'];
const WASTE_TYPES = ['General', 'Recyclable', 'Hazardous', 'Organic'];

export default function SchedulePickup() {
  const [form, setForm] = useState({
    address: '', pickupDate: '', timeSlot: '', wasteType: 'General', notes: '',
  });
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);

  const fetchSchedules = async () => {
    try {
      const { data } = await API.get('/schedules/my');
      setSchedules(data);
    } catch (err) {
      toast.error('Could not load schedules');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/schedules', form);
      setSchedules([data, ...schedules]);
      setForm({ address: '', pickupDate: '', timeSlot: '', wasteType: 'General', notes: '' });
      toast.success('Pickup scheduled successfully! 📅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pickup?')) return;
    try {
      await API.delete(`/schedules/${id}`);
      setSchedules(schedules.filter(s => s._id !== id));
      toast.success('Pickup cancelled');
    } catch {
      toast.error('Could not cancel pickup');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Shared input classes
  const inputClass = `
    w-full border border-gray-300 dark:border-gray-600
    rounded-lg px-4 py-2.5 text-sm
    bg-white dark:bg-gray-700
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-green-500
  `;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Schedule a Pickup
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Book a garbage collection slot at your doorstep.
        </p>

        {/* ── Booking form ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 space-y-5 transition-colors"
        >

          {/* Address */}
          <div>
            <label className={labelClass}>
              <MapPin size={14} className="inline mr-1" /> Pickup Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
              placeholder="Your full address"
              className={inputClass}
            />
          </div>

          {/* Date + Time slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <CalendarCheck size={14} className="inline mr-1" /> Pickup Date
              </label>
              <input
                type="date"
                min={today}
                value={form.pickupDate}
                onChange={e => setForm({ ...form, pickupDate: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Clock size={14} className="inline mr-1" /> Time Slot
              </label>
              <select
                value={form.timeSlot}
                onChange={e => setForm({ ...form, timeSlot: e.target.value })}
                required
                className={inputClass}
              >
                <option value="">Select a slot</option>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Waste type pills */}
          <div>
            <label className={labelClass}>Waste Type</label>
            <div className="flex flex-wrap gap-2">
              {WASTE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, wasteType: type })}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.wasteType === type
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Any special instructions for the collection team..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><CalendarCheck size={18} /> Book Pickup</>
            )}
          </button>
        </form>

        {/* ── My scheduled pickups ── */}
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          My Scheduled Pickups
        </h2>

        {fetching ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">
            Loading...
          </p>

        ) : schedules.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">
            No pickups scheduled yet.
          </p>

        ) : (
          <div className="space-y-4">
            {schedules.map(s => (
              <div
                key={s._id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={s.status} />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {s.wasteType} waste
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {s.address}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(s.pickupDate).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {' · '}
                    {s.timeSlot}
                  </p>
                  {s.notes && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                      "{s.notes}"
                    </p>
                  )}
                </div>

                {s.status === 'Scheduled' && (
                  <button
                    onClick={() => handleCancel(s._id)}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors flex-shrink-0"
                    title="Cancel pickup"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
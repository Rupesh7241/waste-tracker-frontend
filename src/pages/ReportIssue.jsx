// frontend/src/pages/ReportIssue.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { Upload, MapPin, FileText, Send, X } from 'lucide-react';

export default function ReportIssue() {
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ description: '', location: '' });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setImage(null); setPreview(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.location) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', form.description);
      formData.append('location',    form.location);
      if (image) formData.append('image', image);

      await API.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Complaint submitted successfully! 🌿');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported on this device');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        setForm({ ...form, location: coords });
        toast.success('GPS location captured!');
      },
      () => toast.error('Could not get GPS location')
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Report a Garbage Issue
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Fill in the details below. Your report helps keep the community clean.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 transition-colors"
        >

          {/* ── Image Upload ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Upload size={16} className="inline mr-1" />
              Upload Photo
              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                (optional but helpful)
              </span>
            </label>

            {preview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl cursor-pointer hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                <Upload className="text-green-400 dark:text-green-500 mb-2" size={32} />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Click to upload a photo
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPG, PNG, WEBP — max 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* ── Location ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Location / Address
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              placeholder="e.g. MG Road, Ward 4, near bus stop"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={useGPS}
              className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 transition-colors"
            >
              <MapPin size={12} /> Use my current GPS location
            </button>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText size={16} className="inline mr-1" />
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              maxLength={500}
              placeholder="Describe the garbage issue clearly — type, size, urgency..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">
              {form.description.length}/500
            </p>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <><Send size={18} /> Submit Complaint</>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
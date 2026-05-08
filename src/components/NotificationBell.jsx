// frontend/src/components/NotificationBell.jsx

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Format time like "2 min ago", "1 hr ago"
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
};

const TYPE_STYLES = {
  'new-complaint': { bg: 'bg-blue-50',   dot: 'bg-blue-500',   label: 'New Complaint' },
  'status-updated': { bg: 'bg-green-50', dot: 'bg-green-500',  label: 'Status Update' },
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useSocket();
  const [open, setOpen] = useState(false);
  const ref             = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative" ref={ref}>

      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-green-200 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-green-600" />
              <span className="font-semibold text-gray-800 text-sm">Notifications</span>
              {notifications.length > 0 && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <CheckCheck size={32} className="mb-2 text-gray-300" />
                <p className="text-sm">All caught up!</p>
                <p className="text-xs text-gray-300">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const style = TYPE_STYLES[n.type] || TYPE_STYLES['status-updated'];
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !n.read ? style.bg : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Colored dot */}
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {style.label}
                          </span>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                        {n.detail && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{n.detail}</p>
                        )}
                        {n.note && (
                          <p className="text-xs text-blue-600 mt-0.5 italic">"{n.note}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-400 text-center">
                Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
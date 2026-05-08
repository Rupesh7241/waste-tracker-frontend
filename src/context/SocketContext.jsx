
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, refreshUser }             = useAuth();
  const socketRef                         = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Create socket connection
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);

      if (user.role === 'admin') {
        socket.emit('join-room', 'admin-room');
        console.log('📦 Joined admin-room');
      } else {
        socket.emit('join-room', `user-${user._id}`);
        console.log(`📦 Joined user-${user._id}`);
      }
    });

    // ── New complaint (admin only) ─────────────────────────────────────
    socket.on('new-complaint', (data) => {
      console.log('🔔 New complaint event:', data);

      toast(data.message, {
        icon: '🗑️',
        style: { background: '#1e40af', color: '#fff' },
        duration: 5000,
      });

      addNotification({
        id:       Date.now(),
        type:     'new-complaint',
        message:  data.message,
        detail:   data.complaint.description,
        location: data.complaint.location,
        time:     new Date(),
        read:     false,
      });
    });

    // ── Status updated (user only) ────────────────────────────────────
    socket.on('status-updated', (data) => {
      console.log('🔔 Status updated event:', data);

      const colorMap = {
        'Pending':     '#92400e',
        'In Progress': '#1e40af',
        'Resolved':    '#166534',
      };

      toast(data.message, {
        icon: '✅',
        style: {
          background: colorMap[data.status] || '#166534',
          color: '#fff',
        },
        duration: 6000,
      });

      addNotification({
        id:      Date.now(),
        type:    'status-updated',
        message: data.message,
        detail:  data.description,
        status:  data.status,
        note:    data.adminNote,
        time:    new Date(),
        read:    false,
      });
    });

    // ── Role changed (promoted/demoted user) ──────────────────────────
    socket.on('role-changed', async (data) => {
      console.log('🔄 Role changed event:', data);

      // Show toast immediately
      toast(data.message, {
        icon: data.newRole === 'admin' ? '👑' : '👤',
        style: { background: '#166534', color: '#fff' },
        duration: 4000,
      });

      try {
        // Fetch fresh token + user data from server
        const freshUser = await refreshUser();

        if (freshUser) {
          // Wait for toast to be visible, then redirect
          setTimeout(() => {
            if (freshUser.role === 'admin') {
              window.location.href = '/admin';
            } else {
              window.location.href = '/dashboard';
            }
          }, 2000);
        }
      } catch (err) {
        console.error('Role refresh failed:', err);
        // Fallback — ask user to log out and back in
        toast('Please log out and log back in to apply your new role.', {
          icon: '🔄',
          style: { background: '#92400e', color: '#fff' },
          duration: 8000,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Cleanup on unmount or user change
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);   // re-run when user logs in or out

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      notifications,
      unreadCount,
      markAllRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
/**
 * NotificationsPage — shared notifications center for buyer & seller.
 * Fetches real notifications from the backend API.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Trash2, Loader2, BellOff } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

const TYPE_STYLES = {
  transfer: 'bg-blue-50 text-blue-700 border-blue-100',
  dispute:  'bg-red-50 text-red-600 border-red-100',
  success:  'bg-green-50 text-green-700 border-green-100',
  info:     'bg-amber-50 text-amber-700 border-amber-100',
};

export default function NotificationsPage({ backTo = '/buyer', role: _role = 'buyer' }) {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkAll = async () => {
    setActionLoading(true);
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message || 'Failed to update notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to={backTo} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-0.5">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={actionLoading || unreadCount === 0}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-3.5 w-3.5" />
            {actionLoading ? 'Updating...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-800 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="ll-card p-12 text-center">
          <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-semibold text-gray-700 mb-2">No notifications yet</h3>
          <p className="text-gray-500 text-sm">Updates about your property activity will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const cfg = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <div
                key={n._id || i}
                className={`ll-card p-4 flex items-start gap-3 animate-fade-in-up ${!n.isRead ? 'border-blue-200 bg-blue-50/40' : ''}`}
                style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border shrink-0 ${cfg}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-semibold text-gray-800">{n.title}</p>}
                  <p className="text-sm text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      title="Mark as read"
                      className="p-1.5 rounded text-gray-400 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    title="Delete"
                    className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

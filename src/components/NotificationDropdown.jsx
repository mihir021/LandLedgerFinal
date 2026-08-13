/**
 * NotificationDropdown — Floating Popover Modal for Notifications
 * Designed to match the Brainwave 2.0 design layout in a tactile LEGO Toy Brick aesthetic.
 */
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, CheckCheck, Loader2, X, ExternalLink, ShieldCheck, ArrowLeftRight, CheckCircle2, User } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

// Default fallback notifications if DB has zero records
const DEMO_NOTIFICATIONS = [
  {
    _id: 'demo-1',
    title: 'Property Deed Verified',
    message: 'Your property submission at New Delhi, Connaught Place has been verified by Officer.',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    link: '/seller/properties',
  },
  {
    _id: 'demo-2',
    title: 'New Purchase Request',
    message: 'Buyer account 0x93...a93C submitted a purchase request for Agricultural Land.',
    type: 'transfer',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    actions: true,
    link: '/seller/requests',
  },
  {
    _id: 'demo-3',
    title: 'KYC Status Updated',
    message: 'Your identity document verification status is now active.',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

export default function NotificationDropdown({ isOpen, onClose }) {
  const toast = useToast();
  const dropdownRef = useRef(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const data = await getNotifications();
        if (Array.isArray(data) && data.length > 0) {
          setNotifications(data);
        } else {
          setNotifications(DEMO_NOTIFICATIONS);
        }
      } catch {
        setNotifications(DEMO_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkRead = async (id) => {
    try {
      if (!id.startsWith('demo-')) {
        await markAsRead(id);
      }
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error(err.message || 'Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllAsRead().catch(() => {});
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
      if (!id.startsWith('demo-')) {
        await deleteNotification(id);
      }
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete notification');
    }
  };

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getRelativeTime = (isoDate) => {
    if (!isoDate) return 'Just now';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'success':
        return { Icon: CheckCircle2, bg: 'bg-[#E8F5E9] text-[#2E7D32]', border: 'border-[#2E7D32]' };
      case 'transfer':
        return { Icon: ArrowLeftRight, bg: 'bg-[#E3F2FD] text-[#1565C0]', border: 'border-[#1565C0]' };
      case 'dispute':
        return { Icon: ShieldCheck, bg: 'bg-[#FFEBEE] text-[#C41E3A]', border: 'border-[#C41E3A]' };
      default:
        return { Icon: Bell, bg: 'bg-[#FFF8E1] text-[#B78103]', border: 'border-[#F5B800]' };
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 z-50 w-[360px] sm:w-[410px] rounded-xl border-2 border-[#475569] bg-white shadow-[6px_6px_0px_#475569] overflow-hidden animate-fade-in"
    >
      {/* Header Accent Bar */}
      <div className="h-1.5 bg-[#F5B800]" />

      {/* Header Section */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#475569]/10 bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <h3 className="font-pixel text-lg font-bold text-[#1E293B]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#FFF8E1] border border-[#475569] text-[#B78103] text-xs font-pixel font-bold px-2 py-0.5 shadow-[1.5px_1.5px_0px_#475569]">
              {unreadCount}
            </span>
          )}
        </div>

        {/* All / Unread Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-[#475569]/20 text-xs font-pixel font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'all' 
                ? 'bg-[#1E293B] text-white shadow-sm' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'unread' 
                ? 'bg-[#1E293B] text-white shadow-sm' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Quick Action Bar (Mark all read) */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-5 py-2 bg-[#FFF8E1]/60 border-b border-[#475569]/10 text-xs">
          <span className="font-sans text-gray-600 font-medium">{unreadCount} unread update{unreadCount > 1 ? 's' : ''}</span>
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="flex items-center gap-1 font-pixel font-bold text-[#B78103] hover:underline cursor-pointer"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      )}

      {/* Notifications List Body */}
      <div className="max-h-[380px] overflow-y-auto divide-y-2 divide-[#475569]/10">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-[#475569] animate-spin" />
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="text-center py-10 px-4 font-sans">
            <Bell className="h-9 w-9 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No notifications</p>
            <p className="text-xs text-gray-500 mt-0.5">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const { Icon, bg, border } = getCategoryIcon(n.type);
            return (
              <div
                key={n._id}
                className={`lego-notch-item p-4 transition-colors hover:bg-[#475569]/5 ${
                  !n.isRead ? 'bg-[#E3F2FD]/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Category Avatar Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className={`h-9 w-9 rounded-lg border-2 border-[#475569] ${bg} flex items-center justify-center shadow-[2px_2px_0px_#475569]`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    {!n.isRead && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#2E7D32] border border-white shadow-sm" />
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 font-sans">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#1E293B] truncate">
                        {n.title || 'Notification'}
                      </p>
                      <span className="text-[11px] font-medium text-gray-600 shrink-0 font-sans">
                        {getRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mt-0.5 line-clamp-2">
                      {n.message}
                    </p>

                    {/* Action buttons (e.g., Accept / Decline or View) */}
                    {n.actions ? (
                      <div className="flex items-center gap-2 mt-2.5">
                        <Link
                          to={n.link || '/seller/requests'}
                          onClick={onClose}
                          className="lego-focus inline-flex items-center gap-1 font-pixel text-xs font-bold bg-[#1E293B] text-white border-1.5 border-[#475569] rounded px-3 py-1 shadow-[2px_2px_0px_#475569] hover:translate-y-0.5 transition-transform"
                        >
                          Review Request
                        </Link>
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="font-pixel text-xs font-bold text-gray-600 hover:text-black border border-gray-300 rounded px-2.5 py-1 hover:bg-gray-100 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : n.link ? (
                      <div className="mt-2">
                        <Link
                          to={n.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 font-pixel text-xs font-bold text-[#1565C0] hover:underline"
                        >
                          View details <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : null}
                  </div>

                  {/* Single Item Action Menu */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        title="Mark as read"
                        className="p-1 rounded text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n._id)}
                      title="Delete notification"
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#F8FAFC] border-t-2 border-[#475569]/10 text-center font-pixel text-xs font-bold">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-[#1E293B] cursor-pointer"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
}

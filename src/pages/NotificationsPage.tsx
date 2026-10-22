import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  UserPlus,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NotificationItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface NotificationsPageProps {
  onSelectUser: (username: string) => void;
  setActiveTab: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  onSelectUser,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user?.id]);

  const handleMarkAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
      case 'friend_accept':
        return <UserPlus className="w-4 h-4 text-[#1677FF]" />;
      case 'post_reaction':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'post_comment':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'group_invite':
      case 'group_approval':
        return <Users className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#1677FF]" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1677FF]" />
            Notifications
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Stay updated on new friend requests, comments, reactions, and community notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="px-4 py-2 rounded-full bg-[#1677FF]/10 text-[#1677FF] hover:bg-[#1677FF] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-xs overflow-hidden divide-y divide-[#F4F7FB]">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085]">Loading activity...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-10 h-10 text-[#667085] mx-auto mb-2" />
            <h3 className="font-bold text-sm text-[#101A35]">No Notifications Yet</h3>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              When friends connect, react, or comment on your posts, you will see notifications here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) handleMarkOne(n.id);
                if (n.type.startsWith('friend')) setActiveTab('friends');
                else if (n.type.startsWith('group')) setActiveTab('groups');
                else if (n.type.startsWith('post')) setActiveTab('feed');
              }}
              className={`p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer transition-colors hover:bg-[#F4F7FB] ${
                !n.isRead ? 'bg-[#57D7F2]/5' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={n.actor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-xs flex items-center justify-center">
                    {getIcon(n.type)}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[#182230] leading-snug">
                    <span className="font-semibold text-[#101A35]">{n.actor?.displayName}</span>{' '}
                    {n.text.replace(n.actor?.displayName || '', '')}
                  </p>
                  <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#1677FF] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

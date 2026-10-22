import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Check,
  X,
  MessageSquare,
  Search,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { FriendConnection, FriendRequestItem, UserProfile } from '../types/index.ts';

interface FriendsPageProps {
  onSelectUser: (username: string) => void;
  onStartChat: (targetUserId: string) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({
  onSelectUser,
  onStartChat,
}) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'friends' | 'received' | 'sent' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<FriendConnection[]>([]);
  const [received, setReceived] = useState<FriendRequestItem[]>([]);
  const [sent, setSent] = useState<FriendRequestItem[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, suggRes] = await Promise.all([
        api.getFriends(),
        api.getSuggestions(),
      ]);
      setFriends(friendsRes.friends);
      setReceived(friendsRes.receivedRequests);
      setSent(friendsRes.sentRequests);
      setSuggestions(suggRes.suggestions);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleAccept = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await api.rejectFriendRequest(requestId);
      setReceived(received.filter((r) => r.requestId !== requestId));
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    }
  };

  const handleCancelSent = async (requestId: string) => {
    try {
      await api.cancelFriendRequest(requestId);
      setSent(sent.filter((s) => s.requestId !== requestId));
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    }
  };

  const handleRemoveFriend = async (friendUserId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from your friends?`)) return;
    try {
      await api.removeFriend(friendUserId);
      setFriends(friends.filter((f) => f.profile?.userId !== friendUserId));
    } catch (err: any) {
      alert(err.message || 'Failed to unfriend');
    }
  };

  const handleConnect = async (targetUserId: string) => {
    try {
      await api.sendFriendRequest(targetUserId);
      setSuggestions(suggestions.filter((s) => s.userId !== targetUserId));
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to connect');
    }
  };

  const filteredFriends = friends.filter(
    (f) =>
      f.profile?.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.profile?.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1677FF]" />
              Friends & Connections
            </h1>
            <p className="text-xs text-[#667085] mt-1">
              Manage your circle, view connection requests, and discover new international friends.
            </p>
          </div>

          {/* Search box */}
          {tab === 'friends' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-[#E4E7EC] rounded-full focus:outline-none focus:border-[#1677FF]"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-4 border-t border-[#F4F7FB] mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              tab === 'friends'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>My Friends ({friends.length})</span>
          </button>

          <button
            onClick={() => setTab('received')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              tab === 'received'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Received Requests</span>
            {received.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                {received.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              tab === 'sent'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sent Requests ({sent.length})</span>
          </button>

          <button
            onClick={() => setTab('suggestions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              tab === 'suggestions'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover People</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-[#E4E7EC] animate-pulse" />
          ))}
        </div>
      ) : tab === 'friends' ? (
        /* My Friends Grid */
        <div>
          {filteredFriends.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E4E7EC] shadow-xs">
              <Users className="w-12 h-12 text-[#667085] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#101A35]">No Friends Found</h3>
              <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
                {searchFilter ? 'No friends match your search query.' : 'Connect with members to build your personal network.'}
              </p>
              <button
                onClick={() => setTab('suggestions')}
                className="px-5 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
              >
                Discover People
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredFriends.map((f) => (
                <div
                  key={f.friendshipId}
                  className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-center justify-between gap-3 hover:border-[#1677FF]/40 transition-colors"
                >
                  <button
                    onClick={() => f.profile?.username && onSelectUser(f.profile.username)}
                    className="flex items-center gap-3 min-w-0 text-left focus:outline-none"
                  >
                    <img
                      src={f.profile?.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#101A35] truncate hover:text-[#1677FF]">
                        {f.profile?.displayName}
                      </p>
                      <p className="text-xs text-[#667085] truncate">@{f.profile?.username}</p>
                      {f.profile?.location && (
                        <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#1677FF]" />
                          {f.profile.location}
                        </p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => f.profile?.userId && onStartChat(f.profile.userId)}
                      className="p-2 rounded-full bg-[#1677FF]/10 hover:bg-[#1677FF] text-[#1677FF] hover:text-white transition-colors"
                      title="Send message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => f.profile && handleRemoveFriend(f.profile.userId, f.profile.displayName)}
                      className="p-2 rounded-full hover:bg-red-50 text-[#667085] hover:text-red-600 transition-colors"
                      title="Remove friend"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'received' ? (
        /* Received Requests */
        <div>
          {received.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E4E7EC] shadow-xs">
              <UserCheck className="w-12 h-12 text-[#667085] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#101A35]">No Pending Requests</h3>
              <p className="text-xs text-[#667085] mt-1">
                You have answered all incoming friend requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {received.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-center justify-between gap-3"
                >
                  <button
                    onClick={() => req.sender?.username && onSelectUser(req.sender.username)}
                    className="flex items-center gap-3 text-left"
                  >
                    <img
                      src={req.sender?.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#101A35] hover:underline">
                        {req.sender?.displayName}
                      </p>
                      <p className="text-xs text-[#667085]">@{req.sender?.username}</p>
                      {req.sender?.location && (
                        <p className="text-[11px] text-[#667085] mt-0.5">{req.sender.location}</p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(req.requestId)}
                      className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.requestId)}
                      className="px-3.5 py-1.5 rounded-full bg-[#F4F7FB] hover:bg-slate-200 text-[#667085] text-xs font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'sent' ? (
        /* Sent Requests */
        <div>
          {sent.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E4E7EC] shadow-xs">
              <Clock className="w-12 h-12 text-[#667085] mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#101A35]">No Outgoing Requests</h3>
              <p className="text-xs text-[#667085] mt-1">
                You have no pending requests waiting for a response.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sent.map((req) => (
                <div
                  key={req.requestId}
                  className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-center justify-between gap-3"
                >
                  <button
                    onClick={() => req.receiver?.username && onSelectUser(req.receiver.username)}
                    className="flex items-center gap-3 text-left"
                  >
                    <img
                      src={req.receiver?.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#101A35] hover:underline">
                        {req.receiver?.displayName}
                      </p>
                      <p className="text-xs text-[#667085]">@{req.receiver?.username}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCancelSent(req.requestId)}
                    className="px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                  >
                    Cancel Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Discover People Suggestions */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((p) => (
              <div
                key={p.userId}
                className="bg-white p-5 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-start justify-between gap-3"
              >
                <button
                  onClick={() => onSelectUser(p.username)}
                  className="flex items-start gap-3 min-w-0 text-left focus:outline-none"
                >
                  <img
                    src={p.avatarUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#101A35] hover:text-[#1677FF] truncate">
                      {p.displayName}
                    </p>
                    <p className="text-xs text-[#667085] truncate">@{p.username}</p>
                    {p.location && (
                      <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-[#1677FF]" />
                        {p.location}
                      </p>
                    )}
                    {p.bio && (
                      <p className="text-xs text-[#182230] mt-2 line-clamp-2 leading-relaxed">
                        {p.bio}
                      </p>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => handleConnect(p.userId)}
                  className="px-4 py-1.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold shrink-0 shadow-xs flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

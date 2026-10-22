import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  Sparkles,
  UserPlus,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { GroupItem, UserProfile } from '../../types/index.ts';

interface FeedRightSidebarProps {
  onSelectUser?: (username: string) => void;
  onSelectGroup?: (groupId: string) => void;
  onViewAllGroups?: () => void;
  onViewAllFriends?: () => void;
}

export const FeedRightSidebar: React.FC<FeedRightSidebarProps> = ({
  onSelectUser,
  onSelectGroup,
  onViewAllGroups,
  onViewAllFriends,
}) => {
  const { user, switchAccount } = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const demoAccounts = [
    { id: 'usr_elena', name: 'Elena Vance', role: 'Artist 🇵🇭' },
    { id: 'usr_marcus', name: 'Marcus Sterling', role: 'Designer 🇬🇧' },
    { id: 'usr_sofia', name: 'Sofia Rodriguez', role: 'Journalist 🇪🇸' },
    { id: 'usr_kenji', name: 'Kenji Sato', role: 'Developer 🇯🇵' },
    { id: 'usr_amara', name: 'Amara Okafor', role: 'Impact 🇳🇬' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, suggRes] = await Promise.all([
          api.getGroups(),
          api.getSuggestions(),
        ]);
        setGroups(groupsRes.groups.slice(0, 3));
        setSuggestions(suggRes.suggestions.slice(0, 4));
      } catch {
        // ignore
      }
    };
    fetchData();
  }, [user?.id]);

  const handleSendRequest = async (targetUserId: string) => {
    try {
      await api.sendFriendRequest(targetUserId);
      setSentRequests([...sentRequests, targetUserId]);
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.joinGroup(groupId);
      setJoinedGroups([...joinedGroups, groupId]);
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    }
  };

  return (
    <div className="w-80 shrink-0 hidden lg:block space-y-4">
      {/* Interactive Account Switcher Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4E7EC] shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#101A35] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#1677FF]" />
            <span>Interactive Multi-User</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1677FF]/10 text-[#1677FF] font-semibold">
            Live Testing
          </span>
        </div>
        <p className="text-xs text-[#667085] mb-3 leading-relaxed">
          Switch test accounts to verify notifications, friend requests, and private chats across accounts in real time:
        </p>
        <div className="space-y-1.5">
          {demoAccounts.map((acc) => {
            const isActive = user?.id === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => switchAccount(acc.id)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-[#1677FF] text-white font-semibold shadow-xs'
                    : 'bg-[#F4F7FB] hover:bg-[#E4E7EC]/60 text-[#182230]'
                }`}
              >
                <div>
                  <span className="font-medium">{acc.name}</span>
                  <span className={`ml-1.5 text-[11px] ${isActive ? 'text-white/80' : 'text-[#667085]'}`}>
                    • {acc.role}
                  </span>
                </div>
                {isActive ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <span className="text-[10px] text-[#1677FF] hover:underline">Switch</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Friends */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#E4E7EC] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#101A35] uppercase tracking-wider">
              <Users className="w-4 h-4 text-[#1677FF]" />
              <span>People to Connect</span>
            </div>
            <button
              onClick={onViewAllFriends}
              className="text-xs text-[#1677FF] hover:underline font-medium"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {suggestions.map((p) => {
              const isSent = sentRequests.includes(p.userId);
              return (
                <div key={p.userId} className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectUser?.(p.username)}
                    className="flex items-center gap-2.5 min-w-0 text-left"
                  >
                    <img
                      src={p.avatarUrl}
                      alt={p.displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#101A35] hover:text-[#1677FF] truncate">
                        {p.displayName}
                      </p>
                      <p className="text-[11px] text-[#667085] truncate">
                        {p.location || `@${p.username}`}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleSendRequest(p.userId)}
                    disabled={isSent}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      isSent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-[#1677FF]/10 hover:bg-[#1677FF] text-[#1677FF] hover:text-white'
                    }`}
                  >
                    {isSent ? 'Sent' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Communities */}
      {groups.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#E4E7EC] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#101A35] uppercase tracking-wider">
              <Compass className="w-4 h-4 text-[#1677FF]" />
              <span>Communities</span>
            </div>
            <button
              onClick={onViewAllGroups}
              className="text-xs text-[#1677FF] hover:underline font-medium"
            >
              Explore
            </button>
          </div>

          <div className="space-y-3">
            {groups.map((g) => {
              const isJoined = joinedGroups.includes(g.id) || g.membership?.isMember;
              return (
                <div key={g.id} className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectGroup?.(g.id)}
                    className="flex items-center gap-2.5 min-w-0 text-left"
                  >
                    <img
                      src={g.avatarUrl}
                      alt={g.name}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 border border-[#E4E7EC]"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-[#101A35] hover:text-[#1677FF] truncate">
                        {g.name}
                      </p>
                      <p className="text-[11px] text-[#667085] truncate">
                        {g.membersCount} members • {g.isPrivate ? 'Private' : 'Public'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => (!isJoined ? handleJoinGroup(g.id) : onSelectGroup?.(g.id))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                      isJoined
                        ? 'bg-[#F4F7FB] text-[#667085] border border-[#E4E7EC]'
                        : 'bg-[#1677FF] text-white hover:bg-[#0e62d8]'
                    }`}
                  >
                    {isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safety & Trust Footer */}
      <div className="p-3 bg-[#101A35]/5 rounded-2xl border border-[#101A35]/10 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" />
        <div className="text-[11px] text-[#667085] leading-relaxed">
          <strong className="text-[#101A35]">KONEKTA Safety:</strong> Your private data & mobile number are strictly protected. We believe in healthy, positive digital spaces.
        </div>
      </div>
    </div>
  );
};

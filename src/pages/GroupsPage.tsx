import React, { useState, useEffect } from 'react';
import {
  Compass,
  Users,
  PlusCircle,
  Lock,
  Globe,
  Search,
  Check,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { GroupItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { CreateGroupModal } from '../components/groups/CreateGroupModal.tsx';

interface GroupsPageProps {
  onSelectGroup: (groupId: string) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ onSelectGroup }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.getGroups();
      setGroups(res.groups);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  const handleJoin = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.joinGroup(groupId);
      alert(res.message);
      fetchGroups();
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filter === 'my' && !g.membership?.isMember) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#1677FF]" />
              Communities & Interest Circles
            </h1>
            <p className="text-xs text-[#667085] mt-1">
              Connect around shared creative crafts, regional meetups, languages, and open technology.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Community</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F4F7FB]">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-[#1677FF] text-white'
                  : 'bg-[#F4F7FB] text-[#667085] hover:text-[#182230]'
              }`}
            >
              All Communities ({groups.length})
            </button>
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === 'my'
                  ? 'bg-[#1677FF] text-white'
                  : 'bg-[#F4F7FB] text-[#667085] hover:text-[#182230]'
              }`}
            >
              My Communities ({groups.filter((g) => g.membership?.isMember).length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-[#E4E7EC] rounded-full focus:outline-none focus:border-[#1677FF]"
            />
          </div>
        </div>
      </div>

      {/* Group Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-[#E4E7EC] animate-pulse" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E4E7EC] shadow-xs">
          <Compass className="w-12 h-12 text-[#667085] mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#101A35]">No Communities Found</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? 'No communities matched your search. Try different keywords or create a new one!'
              : 'You have not joined any communities yet.'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
          >
            Create First Community
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGroups.map((g) => {
            const isMember = g.membership?.isMember;
            const isPending = g.membership?.status === 'pending';

            return (
              <div
                key={g.id}
                onClick={() => onSelectGroup(g.id)}
                className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs overflow-hidden hover:border-[#1677FF]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Banner cover */}
                  <div className="h-24 relative bg-slate-900 overflow-hidden">
                    <img src={g.coverUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute top-2.5 right-2.5">
                      {g.isPrivate ? (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          Private
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#57D7F2]" />
                          Public
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body with avatar */}
                  <div className="p-4 pt-0 relative">
                    <img
                      src={g.avatarUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm -mt-6 bg-white mb-2"
                    />
                    <h3 className="font-bold text-sm text-[#101A35] line-clamp-1">{g.name}</h3>
                    <p className="text-xs text-[#667085] mt-1 line-clamp-2 leading-relaxed">
                      {g.description}
                    </p>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-4 pt-2 border-t border-[#F4F7FB] flex items-center justify-between text-xs">
                  <span className="text-[#667085] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {g.membersCount} {g.membersCount === 1 ? 'member' : 'members'}
                  </span>

                  {isMember ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      Member
                    </span>
                  ) : isPending ? (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                      Request Pending
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleJoin(g.id, e)}
                      className="px-3.5 py-1 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold shadow-xs"
                    >
                      {g.isPrivate ? 'Request Join' : 'Join Group'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateGroupModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(newGroup) => {
            setGroups([newGroup, ...groups]);
            onSelectGroup(newGroup.id);
          }}
        />
      )}
    </div>
  );
};

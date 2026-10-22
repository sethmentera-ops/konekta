import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Compass,
  FileText,
  UserPlus,
  ArrowRight,
  Globe,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { UserProfile, GroupItem, PostItem } from '../types/index.ts';

interface SearchPageProps {
  onSelectUser: (username: string) => void;
  onSelectGroup: (groupId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  onSelectUser,
  onSelectGroup,
  setActiveTab,
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'users' | 'groups' | 'posts'>('all');
  const [results, setResults] = useState<{
    users: UserProfile[];
    groups: GroupItem[];
    posts: PostItem[];
  }>({ users: [], groups: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], groups: [], posts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query.trim(), searchType);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchType]);

  const handleConnect = async (userId: string) => {
    try {
      await api.sendFriendRequest(userId);
      alert('Friend request sent!');
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const res = await api.joinGroup(groupId);
      alert(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
            <Search className="w-6 h-6 text-[#1677FF]" />
            Search & Discovery
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Find people across the globe, discover passionate interest communities, and search topics.
          </p>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 text-[#667085] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, username, interest, city, or topic..."
            className="w-full pl-12 pr-4 py-3 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:outline-none focus:border-[#1677FF] focus:bg-white"
            autoFocus
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 pt-2">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'users', label: 'People' },
            { id: 'groups', label: 'Communities' },
            { id: 'posts', label: 'Posts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSearchType(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                searchType === tab.id
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'bg-[#F4F7FB] text-[#667085] hover:text-[#182230]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Area */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#667085]">Searching KONEKTA network...</div>
      ) : !query.trim() ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E4E7EC] shadow-xs space-y-2">
          <Search className="w-12 h-12 text-[#1677FF]/30 mx-auto" />
          <h3 className="font-bold text-base text-[#101A35]">Discover What Matters</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            Try searching for "Manila", "Design", "Elena", "Polyglots", or "Tech" to explore content and people.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* People Section */}
          {(searchType === 'all' || searchType === 'users') && results.users.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#101A35] uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1677FF]" />
                People ({results.users.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.users.map((u) => (
                  <div
                    key={u.userId}
                    className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-center justify-between gap-3"
                  >
                    <button
                      onClick={() => onSelectUser(u.username)}
                      className="flex items-center gap-3 text-left min-w-0"
                    >
                      <img
                        src={u.avatarUrl}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#101A35] truncate hover:underline">
                          {u.displayName}
                        </p>
                        <p className="text-xs text-[#667085] truncate">@{u.username}</p>
                        {u.location && (
                          <p className="text-[11px] text-[#667085] truncate mt-0.5">{u.location}</p>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleConnect(u.userId)}
                      className="px-3.5 py-1.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold shrink-0"
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities Section */}
          {(searchType === 'all' || searchType === 'groups') && results.groups.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#101A35] uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#1677FF]" />
                Communities ({results.groups.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.groups.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => onSelectGroup(g.id)}
                    className="bg-white p-4 rounded-2xl border border-[#E4E7EC] shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-[#1677FF]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={g.avatarUrl}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#E4E7EC]"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#101A35] truncate">{g.name}</p>
                        <p className="text-xs text-[#667085] truncate">
                          {g.membersCount} members • {g.isPrivate ? 'Private' : 'Public'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoin(g.id);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#1677FF]/10 text-[#1677FF] hover:bg-[#1677FF] hover:text-white text-xs font-semibold shrink-0"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section */}
          {(searchType === 'all' || searchType === 'posts') && results.posts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-[#101A35] uppercase tracking-wider px-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#1677FF]" />
                Posts ({results.posts.length})
              </h2>
              <div className="space-y-3">
                {results.posts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E7EC] shadow-xs space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={p.author?.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-xs text-[#101A35]">
                          {p.author?.displayName}
                        </p>
                        <p className="text-[10px] text-[#667085]">@{p.author?.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#182230] whitespace-pre-line">{p.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.users.length === 0 &&
            results.groups.length === 0 &&
            results.posts.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E4E7EC] shadow-xs">
                <p className="text-sm text-[#667085]">No results found matching "{query}".</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

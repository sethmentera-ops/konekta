import React, { useState, useEffect } from 'react';
import {
  Users,
  Lock,
  Globe,
  ShieldCheck,
  Check,
  X,
  LogOut,
  Sparkles,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { GroupItem, PostItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { PostCard } from '../components/feed/PostCard.tsx';
import { CreatePostCard } from '../components/feed/CreatePostCard.tsx';

interface GroupDetailPageProps {
  groupId: string;
  onBack: () => void;
  onSelectUser: (username: string) => void;
}

export const GroupDetailPage: React.FC<GroupDetailPageProps> = ({
  groupId,
  onBack,
  onSelectUser,
}) => {
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupItem | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'rules' | 'members' | 'requests'>('feed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupRes, postsRes] = await Promise.all([
        api.getGroupDetails(groupId),
        api.getPosts({ groupId, limit: 20 }),
      ]);
      setGroup(groupRes.group);
      setPosts(postsRes.posts);
    } catch (err: any) {
      setError(err.message || 'Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId, user?.id]);

  const handleJoin = async () => {
    if (!group) return;
    try {
      const res = await api.joinGroup(group.id);
      alert(res.message);
      fetchGroupData();
    } catch (err: any) {
      alert(err.message || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    if (!group) return;
    if (!confirm(`Are you sure you want to leave ${group.name}?`)) return;
    try {
      await api.leaveGroup(group.id);
      fetchGroupData();
    } catch (err: any) {
      alert(err.message || 'Failed to leave group');
    }
  };

  const handleManageRequest = async (memberRecordId: string, action: 'approve' | 'reject') => {
    if (!group) return;
    try {
      await api.manageGroupRequest(group.id, memberRecordId, action);
      fetchGroupData();
    } catch (err: any) {
      alert(err.message || `Failed to ${action} request`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-20 bg-white rounded-2xl border border-[#E4E7EC]" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#101A35]">Community Not Found</h2>
        <p className="text-sm text-[#667085] mt-1 mb-6">{error || 'This group does not exist.'}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const isMember = group.membership?.isMember;
  const isPending = group.membership?.status === 'pending';
  const isAdmin = group.membership?.role === 'admin' && isMember;
  const canViewPosts = !group.isPrivate || isMember;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#182230] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all communities</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-xs overflow-hidden">
        <div className="relative h-44 sm:h-56 bg-slate-900 overflow-hidden">
          <img src={group.coverUrl} alt="" className="w-full h-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 right-4">
            {group.isPrivate ? (
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Private Group
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#57D7F2]" />
                Public Community
              </span>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
            <img
              src={group.avatarUrl}
              alt=""
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
            />

            <div className="flex items-center gap-2">
              {isMember ? (
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" />
                    Joined {isAdmin && '(Admin)'}
                  </span>
                  <button
                    onClick={handleLeave}
                    className="p-2 rounded-full hover:bg-red-50 text-[#667085] hover:text-red-600 transition-colors"
                    title="Leave Community"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : isPending ? (
                <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                  Join Request Pending
                </span>
              ) : (
                <button
                  onClick={handleJoin}
                  className="px-5 py-2.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>{group.isPrivate ? 'Request to Join' : 'Join Community'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#101A35]">{group.name}</h1>
            <p className="text-sm text-[#667085] leading-relaxed max-w-2xl">{group.description}</p>
            <div className="flex items-center gap-4 text-xs text-[#667085] pt-2">
              <span className="font-semibold text-[#182230]">
                {group.membersCount} {group.membersCount === 1 ? 'member' : 'members'}
              </span>
              <span>•</span>
              <span>Created {new Date(group.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 border-t border-[#F4F7FB] mt-6 pt-3 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-2 border-b-2 transition-colors ${
                activeTab === 'feed'
                  ? 'border-[#1677FF] text-[#1677FF]'
                  : 'border-transparent text-[#667085] hover:text-[#182230]'
              }`}
            >
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-[#1677FF] text-[#1677FF]'
                  : 'border-transparent text-[#667085] hover:text-[#182230]'
              }`}
            >
              Guidelines & Rules
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-2 border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-[#1677FF] text-[#1677FF]'
                  : 'border-transparent text-[#667085] hover:text-[#182230]'
              }`}
            >
              Members Directory
            </button>

            {isAdmin && group.isPrivate && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'border-[#1677FF] text-[#1677FF]'
                    : 'border-transparent text-[#667085] hover:text-[#182230]'
                }`}
              >
                <span>Admin Requests</span>
                {group.pendingRequests && group.pendingRequests.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
                    {group.pendingRequests.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'feed' ? (
        <div className="space-y-4">
          {!canViewPosts ? (
            <div className="bg-white rounded-3xl p-10 border border-[#E4E7EC] text-center shadow-xs">
              <Lock className="w-12 h-12 text-[#667085] mx-auto mb-3" />
              <h3 className="font-bold text-lg text-[#101A35]">Private Community</h3>
              <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
                This community is private. Only approved members can view discussions and share posts.
              </p>
              {!isPending && (
                <button
                  onClick={handleJoin}
                  className="px-5 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
                >
                  Request to Join
                </button>
              )}
            </div>
          ) : (
            <>
              {isMember && (
                <CreatePostCard
                  groupId={group.id}
                  groupName={group.name}
                  onPostCreated={(newP) => setPosts([newP, ...posts])}
                />
              )}

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] text-center shadow-xs">
                  <p className="text-sm text-[#667085]">No discussions posted yet in this community.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onSelectUser={onSelectUser}
                    onPostDeleted={(id) => setPosts(posts.filter((p) => p.id !== id))}
                  />
                ))
              )}
            </>
          )}
        </div>
      ) : activeTab === 'rules' ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1677FF]" />
            <h3 className="font-bold text-base text-[#101A35]">Community Code of Conduct</h3>
          </div>
          <p className="text-sm text-[#182230] whitespace-pre-line leading-relaxed bg-[#F4F7FB] p-4 rounded-2xl border border-[#E4E7EC]">
            {group.rules || 'Be kind, respect different cultural perspectives, and contribute constructively.'}
          </p>
        </div>
      ) : activeTab === 'members' ? (
        <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#101A35]">Members</h3>
          <div className="space-y-3">
            {group.members?.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F4F7FB] transition-colors"
              >
                <button
                  onClick={() => m.profile?.username && onSelectUser(m.profile.username)}
                  className="flex items-center gap-3 text-left"
                >
                  <img
                    src={m.profile?.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                  />
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-[#101A35] hover:underline">
                      {m.profile?.displayName}
                    </p>
                    <p className="text-xs text-[#667085]">@{m.profile?.username}</p>
                  </div>
                </button>
                <span className="px-2.5 py-1 rounded-full bg-[#101A35]/5 text-[#101A35] text-xs font-semibold capitalize">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Admin Pending Join Requests */
        <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#101A35]">Pending Membership Approvals</h3>
          {!group.pendingRequests || group.pendingRequests.length === 0 ? (
            <p className="text-xs text-[#667085]">No pending membership requests at this time.</p>
          ) : (
            <div className="space-y-3">
              {group.pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#E4E7EC] bg-[#F4F7FB]/50"
                >
                  <button
                    onClick={() => req.profile?.username && onSelectUser(req.profile.username)}
                    className="flex items-center gap-3 text-left"
                  >
                    <img
                      src={req.profile?.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                    />
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-[#101A35]">
                        {req.profile?.displayName}
                      </p>
                      <p className="text-xs text-[#667085]">@{req.profile?.username}</p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManageRequest(req.id, 'approve')}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleManageRequest(req.id, 'reject')}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E4E7EC] hover:bg-red-50 text-red-600 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

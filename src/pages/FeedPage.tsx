import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Compass,
  RefreshCw,
  Sparkles,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { PostCard } from '../components/feed/PostCard.tsx';
import { CreatePostCard } from '../components/feed/CreatePostCard.tsx';
import { FeedRightSidebar } from '../components/feed/FeedRightSidebar.tsx';
import { EditPostModal } from '../components/feed/EditPostModal.tsx';
import { ReportModal } from '../components/feed/ReportModal.tsx';
import { api } from '../services/api.ts';
import { PostItem } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface FeedPageProps {
  onSelectUser: (username: string) => void;
  onSelectGroup: (groupId: string) => void;
  setActiveTab: (tab: string) => void;
}

export const FeedPage: React.FC<FeedPageProps> = ({
  onSelectUser,
  onSelectGroup,
  setActiveTab,
}) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'friends' | 'groups'>('all');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const fetchPosts = async (currentPage = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (currentPage === 1) setLoading(true);

    setError(null);
    try {
      const res = await api.getPosts({ filter, page: currentPage, limit: 10 });
      if (currentPage === 1) {
        setPosts(res.posts);
      } else {
        setPosts((prev) => [...prev, ...res.posts]);
      }
      setHasMore(res.hasMore);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, [filter, user?.id]);

  const handlePostCreated = (newPost: PostItem) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts(posts.filter((p) => p.id !== deletedId));
  };

  const handlePostUpdated = (updatedPost: PostItem) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Central Feed Column */}
      <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
        {/* Feed Filter Header */}
        <div className="bg-white rounded-2xl p-2 border border-[#E4E7EC] shadow-xs mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#182230] hover:bg-[#F4F7FB]'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>All Posts</span>
            </button>

            <button
              onClick={() => setFilter('friends')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'friends'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#182230] hover:bg-[#F4F7FB]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Friends Only</span>
            </button>

            <button
              onClick={() => setFilter('groups')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'groups'
                  ? 'bg-[#1677FF] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#182230] hover:bg-[#F4F7FB]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Communities</span>
            </button>
          </div>

          <button
            onClick={() => fetchPosts(1, true)}
            disabled={refreshing}
            className="p-2 text-[#667085] hover:text-[#182230] hover:bg-[#F4F7FB] rounded-full transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#1677FF]' : ''}`} />
          </button>
        </div>

        {/* Create Post Widget */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* Error notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-[#E4E7EC] shadow-xs space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-32 h-3.5 bg-slate-200 rounded-sm" />
                    <div className="w-20 h-2.5 bg-slate-200 rounded-sm" />
                  </div>
                </div>
                <div className="w-full h-12 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Posts Feed */}
        {!loading && (
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] text-center shadow-xs">
                <Sparkles className="w-10 h-10 text-[#57D7F2] mx-auto mb-3" />
                <h3 className="font-bold text-base text-[#101A35]">No Posts Yet in this View</h3>
                <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
                  {filter === 'friends'
                    ? 'None of your friends have shared updates yet. Connect with more people or check All Posts!'
                    : filter === 'groups'
                    ? 'Join interest communities to see community posts here.'
                    : 'Be the first to share an update with the KONEKTA network!'}
                </p>
                {filter === 'groups' ? (
                  <button
                    onClick={() => setActiveTab('groups')}
                    className="px-4 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold hover:bg-[#0e62d8]"
                  >
                    Explore Communities
                  </button>
                ) : filter === 'friends' ? (
                  <button
                    onClick={() => setActiveTab('friends')}
                    className="px-4 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold hover:bg-[#0e62d8]"
                  >
                    Discover People
                  </button>
                ) : null}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                  onSelectUser={onSelectUser}
                  onSelectGroup={onSelectGroup}
                  onOpenReport={(type, id) => setReportingPostId(id)}
                  onOpenEdit={(p) => setEditingPost(p)}
                />
              ))
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-2 pb-6">
                <button
                  onClick={() => fetchPosts(page + 1)}
                  className="px-6 py-2.5 bg-white border border-[#E4E7EC] hover:border-[#1677FF] text-[#1677FF] text-xs font-semibold rounded-full shadow-xs transition-colors"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Sidebar Widget */}
      <FeedRightSidebar
        onSelectUser={onSelectUser}
        onSelectGroup={onSelectGroup}
        onViewAllGroups={() => setActiveTab('groups')}
        onViewAllFriends={() => setActiveTab('friends')}
      />

      {/* Edit Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={handlePostUpdated}
        />
      )}

      {/* Report Modal */}
      {reportingPostId && (
        <ReportModal
          isOpen={!!reportingPostId}
          onClose={() => setReportingPostId(null)}
          targetType="post"
          targetId={reportingPostId}
        />
      )}
    </div>
  );
};

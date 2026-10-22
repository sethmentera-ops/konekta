import React, { useState } from 'react';
import {
  Heart,
  ThumbsUp,
  PartyPopper,
  Handshake,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Flag,
  Globe,
  Users,
  Send,
  MapPin,
  Clock,
} from 'lucide-react';
import { PostItem, ReactionType } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

interface PostCardProps {
  post: PostItem;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (post: PostItem) => void;
  onSelectUser?: (username: string) => void;
  onSelectGroup?: (groupId: string) => void;
  onOpenReport?: (type: 'post', id: string) => void;
  onOpenEdit?: (post: PostItem) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onPostUpdated,
  onSelectUser,
  onSelectGroup,
  onOpenReport,
  onOpenEdit,
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(post.reactions);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  const isAuthor = user?.id === post.authorId;
  const author = post.author;

  const reactionEmojis: Record<ReactionType, { icon: any; label: string; color: string; emoji: string }> = {
    like: { icon: ThumbsUp, label: 'Like', color: 'text-[#1677FF]', emoji: '👍' },
    love: { icon: Heart, label: 'Love', color: 'text-rose-500', emoji: '❤️' },
    celebrate: { icon: PartyPopper, label: 'Celebrate', color: 'text-amber-500', emoji: '🎉' },
    support: { icon: Handshake, label: 'Support', color: 'text-emerald-500', emoji: '🤝' },
  };

  const handleReact = async (type: ReactionType) => {
    setShowReactionPicker(false);
    try {
      const res = await api.reactToPost(post.id, type);
      setReactions(res.reactions);
      if (onPostUpdated) {
        onPostUpdated({ ...post, reactions: res.reactions });
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.addComment(post.id, commentInput.trim());
      const updatedComments = [...comments, res.comment];
      setComments(updatedComments);
      setCommentInput('');
      if (onPostUpdated) {
        onPostUpdated({ ...post, comments: updatedComments });
      }
    } catch (err) {
      console.error('Failed to comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(post.id, commentId);
      const updatedComments = comments.filter((c) => c.id !== commentId);
      setComments(updatedComments);
      if (onPostUpdated) {
        onPostUpdated({ ...post, comments: updatedComments });
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await api.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setIsDeleting(false);
    }
  };

  const handleRepost = async () => {
    setIsReposting(true);
    try {
      await api.repost(post.id);
      alert('Post shared to your timeline!');
    } catch (err: any) {
      alert(err.message || 'Failed to repost');
    } finally {
      setIsReposting(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const userReactionInfo = reactions.userReaction ? reactionEmojis[reactions.userReaction] : null;

  return (
    <article className="bg-white rounded-2xl border border-[#E4E7EC] shadow-xs mb-4 overflow-hidden transition-all hover:border-[#D0D5DD]">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={() => author?.username && onSelectUser?.(author.username)}
            className="focus:outline-none shrink-0"
          >
            <img
              src={
                author?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt={author?.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC] hover:opacity-90"
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => author?.username && onSelectUser?.(author.username)}
                className="font-semibold text-sm text-[#101A35] hover:text-[#1677FF] hover:underline truncate"
              >
                {author?.displayName || 'User'}
              </button>
              <span className="text-xs text-[#667085] truncate">@{author?.username}</span>

              {post.group && (
                <span className="text-xs text-[#667085] flex items-center gap-1">
                  in
                  <button
                    onClick={() => post.group?.id && onSelectGroup?.(post.group.id)}
                    className="font-medium text-[#1677FF] hover:underline"
                  >
                    {post.group.name}
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#667085] mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(post.createdAt)}
              </span>
              <span>•</span>
              {post.visibility === 'public' ? (
                <span className="flex items-center gap-1" title="Public">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1" title="Friends Only">
                  <Users className="w-3 h-3" />
                  Friends
                </span>
              )}
              {author?.location && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1 truncate max-w-[120px]">
                    <MapPin className="w-3 h-3 text-[#1677FF]" />
                    {author.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dropdown Options */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-[#667085] hover:text-[#182230] hover:bg-[#F4F7FB] rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1 z-30">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onOpenEdit?.(post);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#667085]" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    disabled={isDeleting}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Delete Post
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenReport?.('post', post.id);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Flag className="w-3.5 h-3.5 text-red-500" />
                  Report Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 sm:px-5 pb-3">
          <p className="text-sm sm:text-base text-[#182230] whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
        </div>
      )}

      {/* Media Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="pb-3 px-4 sm:px-5">
          <div
            className={`rounded-xl overflow-hidden border border-[#E4E7EC] bg-[#101A35]/5 ${
              post.mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1.5' : ''
            }`}
          >
            {post.mediaUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Post attachment"
                className="w-full h-auto max-h-[480px] object-cover transition-transform hover:scale-[1.01]"
              />
            ))}
          </div>
        </div>
      )}

      {/* Repost attribution */}
      {post.repostOf && (
        <div className="mx-4 sm:mx-5 mb-3 p-3.5 rounded-xl border border-[#E4E7EC] bg-[#F4F7FB]/70">
          <div className="flex items-center gap-2 mb-2 text-xs text-[#667085]">
            <Repeat2 className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Shared from</span>
            <span className="font-semibold text-[#182230]">{post.repostOf.author?.displayName}</span>
          </div>
          <p className="text-sm text-[#182230] line-clamp-3">{post.repostOf.content}</p>
        </div>
      )}

      {/* Counts & Reactions Summary */}
      <div className="px-4 sm:px-5 py-2 border-t border-[#F4F7FB] flex items-center justify-between text-xs text-[#667085]">
        <div className="flex items-center gap-1.5">
          {reactions.total > 0 ? (
            <>
              <div className="flex -space-x-1">
                {reactions.types.love > 0 && <span>❤️</span>}
                {reactions.types.celebrate > 0 && <span>🎉</span>}
                {reactions.types.like > 0 && <span>👍</span>}
                {reactions.types.support > 0 && <span>🤝</span>}
              </div>
              <span className="font-medium text-[#182230]">{reactions.total}</span>
              <span className="hidden sm:inline">reactions</span>
            </>
          ) : (
            <span>Be the first to react</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline"
          >
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="px-2 sm:px-4 py-1.5 border-t border-[#E4E7EC] flex items-center justify-between relative">
        {/* React Button with popup picker */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
        >
          <button
            onClick={() => handleReact(reactions.userReaction ? reactions.userReaction : 'like')}
            className={`w-full py-2 px-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              userReactionInfo
                ? `${userReactionInfo.color} font-semibold bg-[#1677FF]/5`
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            {userReactionInfo ? (
              <span>{userReactionInfo.emoji}</span>
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>{userReactionInfo ? userReactionInfo.label : 'React'}</span>
          </button>

          {/* Hover Reaction Picker Modal */}
          {showReactionPicker && (
            <div className="absolute -top-12 left-0 sm:left-4 bg-white rounded-full shadow-xl border border-[#E4E7EC] px-3 py-1.5 flex items-center gap-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              {(Object.keys(reactionEmojis) as ReactionType[]).map((type) => {
                const info = reactionEmojis[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleReact(type)}
                    className="p-1 text-xl hover:scale-135 transition-transform"
                    title={info.label}
                  >
                    {info.emoji}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            showComments
              ? 'text-[#1677FF] bg-[#1677FF]/5 font-semibold'
              : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Share / Repost Button */}
        <button
          onClick={handleRepost}
          disabled={isReposting}
          className="flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230] flex items-center justify-center gap-2 transition-colors"
        >
          <Repeat2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="bg-[#F4F7FB]/50 border-t border-[#E4E7EC] p-4 sm:p-5 space-y-3">
          {/* Add Comment Box */}
          <form onSubmit={handleAddComment} className="flex gap-2.5">
            <img
              src={
                user?.profile?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a thoughtful comment..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-full focus:outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]"
              />
              <button
                type="submit"
                disabled={!commentInput.trim() || isSubmittingComment}
                className="px-4 py-2 bg-[#1677FF] hover:bg-[#0e62d8] text-white rounded-full text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="space-y-2.5 pt-2">
            {comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.authorId;
              return (
                <div key={comment.id} className="flex gap-2.5 group">
                  <button
                    onClick={() => comment.author?.username && onSelectUser?.(comment.author.username)}
                    className="shrink-0 focus:outline-none"
                  >
                    <img
                      src={
                        comment.author?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={comment.author?.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-[#E4E7EC]"
                    />
                  </button>
                  <div className="flex-1">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-[#E4E7EC] inline-block max-w-full">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => comment.author?.username && onSelectUser?.(comment.author.username)}
                          className="font-semibold text-xs text-[#101A35] hover:underline"
                        >
                          {comment.author?.displayName || 'User'}
                        </button>
                        <span className="text-[10px] text-[#667085]">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#182230] mt-1 whitespace-pre-line">{comment.content}</p>
                    </div>

                    {(isCommentAuthor || isAuthor) && (
                      <div className="pl-2 pt-0.5">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-[10px] text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};

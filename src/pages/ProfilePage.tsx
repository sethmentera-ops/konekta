import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Link as LinkIcon,
  UserCheck,
  UserPlus,
  MessageSquare,
  ShieldAlert,
  Lock,
  Edit3,
  MoreVertical,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { UserProfile, PostItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { PostCard } from '../components/feed/PostCard.tsx';
import { EditProfileModal } from '../components/profile/EditProfileModal.tsx';
import { ReportModal } from '../components/feed/ReportModal.tsx';

interface ProfilePageProps {
  username: string;
  onSelectUser: (username: string) => void;
  onStartChat: (targetUserId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  username,
  onSelectUser,
  onStartChat,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isRestricted, setIsRestricted] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'about'>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProfile(username);
      setProfile(res.profile);
      setPosts(res.posts);
      setIsRestricted(res.isRestricted);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, user?.id]);

  const handleSendFriendRequest = async () => {
    if (!profile) return;
    try {
      await api.sendFriendRequest(profile.userId);
      setProfile({
        ...profile,
        friendshipStatus: 'pending_sent',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async () => {
    if (!profile?.friendRequestId) return;
    try {
      await api.acceptFriendRequest(profile.friendRequestId);
      setProfile({
        ...profile,
        friendshipStatus: 'friends',
        friendsCount: (profile.friendsCount || 0) + 1,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleCancelRequest = async () => {
    if (!profile?.friendRequestId) return;
    try {
      await api.cancelFriendRequest(profile.friendRequestId);
      setProfile({
        ...profile,
        friendshipStatus: 'none',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;
    if (!confirm(`Are you sure you want to remove ${profile.displayName} from your friends?`)) return;
    try {
      await api.removeFriend(profile.userId);
      setProfile({
        ...profile,
        friendshipStatus: 'none',
        friendsCount: Math.max(0, (profile.friendsCount || 1) - 1),
      });
      setShowActionsDropdown(false);
    } catch (err: any) {
      alert(err.message || 'Failed to unfriend');
    }
  };

  const handleBlockUser = async () => {
    if (!profile) return;
    if (!confirm(`Block ${profile.displayName}? They will no longer be able to message you or view your posts.`)) return;
    try {
      await api.blockUser(profile.userId);
      alert('User has been blocked.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to block user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-48 sm:h-64 bg-slate-200 rounded-3xl" />
        <div className="flex gap-4 items-end px-6">
          <div className="w-24 h-24 rounded-full bg-slate-300 -mt-12" />
          <div className="space-y-2 pb-2">
            <div className="w-40 h-4 bg-slate-300 rounded-sm" />
            <div className="w-24 h-3 bg-slate-200 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#667085]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#101A35]">Profile Unavailable</h2>
        <p className="text-sm text-[#667085] mt-1 mb-6">
          {error || 'This user profile could not be found or is unavailable.'}
        </p>
        <button
          onClick={() => onSelectUser('elenavance')}
          className="px-5 py-2.5 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
        >
          Return to Elena's Profile
        </button>
      </div>
    );
  }

  const isSelf = profile.friendshipStatus === 'self';
  const isFriend = profile.friendshipStatus === 'friends';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-xs overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 bg-[#101A35] overflow-hidden">
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar & Badges */}
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-md bg-white"
              />
              <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {isSelf ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {/* Friendship Button State */}
                  {profile.friendshipStatus === 'none' && (
                    <button
                      onClick={handleSendFriendRequest}
                      className="px-5 py-2 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Friend</span>
                    </button>
                  )}

                  {profile.friendshipStatus === 'pending_sent' && (
                    <button
                      onClick={handleCancelRequest}
                      className="px-4 py-2 rounded-full bg-[#F4F7FB] border border-[#E4E7EC] hover:bg-slate-100 text-[#667085] text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                    >
                      <span>Request Sent</span>
                      <span className="text-[11px] text-red-500 font-normal">(Cancel)</span>
                    </button>
                  )}

                  {profile.friendshipStatus === 'pending_received' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleAcceptRequest}
                        className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                    </div>
                  )}

                  {isFriend && (
                    <div className="relative">
                      <button
                        onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                        className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Friends</span>
                      </button>
                      {showActionsDropdown && (
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1 z-30">
                          <button
                            onClick={handleRemoveFriend}
                            className="w-full px-3.5 py-2 text-left text-xs text-red-600 hover:bg-red-50 font-medium"
                          >
                            Unfriend
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Send Message Button */}
                  <button
                    onClick={() => onStartChat(profile.userId)}
                    className="px-4 py-2 rounded-full bg-[#101A35] hover:bg-[#18264a] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>

                  {/* Safety / More options */}
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                      className="p-2 rounded-full hover:bg-[#F4F7FB] text-[#667085]"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showActionsDropdown && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#E4E7EC] py-1 z-30">
                        <button
                          onClick={() => {
                            setShowActionsDropdown(false);
                            setIsReporting(true);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-2"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowActionsDropdown(false);
                            handleBlockUser();
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5 text-red-500" />
                          <span>Block User</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#101A35]">{profile.displayName}</h1>
                <span className="w-2 h-2 rounded-full bg-[#57D7F2]" />
              </div>
              <p className="text-sm text-[#667085]">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-sm text-[#182230] max-w-2xl leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            {/* Meta details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] pt-1">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1677FF]" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#1677FF] hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 pt-3 border-t border-[#F4F7FB] text-sm">
              <div>
                <span className="font-bold text-[#101A35]">{profile.friendsCount || 0}</span>{' '}
                <span className="text-[#667085] text-xs">Friends</span>
              </div>
              <div>
                <span className="font-bold text-[#101A35]">{posts.length}</span>{' '}
                <span className="text-[#667085] text-xs">Posts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-[#E4E7EC] flex gap-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'posts'
                ? 'border-[#1677FF] text-[#1677FF]'
                : 'border-transparent text-[#667085] hover:text-[#182230]'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'about'
                ? 'border-[#1677FF] text-[#1677FF]'
                : 'border-transparent text-[#667085] hover:text-[#182230]'
            }`}
          >
            About & Contact
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isRestricted ? (
        <div className="bg-white rounded-3xl p-8 border border-[#E4E7EC] text-center shadow-xs">
          <Lock className="w-12 h-12 text-[#667085] mx-auto mb-3" />
          <h3 className="font-bold text-lg text-[#101A35]">This Profile is Private</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mt-1 mb-4">
            Only confirmed friends of @{profile.username} can view their posts and activity. Send a friend request to connect!
          </p>
          {profile.friendshipStatus === 'none' && (
            <button
              onClick={handleSendFriendRequest}
              className="px-5 py-2 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
            >
              Send Friend Request
            </button>
          )}
        </div>
      ) : activeTab === 'posts' ? (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E4E7EC] text-center shadow-xs">
              <p className="text-sm text-[#667085]">No posts shared yet by @{profile.username}.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onSelectUser={onSelectUser}
              />
            ))
          )}
        </div>
      ) : (
        /* About Tab */
        <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#101A35]">About {profile.displayName}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4F7FB]">
              <span className="text-[#667085] block mb-1">Username</span>
              <span className="font-semibold text-[#182230]">@{profile.username}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FB]">
              <span className="text-[#667085] block mb-1">Location</span>
              <span className="font-semibold text-[#182230]">{profile.location || 'Not specified'}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FB]">
              <span className="text-[#667085] block mb-1">Website</span>
              <span className="font-semibold text-[#182230]">{profile.website || 'None'}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#F4F7FB]">
              <span className="text-[#667085] block mb-1">Account Visibility</span>
              <span className="font-semibold text-[#182230] capitalize">{profile.privacyVisibility}</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profile={profile}
          onUpdated={(updated) => setProfile(updated)}
        />
      )}

      {/* Report User Modal */}
      {isReporting && (
        <ReportModal
          isOpen={isReporting}
          onClose={() => setIsReporting(false)}
          targetType="user"
          targetId={profile.userId}
        />
      )}
    </div>
  );
};

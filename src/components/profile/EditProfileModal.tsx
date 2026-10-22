import React, { useState } from 'react';
import { X, Image, Check, Globe, Lock } from 'lucide-react';
import { UserProfile } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdated: (profile: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdated,
}) => {
  const { updateCurrentProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(profile.coverUrl);
  const [privacyVisibility, setPrivacyVisibility] = useState<'public' | 'friends_only'>(
    profile.privacyVisibility || 'public'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  ];

  const coverPresets = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updates: Partial<UserProfile> = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatarUrl,
        coverUrl,
        privacyVisibility,
      };

      await updateCurrentProfile(updates);
      onUpdated({ ...profile, ...updates });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <h3 className="font-bold text-base text-[#101A35]">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#667085] hover:bg-[#F4F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>}

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1">About / Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell friends about yourself..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] resize-none"
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#182230] mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#182230] mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
              />
            </div>
          </div>

          {/* Choose Avatar Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-2">
              Choose Avatar Preset
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {avatarPresets.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`relative rounded-full p-0.5 shrink-0 transition-transform ${
                    avatarUrl === url ? 'ring-3 ring-[#1677FF] scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-[#1677FF]/30 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Choose Cover Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-2">
              Choose Cover Banner Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coverPresets.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverUrl(url)}
                  className={`relative rounded-xl overflow-hidden border-2 h-16 transition-all ${
                    coverUrl === url ? 'border-[#1677FF]' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {coverUrl === url && (
                    <div className="absolute inset-0 bg-[#1677FF]/30 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Level */}
          <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#E4E7EC]">
            <label className="block text-xs font-semibold text-[#101A35] mb-1">
              Profile Privacy Visibility
            </label>
            <div className="flex gap-3 mt-1.5">
              <label className="flex items-center gap-2 text-xs text-[#182230] cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={privacyVisibility === 'public'}
                  onChange={() => setPrivacyVisibility('public')}
                  className="text-[#1677FF]"
                />
                <Globe className="w-3.5 h-3.5 text-[#667085]" />
                <span>Public (Everyone)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#182230] cursor-pointer">
                <input
                  type="radio"
                  name="privacy"
                  checked={privacyVisibility === 'friends_only'}
                  onChange={() => setPrivacyVisibility('friends_only')}
                  className="text-[#1677FF]"
                />
                <Lock className="w-3.5 h-3.5 text-[#667085]" />
                <span>Friends Only</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F4F7FB] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1677FF] hover:bg-[#0e62d8] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

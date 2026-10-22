import React, { useState } from 'react';
import {
  Image,
  Globe,
  Users,
  Sparkles,
  Send,
  X,
  Smile,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { PostItem } from '../../types/index.ts';

interface CreatePostCardProps {
  onPostCreated: (post: PostItem) => void;
  groupId?: string | null;
  groupName?: string;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  onPostCreated,
  groupId = null,
  groupName,
}) => {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'friends_only'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetImages = [
    { label: 'Cityscape', url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Work & Code', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Nature', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Culture', url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleAddPreset = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls([...mediaUrls, url]);
    }
  };

  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim() && !mediaUrls.includes(imageUrlInput.trim())) {
      setMediaUrls([...mediaUrls, imageUrlInput.trim()]);
      setImageUrlInput('');
      setShowImageInput(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaUrls.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createPost({
        content: content.trim(),
        mediaUrls,
        groupId,
        visibility: groupId ? 'group' : visibility,
      });

      onPostCreated(res.post);
      setContent('');
      setMediaUrls([]);
      setShowImageInput(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E4E7EC] shadow-xs mb-5 transition-shadow hover:shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3.5">
          <img
            src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={profile?.displayName}
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                groupName
                  ? `Share a thought with the ${groupName} community...`
                  : `What's on your mind, ${profile?.displayName ? profile.displayName.split(' ')[0] : 'there'}?`
              }
              rows={3}
              className="w-full text-sm sm:text-base text-[#182230] placeholder-[#667085] resize-none focus:outline-none bg-transparent"
            />

            {/* Media previews */}
            {mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {mediaUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#E4E7EC]">
                    <img src={url} alt="Attached" className="w-24 h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Custom image URL input */}
            {showImageInput && (
              <div className="mb-3 p-3 bg-[#F4F7FB] rounded-xl border border-[#E4E7EC] space-y-2">
                <p className="text-xs font-medium text-[#182230]">Attach Image URL or Pick a Preset:</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Paste image link (https://...)"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-lg focus:outline-none focus:border-[#1677FF]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImage}
                    className="px-3 py-1.5 bg-[#1677FF] text-white text-xs font-medium rounded-lg hover:bg-[#0e62d8]"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-[#667085] py-0.5">Quick picks:</span>
                  {presetImages.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddPreset(p.url)}
                      className="px-2 py-0.5 text-[11px] bg-white border border-[#E4E7EC] rounded-md hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
                    >
                      + {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-3 border-t border-[#F4F7FB] flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    showImageInput || mediaUrls.length > 0
                      ? 'bg-[#1677FF]/10 text-[#1677FF]'
                      : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
                  }`}
                >
                  <Image className="w-4 h-4 text-[#1677FF]" />
                  <span>Photo / Image</span>
                </button>

                {!groupId && (
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as 'public' | 'friends_only')}
                      className="appearance-none pl-7 pr-6 py-1.5 text-xs font-medium text-[#667085] bg-[#F4F7FB] hover:bg-[#E4E7EC]/60 rounded-full border border-transparent cursor-pointer focus:outline-none"
                    >
                      <option value="public">Public</option>
                      <option value="friends_only">Friends Only</option>
                    </select>
                    {visibility === 'public' ? (
                      <Globe className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    ) : (
                      <Users className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white transition-all shadow-xs ${
                  isSubmitting || (!content.trim() && mediaUrls.length === 0)
                    ? 'bg-[#98A2B3] cursor-not-allowed opacity-70'
                    : 'bg-[#1677FF] hover:bg-[#0e62d8] hover:shadow-sm'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { PostItem } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface EditPostModalProps {
  post: PostItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (post: PostItem) => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [content, setContent] = useState(post.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.editPost(post.id, content.trim());
      onUpdated({ ...post, content: res.post.content, updatedAt: res.post.updatedAt });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <h3 className="font-semibold text-base text-[#101A35]">Edit Post</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full text-sm text-[#182230] p-3 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF] resize-none"
            placeholder="Edit your post..."
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F4F7FB] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1677FF] hover:bg-[#0e62d8] rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

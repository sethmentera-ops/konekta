import React, { useState } from 'react';
import { X, Users, Lock, Globe, Shield, Check } from 'lucide-react';
import { api } from '../../services/api.ts';
import { GroupItem } from '../../types/index.ts';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (group: GroupItem) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [rules, setRules] = useState('1. Be respectful and helpful.\n2. No spam or unsolicited ads.\n3. Keep discussions constructive.');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const coverPresets = [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.createGroup({
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        rules: rules.trim(),
        coverUrl,
        avatarUrl,
      });

      onCreated(res.group);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E4E7EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1677FF]" />
            <h3 className="font-bold text-base text-[#101A35]">Create New Community</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#667085] hover:bg-[#F4F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1">
              Community Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Manila Street Photographers"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1">
              Purpose & Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What brings people together in this community?"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1">
              Community Rules & Guidelines
            </label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] resize-none font-mono text-[11px]"
            />
          </div>

          {/* Privacy Choice */}
          <div className="p-3.5 bg-[#F4F7FB] rounded-2xl border border-[#E4E7EC] space-y-2">
            <label className="block text-xs font-semibold text-[#101A35]">Community Access</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  !isPrivate
                    ? 'bg-white border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                    : 'bg-white/60 border-transparent hover:bg-white'
                }`}
              >
                <Globe className="w-4 h-4 text-[#1677FF] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#182230]">Public</p>
                  <p className="text-[10px] text-[#667085]">Anyone can view and join immediately.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  isPrivate
                    ? 'bg-white border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                    : 'bg-white/60 border-transparent hover:bg-white'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#182230]">Private</p>
                  <p className="text-[10px] text-[#667085]">Admins must approve member join requests.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Cover Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1.5">
              Choose Banner Photo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coverPresets.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverUrl(url)}
                  className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                    coverUrl === url ? 'border-[#1677FF]' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {coverUrl === url && (
                    <div className="absolute inset-0 bg-[#1677FF]/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
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
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

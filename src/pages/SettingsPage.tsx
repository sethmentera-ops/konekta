import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Phone,
  Mail,
  Lock,
  UserX,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { BlockedUserItem } from '../types/index.ts';

interface SettingsPageProps {
  setActiveTab: (tab: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ setActiveTab }) => {
  const { user, profile, updateCurrentProfile, logout } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>([]);
  const [privacyVisibility, setPrivacyVisibility] = useState<'public' | 'friends_only'>(
    profile?.privacyVisibility || 'public'
  );
  const [defaultPostVisibility, setDefaultPostVisibility] = useState<'public' | 'friends_only'>(
    profile?.defaultPostVisibility || 'public'
  );

  // Phone linking state
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [previewPhoneOtp, setPreviewPhoneOtp] = useState<string | null>(null);

  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const res = await api.getBlockedUsers();
        setBlockedUsers(res.blockedUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlocked();
  }, [user?.id]);

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      await updateCurrentProfile({
        privacyVisibility,
        defaultPostVisibility,
      });
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleUnblock = async (targetUserId: string) => {
    try {
      await api.unblockUser(targetUserId);
      setBlockedUsers(blockedUsers.filter((b) => b.user?.userId !== targetUserId));
    } catch (err: any) {
      alert(err.message || 'Failed to unblock user');
    }
  };

  const handleSendLinkOtp = async () => {
    if (!newPhone.trim()) return;
    try {
      const res = await api.sendPhoneOtp(newPhone, 'link');
      setShowPhoneOtp(true);
      if (res.previewCode) setPreviewPhoneOtp(res.previewCode);
      alert(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyLinkPhone = async () => {
    if (!phoneOtp.trim()) return;
    try {
      await api.verifyPhoneOtp({
        phone: newPhone,
        code: phoneOtp,
        purpose: 'link',
      });
      alert('Phone number linked successfully!');
      setShowPhoneOtp(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Failed to verify OTP');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      alert('Your account and personal data have been completely deleted.');
      logout();
      setActiveTab('landing');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs">
        <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#1677FF]" />
          Settings & Privacy
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Control your account security, mobile verification, audience privacy, and safety controls.
        </p>
      </div>

      {/* Mobile Number & Security Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#101A35]">
          <Phone className="w-5 h-5 text-[#1677FF]" />
          <h2 className="font-bold text-base">Mobile Phone Authentication</h2>
        </div>
        <p className="text-xs text-[#667085] leading-relaxed">
          KONEKTA securely registers and validates mobile phone numbers in E.164 international format via SMS OTP. Phone numbers are strictly private and never shown on public profiles.
        </p>

        {user?.phone ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Verified Mobile Phone: {user.phone.slice(0, 5)}•••••{user.phone.slice(-2)}
                </p>
                <p className="text-[11px] text-emerald-700">Protected with SMS OTP verification.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold">
              Active & Verified
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] space-y-3">
            <p className="text-xs font-semibold text-[#182230]">Link a Verified Mobile Number</p>
            <div className="flex gap-2">
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+63 917 123 4567"
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
              />
              <button
                type="button"
                onClick={handleSendLinkOtp}
                className="px-4 py-2 bg-[#1677FF] text-white text-xs font-semibold rounded-xl hover:bg-[#0e62d8]"
              >
                Send Code
              </button>
            </div>

            {showPhoneOtp && (
              <div className="p-3 bg-white rounded-xl border border-[#E4E7EC] space-y-2">
                {previewPhoneOtp && (
                  <p className="text-xs text-amber-700 font-medium">
                    Test Code: <strong>{previewPhoneOtp}</strong>
                  </p>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="flex-1 px-3.5 py-1.5 text-xs border border-[#E4E7EC] rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyLinkPhone}
                    className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy & Audience Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#101A35]">
          <Shield className="w-5 h-5 text-[#1677FF]" />
          <h2 className="font-bold text-base">Privacy Preferences</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1.5">
              Who can view your full profile and activity timeline?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-colors ${
                  privacyVisibility === 'public'
                    ? 'border-[#1677FF] bg-[#1677FF]/5'
                    : 'border-[#E4E7EC] hover:bg-[#F4F7FB]'
                }`}
              >
                <input
                  type="radio"
                  name="profilePrivacy"
                  checked={privacyVisibility === 'public'}
                  onChange={() => setPrivacyVisibility('public')}
                  className="text-[#1677FF]"
                />
                <div>
                  <p className="text-xs font-bold text-[#101A35] flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#1677FF]" /> Public
                  </p>
                  <p className="text-[10px] text-[#667085]">Anyone on KONEKTA can view your profile.</p>
                </div>
              </label>

              <label
                className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-colors ${
                  privacyVisibility === 'friends_only'
                    ? 'border-[#1677FF] bg-[#1677FF]/5'
                    : 'border-[#E4E7EC] hover:bg-[#F4F7FB]'
                }`}
              >
                <input
                  type="radio"
                  name="profilePrivacy"
                  checked={privacyVisibility === 'friends_only'}
                  onChange={() => setPrivacyVisibility('friends_only')}
                  className="text-[#1677FF]"
                />
                <div>
                  <p className="text-xs font-bold text-[#101A35] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#1677FF]" /> Friends Only
                  </p>
                  <p className="text-[10px] text-[#667085]">Only confirmed friends can view details.</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#182230] mb-1.5">
              Default Audience for New Posts
            </label>
            <select
              value={defaultPostVisibility}
              onChange={(e) => setDefaultPostVisibility(e.target.value as any)}
              className="w-full sm:w-64 px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
            >
              <option value="public">Public (Everyone)</option>
              <option value="friends_only">Friends Only</option>
            </select>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSavePrivacy}
              disabled={savingPrivacy}
              className="px-5 py-2 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {savingPrivacy ? 'Saving...' : 'Save Privacy Settings'}
            </button>
            {privacySaved && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Preferences updated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blocked Accounts Management */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-[#101A35]">
          <UserX className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-base">Blocked Accounts</h2>
        </div>
        <p className="text-xs text-[#667085]">
          Blocked users cannot message you, see your posts, or find your profile.
        </p>

        {blockedUsers.length === 0 ? (
          <p className="text-xs text-[#667085] bg-[#F4F7FB] p-4 rounded-2xl border border-[#E4E7EC]">
            You have not blocked any users.
          </p>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((b) => (
              <div
                key={b.blockId}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.user?.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-xs text-[#182230]">{b.user?.displayName}</p>
                    <p className="text-[10px] text-[#667085]">@{b.user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => b.user?.userId && handleUnblock(b.user.userId)}
                  className="px-3 py-1 rounded-full bg-white border border-[#E4E7EC] hover:bg-slate-50 text-xs font-semibold text-[#182230]"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-white rounded-3xl p-6 border border-red-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-red-600">
          <Trash2 className="w-5 h-5" />
          <h2 className="font-bold text-base">Danger Zone: Delete Account</h2>
        </div>
        <p className="text-xs text-[#667085]">
          Permanently remove your account, profile, posts, friendships, and messages. This action is irreversible.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors"
        >
          Delete My Account Permanently
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base">Confirm Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              This will permanently delete your profile, posts, messages, friendships, and all associated data. Type <strong className="text-red-600 font-mono">DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2 text-xs font-mono border border-red-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F4F7FB] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-40"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

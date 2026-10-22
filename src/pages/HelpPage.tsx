import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Send,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Check,
  Flag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ReportItem } from '../types/index.ts';

export const HelpPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'guidelines' | 'report' | 'faq' | 'admin'>('guidelines');

  // Report Form
  const [targetType, setTargetType] = useState<'post' | 'user' | 'group' | 'comment'>('post');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('Harassment or Bullying');
  const [details, setDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Reports
  const [reports, setReports] = useState<ReportItem[]>([]);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin && activeTab === 'admin') {
      api.getReports().then((res) => setReports(res.reports)).catch(console.error);
    }
  }, [isAdmin, activeTab]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) {
      setError('Please provide the Target ID (Username, Post ID, or Group ID)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.submitReport({
        targetType,
        targetId: targetId.trim(),
        reason,
        details: details.trim(),
      });
      setReportSuccess(true);
      setTargetId('');
      setDetails('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How does mobile phone verification work on KONEKTA?',
      a: 'We support international mobile numbers formatted in E.164. When registering or linking your mobile number, we send a secure 6-digit SMS OTP. Phone numbers are strictly private and never shown publicly on your profile.',
    },
    {
      q: 'How do privacy settings protect my posts and profile?',
      a: 'You can set your profile or individual posts to "Friends Only". Anyone who is not your confirmed friend will not be able to view your updates or activity.',
    },
    {
      q: 'What is the difference between Public and Private communities?',
      a: 'Public communities allow any KONEKTA member to view discussions and join instantly. Private communities require group administrators to approve membership requests before access is granted.',
    },
    {
      q: 'How do I block someone who is harassing me?',
      a: 'Visit their profile, click the options menu (three dots), and select "Block User". Blocked users cannot message you, see your posts, or locate your profile in search.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E4E7EC] shadow-xs">
        <h1 className="text-2xl font-bold text-[#101A35] flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#1677FF]" />
          Safety, Trust & Help Center
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Our commitment to keeping KONEKTA safe, respectful, and bringing people closer across the world.
        </p>

        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 border-t border-[#F4F7FB] mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'guidelines'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Community Guidelines</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'report'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>Submit a Report</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-[#1677FF] text-white'
                : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Moderation Queue</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#101A35]">The KONEKTA Principles</h2>
            <p className="text-xs text-[#667085]">
              These foundational guidelines govern all posts, comments, community dialogues, and direct messages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] space-y-1.5">
              <h3 className="font-bold text-sm text-[#101A35]">1. Mutual Respect & Dignity</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Treat all members with kindness. Harassment, threats, hate speech, and personal attacks are strictly prohibited.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] space-y-1.5">
              <h3 className="font-bold text-sm text-[#101A35]">2. Authentic Representation</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Be yourself. Do not impersonate individuals, post deceptive misleading content, or engage in automated spam.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] space-y-1.5">
              <h3 className="font-bold text-sm text-[#101A35]">3. Cross-Cultural Inclusivity</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                KONEKTA is an international platform celebrating diverse traditions, languages, and points of view across borders.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] space-y-1.5">
              <h3 className="font-bold text-sm text-[#101A35]">4. Privacy & Consent</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Never share personal phone numbers, physical addresses, or private messages without explicit authorization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Submit Report */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#101A35]">Submit a Community Report</h2>
            <p className="text-xs text-[#667085]">
              If you encounter behavior violating our standards, please report it here for expedited review.
            </p>
          </div>

          {reportSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-emerald-950">Report Received</h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                Thank you for helping keep KONEKTA secure. Our safety team will evaluate this report promptly.
              </p>
              <button
                onClick={() => setReportSuccess(false)}
                className="mt-3 px-4 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="space-y-4 max-w-lg">
              {error && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  What are you reporting?
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                >
                  <option value="post">Post Content</option>
                  <option value="user">User Profile</option>
                  <option value="group">Community Group</option>
                  <option value="comment">Comment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  Target Identifier (Username, Post ID, or Group Name)
                </label>
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. @username or post_1"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  Reason for Violation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                >
                  <option value="Harassment or Bullying">Harassment or Bullying</option>
                  <option value="Spam or Scams">Spam or Scams</option>
                  <option value="Hate Speech or Discrimination">Hate Speech or Discrimination</option>
                  <option value="False Information / Misleading">False Information / Misleading</option>
                  <option value="Inappropriate or Graphic Content">Inappropriate or Graphic Content</option>
                  <option value="Other Safety Concern">Other Safety Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#182230] mb-1">
                  Additional Details & Explanation
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Provide any relevant context to assist our review..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Incident Report'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-[#101A35] mb-2">Frequently Asked Questions</h2>
          <div className="divide-y divide-[#F4F7FB]">
            {faqs.map((f, i) => (
              <div key={i} className="py-4 space-y-1.5">
                <h3 className="font-semibold text-sm text-[#101A35]">{f.q}</h3>
                <p className="text-xs text-[#667085] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Admin Moderation Queue */}
      {isAdmin && activeTab === 'admin' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E7EC] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#101A35] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Active Moderation Queue (Admin)
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {reports.length} Reports
            </span>
          </div>

          {reports.length === 0 ? (
            <p className="text-xs text-[#667085] bg-[#F4F7FB] p-4 rounded-2xl border border-[#E4E7EC]">
              Queue is clear. No pending safety reports at this time.
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border border-[#E4E7EC] bg-[#F4F7FB]/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#1677FF]/10 text-[#1677FF] text-[10px] font-bold uppercase">
                      {r.targetType}
                    </span>
                    <span className="text-[11px] text-[#667085]">
                      Reported by {r.reporter?.displayName || 'User'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#182230]">Reason: {r.reason}</p>
                  <p className="text-xs text-[#667085]">Target: {r.targetId}</p>
                  {r.details && <p className="text-xs italic text-[#667085]">"{r.details}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

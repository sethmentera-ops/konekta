import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';
import { api } from '../../services/api.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'post' | 'user' | 'group' | 'comment';
  targetId: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
}) => {
  const [reason, setReason] = useState('Harassment or Bullying');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reasons = [
    'Harassment or Bullying',
    'Spam or Scams',
    'Hate Speech or Discrimination',
    'False Information / Misleading',
    'Inappropriate or Graphic Content',
    'Intellectual Property Violation',
    'Other Safety Concern',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitReport({
        targetType,
        targetId,
        reason,
        details,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#E4E7EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#101A35]">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-base">Submit Safety Report</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#667085] hover:bg-[#F4F7FB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-semibold text-lg text-[#101A35]">Thank You</h4>
            <p className="text-xs text-[#667085] max-w-xs mx-auto">
              Your report has been securely submitted. Our trust & safety team will review this promptly in accordance with KONEKTA Community Guidelines.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 text-xs font-semibold text-white bg-[#1677FF] rounded-xl hover:bg-[#0e62d8]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#182230] mb-1.5">
                Why are you reporting this {targetType}?
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E4E7EC] rounded-xl bg-white focus:outline-none focus:border-[#1677FF]"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#182230] mb-1.5">
                Additional Context (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Help us understand the issue..."
                className="w-full text-xs text-[#182230] p-3 border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF] resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F4F7FB] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

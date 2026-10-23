import React from 'react';
import { Download, X, Smartphone, CheckCircle2, Share } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isIOS: boolean;
  canDirectInstall: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  canDirectInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E4E7EC] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-4">
          <div className="inline-block mb-3">
            <BrandLogo size="md" showTagline={false} />
          </div>
          <h3 className="text-lg font-bold text-[#101A35]">I-install ang KONEKTA</h3>
          <p className="text-xs text-[#667085] mt-1">
            I-install sa iyong cellphone para sa buong app experience nang walang browser toolbars.
          </p>
        </div>

        <div className="space-y-3 py-2 text-xs text-[#182230]">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F4F7FB]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Mabilis na pagbubukas mula sa home screen ng phone mo</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F4F7FB]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Direktang Log In at Sign Up gamit ang tunay mong account</span>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F4F7FB]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Offline caching at mobile-optimized layout</span>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5">
              <Share className="w-4 h-4 text-amber-700" />
              <span>Paano i-install sa iPhone / iPad:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-amber-800">
              <li>Pindutin ang <strong>Share</strong> button sa ibaba ng Safari.</li>
              <li>Piliin ang <strong>Add to Home Screen</strong>.</li>
              <li>Pindutin ang <strong>Add</strong> sa kanang itaas.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {canDirectInstall ? (
              <button
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>I-download & I-install Ngayon</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-700" />
                  <span>Paano i-install sa Chrome:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  I-tap ang three-dot menu <span className="font-bold">⋮</span> sa kanang itaas ng Chrome, at piliin ang <strong>Install App</strong> o <strong>Add to Home Screen</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#667085] hover:text-[#101A35] transition-colors"
          >
            Ipagpatuloy sa browser
          </button>
        </div>
      </div>
    </div>
  );
};
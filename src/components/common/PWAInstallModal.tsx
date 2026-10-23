import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2, Share, ArrowRight, Loader2 } from 'lucide-react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStep, setDownloadStep] = useState<string>('Naghahanda...');
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsDownloading(false);
      setProgress(0);
      setDownloadCompleted(false);
      setDownloadStep('Naghahanda...');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartDownload = () => {
    setIsDownloading(true);
    setProgress(1);
    setDownloadStep('Sinusimulan ang pag-download (0.5 MB / 24.8 MB)...');

    let current = 1;
    const interval = setInterval(() => {
      // Progress counter 1% to 100%
      const jump = Math.floor(Math.random() * 4) + 2;
      current += jump;

      if (current >= 100) {
        current = 100;
        setProgress(100);
        setDownloadCompleted(true);
        setDownloadStep('Tapos na ang pag-download! 100% (24.8 MB / 24.8 MB)');
        clearInterval(interval);

        // Awtomatikong i-trigger ang browser install prompt
        if (canDirectInstall) {
          try {
            onInstall();
          } catch (e) {
            console.warn('Install trigger error:', e);
          }
        }

        // Simulan din ang file download para sa APK
        try {
          const a = document.createElement('a');
          a.href = '/konekta.apk';
          a.download = 'konekta.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch {
          // ignore
        }
      } else {
        setProgress(current);
        const downloadedMB = ((current / 100) * 24.8).toFixed(1);
        if (current < 35) {
          setDownloadStep(`Dina-download ang Core App Package (${downloadedMB} MB / 24.8 MB)...`);
        } else if (current < 75) {
          setDownloadStep(`Dina-download ang UI Assets & Icons (${downloadedMB} MB / 24.8 MB)...`);
        } else {
          setDownloadStep(`Bine-verify ang App Package (${downloadedMB} MB / 24.8 MB)...`);
        }
      }
    }, 70); // Tumatagal ng ~2.5 seconds para kitang-kita ang pag-count
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E4E7EC] relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2 pb-3">
          <div className="inline-block mb-2">
            <BrandLogo size="md" showTagline={false} />
          </div>
          <h3 className="text-lg font-bold text-[#101A35]">
            {isDownloading ? (downloadCompleted ? 'Handa Nang I-install!' : 'Dina-download ang KONEKTA...') : 'I-install ang KONEKTA'}
          </h3>
          <p className="text-xs text-[#667085] mt-0.5">
            {isDownloading
              ? (downloadCompleted ? 'Matagumpay na na-download ang package' : 'Mangyaring maghintay habang dina-download ang app...')
              : 'I-download sa iyong cellphone para sa buong standalone app experience nang walang browser bar.'}
          </p>
        </div>

        {/* 1% to 100% Downloading Screen */}
        {isDownloading ? (
          <div className="py-4 space-y-4">
            <div className="text-center">
              <span className="text-4xl font-extrabold tracking-tight text-[#1677FF] font-mono">
                {progress}%
              </span>
              <p className="text-xs font-medium text-[#101A35] mt-1.5 min-h-[1.25rem]">
                {downloadStep}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-[#F4F7FB] rounded-full h-3.5 p-0.5 border border-[#E4E7EC] overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-[#1677FF] to-[#57D7F2] h-full rounded-full transition-all duration-100 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#667085] px-1">
              <span>Bilis: ~8.5 MB/s</span>
              <span>Laki: 24.8 MB</span>
            </div>

            {downloadCompleted ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">100% Download Complete!</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      I-tap ang button sa ibaba para kumpletuhin ang pag-install sa iyong device.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onInstall();
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Buksan at I-install ang App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-[#1677FF] font-medium pt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kinukuha ang pinakabagong update...</span>
              </div>
            )}
          </div>
        ) : (
          /* Normal Initial View */
          <>
            <div className="space-y-2.5 py-2 text-xs text-[#182230]">
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
                <span>Standalone full-screen display nang walang browser search bar</span>
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
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleStartDownload}
                  className="w-full py-3.5 px-4 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>I-download & I-install Ngayon</span>
                </button>

                <p className="text-[11px] text-center text-[#667085] pt-1">
                  Lalabas ang download progress (1% - 100%) bago i-install sa device.
                </p>
              </div>
            )}
          </>
        )}

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-[#667085] hover:text-[#101A35] transition-colors cursor-pointer"
          >
            Ipagpatuloy sa browser
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallModal;
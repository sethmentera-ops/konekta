import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Smartphone,
  Download,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { usePWAInstall } from '../usePWAInstall.ts';
import { PWAInstallModal } from '../components/common/PWAInstallModal.tsx';

export interface AuthPageProps {
  onAuthSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onAuthSuccess,
  defaultMode = 'login',
}) => {
  const { login, register, sendPhoneOtp, verifyPhoneOtp, sendEmailOtp, verifyEmailOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(defaultMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email_otp' | 'password'>('phone');
  const [activeOtpChannel, setActiveOtpChannel] = useState<'phone' | 'email'>('phone');

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register'>('login');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300);

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const countryCodes = [
    { code: '+63', label: 'Philippines (+63)', flag: '🇵🇭' },
    { code: '+1', label: 'United States / Canada (+1)', flag: '🇺🇸' },
    { code: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
    { code: '+34', label: 'Spain (+34)', flag: '🇪🇸' },
    { code: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
    { code: '+234', label: 'Nigeria (+234)', flag: '🇳🇬' },
  ];

  useEffect(() => {
    if (!isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fullPhoneNumber = countryCode + phoneNumber.trim().replace(/^0+/, '');

  const handleRequestPhoneOtp = async (purpose: 'login' | 'register') => {
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile phone number');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await sendPhoneOtp(fullPhoneNumber, purpose);
      setActiveOtpChannel('phone');
      setOtpPurpose(purpose);
      setShowOtpStep(true);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtpExpiry(res.expiresInSeconds || 300);
      setPreviewOtp(res.previewCode || null);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await sendEmailOtp(email.trim());
      setActiveOtpChannel('email');
      setShowOtpStep(true);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtpExpiry(res.expiresInSeconds || 300);
      setPreviewOtp(res.previewCode || null);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send email verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeOtpChannel === 'email') {
        await verifyEmailOtp({
          email: email.trim(),
          code: otpCode,
          displayName: displayName.trim() || undefined,
          username: username.trim() || undefined,
        });
      } else {
        await verifyPhoneOtp({
          phone: fullPhoneNumber,
          code: otpCode,
          purpose: otpPurpose,
          displayName: displayName.trim() || undefined,
          username: username.trim() || undefined,
        });
      }

      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (canInstall && !isIOS) {
      const installed = await promptInstall();
      if (!installed) setShowInstallModal(true);
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between text-[#182230]">
      {!isInstalled && (
        <div className="bg-[#101A35] text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-slate-700 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-[#57D7F2] shrink-0" />
            <span className="truncate">
              I-install ang <strong>KONEKTA App</strong> sa iyong cellphone para sa unli access!
            </span>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white font-bold text-xs shadow-xs shrink-0 ml-2 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}

      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <BrandLogo size="md" showTagline={true} />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E4E7EC] p-6 sm:p-8">
          <div className="flex bg-[#F4F7FB] p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setShowOtpStep(false); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#667085]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setShowOtpStep(false); }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#667085]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101A35]">
              {mode === 'login' ? 'Welcome to KONEKTA' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-[#667085] mt-1">
              Pumili kung paano mo gustong makatanggap ng 6-digit verification code.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 3 Methods */}
          {!showOtpStep && (
            <div className="grid grid-cols-3 gap-1.5 mb-5 bg-[#F4F7FB] p-1 rounded-2xl text-[11px] font-semibold text-center">
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(null); }}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  authMethod === 'phone' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#667085]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email_otp'); setError(null); }}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  authMethod === 'email_otp' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#667085]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('password'); setError(null); }}
                className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                  authMethod === 'password' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#667085]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>
          )}

          {/* OTP Verification Screen */}
          {showOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1677FF]/5 border border-[#1677FF]/20 text-xs text-[#101A35]">
                <p className="font-semibold flex items-center gap-1.5 text-[#1677FF]">
                  {activeOtpChannel === 'phone' ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Code sent to {activeOtpChannel === 'phone' ? fullPhoneNumber : email}</span>
                </p>
                <p className="text-[#667085] mt-1">
                  Ilagay ang 6-digit code na ipinadala sa iyong {activeOtpChannel === 'phone' ? 'cellphone (SMS)' : 'email inbox'}.
                </p>
                {previewOtp && (
                  <div className="mt-2 pt-2 border-t border-[#1677FF]/20 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Preview (Kapag walang API key):</span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(previewOtp)}
                      className="font-mono font-bold text-[#1677FF] hover:underline"
                    >
                      {previewOtp} (Auto-Fill)
                    </button>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-xl tracking-widest font-mono py-3 rounded-2xl border border-[#E4E7EC] focus:border-[#1677FF] outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#667085]">
                <span>Expires in {Math.floor(otpExpiry / 60)}m</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={() => {
                    if (activeOtpChannel === 'phone') handleRequestPhoneOtp(otpPurpose);
                    else handleRequestEmailOtp();
                  }}
                  className={`font-semibold ${resendCooldown > 0 ? 'text-slate-400' : 'text-[#1677FF] hover:underline'}`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify & Complete</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOtpStep(false)}
                className="w-full text-center text-xs text-[#667085] hover:text-[#182230] pt-1"
              >
                Palitan ang number o email
              </button>
            </form>
          ) : authMethod === 'phone' ? (
            /* SMS Phone Input */
            <div className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="mariasantos"
                      className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-2 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-xs font-medium outline-none"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="9171234567"
                    className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={loading || !phoneNumber.trim()}
                onClick={() => handleRequestPhoneOtp(mode === 'signup' ? 'register' : 'login')}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Send 6-Digit SMS Code</span>
              </button>
            </div>
          ) : authMethod === 'email_otp' ? (
            /* Email OTP Input */
            <div className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="mariasantos"
                      className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@example.com"
                  className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                />
              </div>

              <button
                type="button"
                disabled={loading || !email.trim() || !email.includes('@')}
                onClick={handleRequestEmailOtp}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Send 6-Digit Email Code</span>
              </button>
            </div>
          ) : (
            /* Password Login / Register */
            <form onSubmit={mode === 'login' ? handleEmailPasswordLogin : handleEmailPasswordRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">Email or Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstall={promptInstall}
        isIOS={isIOS}
        canDirectInstall={canInstall && !isIOS}
      />
    </div>
  );
};

export default AuthPage;
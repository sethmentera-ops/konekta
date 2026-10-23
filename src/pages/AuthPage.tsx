import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  Sparkles,
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
  const { login, register, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(defaultMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [phoneNumber, setPhoneNumber] = useState('');

  // OTP Verification state
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register'>('login');
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300);

  // Password reset state
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // PWA installation
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const countryCodes = [
    { code: '+63', label: 'Philippines (+63)', flag: '🇵🇭' },
    { code: '+1', label: 'United States / Canada (+1)', flag: '🇺🇸' },
    { code: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
    { code: '+34', label: 'Spain (+34)', flag: '🇪🇸' },
    { code: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
    { code: '+234', label: 'Nigeria (+234)', flag: '🇳🇬' },
    { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
    { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
    { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
    { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
    { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
    { code: '+82', label: 'South Korea (+82)', flag: '🇰🇷' },
  ];

  // Unli pop up tuwing ioopen sa browser kapag hindi pa installed sa device
  useEffect(() => {
    if (!isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fullPhoneNumber = countryCode + phoneNumber.trim().replace(/^0+/, '');

  // Handle Send OTP
  const handleRequestOtp = async (purpose: 'login' | 'register') => {
    if (!phoneNumber.trim()) {
      setError('Please enter your mobile phone number');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await sendPhoneOtp(fullPhoneNumber, purpose);
      setOtpPurpose(purpose);
      setShowOtpStep(true);
      setResendCooldown(res.resendCooldownSeconds || 60);
      setOtpExpiry(res.expiresInSeconds || 300);
      if (res.previewCode) {
        setPreviewOtp(res.previewCode);
      }
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyPhoneOtp({
        phone: fullPhoneNumber,
        code: otpCode,
        purpose: otpPurpose,
        displayName: displayName.trim() || undefined,
        username: username.trim() || undefined,
      });

      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email or username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      onAuthSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMessage(res.message);
      if (res.demoResetToken) {
        setResetToken(res.demoResetToken);
        setMode('reset');
      }
    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      setError('Please enter reset token and new password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallClick = async () => {
    if (canInstall && !isIOS) {
      const installed = await promptInstall();
      if (!installed) {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between text-[#182230]">
      {/* Persistent Mobile Install Banner */}
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

      {/* Top Bar with Brand & Install button */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <BrandLogo size="md" showTagline={true} />
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-[#1677FF] bg-[#1677FF]/10 hover:bg-[#1677FF]/20 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Install App</span>
            <span className="xs:hidden">Install</span>
          </button>
        )}
      </header>

      {/* Center Auth Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E4E7EC] p-6 sm:p-8">
          {mode !== 'forgot' && mode !== 'reset' && (
            <div className="flex bg-[#F4F7FB] p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                  setShowOtpStep(false);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#1677FF] shadow-xs'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                  setShowOtpStep(false);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#1677FF] shadow-xs'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101A35] tracking-tight">
              {mode === 'login' && 'Welcome Back to KONEKTA'}
              {mode === 'signup' && 'Join the Global Community'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1.5">
              {mode === 'login' && 'Enter your verified details to access your account'}
              {mode === 'signup' && 'Connect authentically across cultures and communities'}
              {mode === 'forgot' && 'Enter your email or phone to receive reset instructions'}
              {mode === 'reset' && 'Create a strong, secure new password'}
            </p>
          </div>

          {/* Alerts */}
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

          {/* Method Selection (Phone vs Email) */}
          {(mode === 'login' || mode === 'signup') && !showOtpStep && (
            <div className="flex justify-center gap-4 mb-5 border-b border-[#F4F7FB] pb-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors ${
                  authMethod === 'phone'
                    ? 'text-[#1677FF] border-b-2 border-[#1677FF]'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile SMS OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setError(null);
                }}
                className={`flex items-center gap-1.5 pb-1 font-semibold transition-colors ${
                  authMethod === 'email'
                    ? 'text-[#1677FF] border-b-2 border-[#1677FF]'
                    : 'text-[#667085] hover:text-[#182230]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>
            </div>
          )}

          {/* Phone OTP Verification */}
          {showOtpStep ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#1677FF]/5 border border-[#1677FF]/20 text-xs text-[#101A35]">
                <p className="font-semibold flex items-center gap-1.5 text-[#1677FF]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Code Sent to {fullPhoneNumber}</span>
                </p>
                <p className="text-[#667085] mt-1">
                  Enter the 6-digit verification code sent to your phone.
                </p>
                {previewOtp && (
                  <div className="mt-2 pt-2 border-t border-[#1677FF]/20 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Preview SMS Code:</span>
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
                <label className="block text-xs font-semibold text-[#101A35] mb-1.5">
                  6-Digit SMS Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-xl tracking-widest font-mono py-3 rounded-2xl border border-[#E4E7EC] focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#667085] px-1">
                <span>Code expires in {Math.floor(otpExpiry / 60)}m</span>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={() => handleRequestOtp(otpPurpose)}
                  className={`font-semibold ${
                    resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#1677FF] hover:underline'
                  }`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Verify & Complete</span>
              </button>

              <button
                type="button"
                onClick={() => setShowOtpStep(false)}
                className="w-full text-center text-xs text-[#667085] hover:text-[#182230] pt-1"
              >
                Change phone number
              </button>
            </form>
          ) : authMethod === 'phone' && (mode === 'login' || mode === 'signup') ? (
            <div className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Maria Santos"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101A35] mb-1">
                      Username (@handle)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#667085]">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="mariasantos"
                        className="w-full pl-9 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-32 px-3 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-xs font-medium focus:bg-white focus:border-[#1677FF] outline-none shrink-0"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="9171234567"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-[#667085] mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Your phone is strictly private and never shown publicly.
                </p>
              </div>

              <button
                type="button"
                disabled={loading || !phoneNumber.trim() || (mode === 'signup' && (!displayName.trim() || !username.trim()))}
                onClick={() => handleRequestOtp(mode === 'signup' ? 'register' : 'login')}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Send 6-Digit SMS Code</span>
              </button>
            </div>
          ) : authMethod === 'email' && mode === 'login' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com or @username"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#101A35]">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs text-[#1677FF] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Log In</span>
              </button>
            </form>
          ) : authMethod === 'email' && mode === 'signup' ? (
            <form onSubmit={handleEmailRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Juan dela Cruz"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Username (@handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#667085]">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="juandelacruz"
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>Create Account</span>
              </button>
            </form>
          ) : mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Send Password Reset Link</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-[#667085] hover:text-[#182230]"
              >
                Back to Log In
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token from link"
                  className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101A35] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-[#F4F7FB] border border-[#E4E7EC] rounded-2xl text-sm focus:bg-white focus:border-[#1677FF] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </form>
          )}

          {mode === 'login' && !showOtpStep && (
            <p className="text-center text-xs text-[#667085] mt-6">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#1677FF] hover:underline cursor-pointer"
              >
                Create Account Free
              </button>
            </p>
          )}

          {mode === 'signup' && !showOtpStep && (
            <p className="text-center text-xs text-[#667085] mt-6">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-[#1677FF] hover:underline cursor-pointer"
              >
                Log In Here
              </button>
            </p>
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#667085]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            No algorithmic distortion
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Secure International SMS OTP
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Zero ads or tracker selling
          </span>
        </div>
        <p className="text-[11px] text-[#667085]">
          © {new Date().getFullYear()} KONEKTA — Bringing People Closer. All rights reserved.
        </p>
      </footer>

      {/* PWA Install Modal */}
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
import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

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

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

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

      onSuccess?.();
      onClose();
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
      setError('Please enter your credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
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

      onSuccess?.();
      onClose();
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
      setError('Please enter your account email or phone number');
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E7EC] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F4F7FB] flex items-center justify-between">
          <BrandLogo size="sm" showTagline={false} />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* OTP Verification Sub-View */}
          {showOtpStep ? (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#57D7F2]/20 text-[#1677FF] flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#101A35]">Verify Mobile Number</h3>
                <p className="text-xs text-[#667085] mt-1 max-w-xs mx-auto">
                  We sent a 6-digit SMS code to{' '}
                  <span className="font-semibold text-[#182230]">{fullPhoneNumber}</span>.
                </p>
              </div>

              {/* Dev mode instant preview badge */}
              {previewOtp && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold">SMS Code Preview: </span>
                    <span className="font-mono font-bold tracking-widest text-sm">{previewOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(previewOtp)}
                    className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-semibold hover:bg-amber-700"
                  >
                    Quick Fill
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3 px-4 border-2 border-[#E4E7EC] focus:border-[#1677FF] rounded-2xl focus:outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 text-xs text-[#667085]">
                <button
                  type="button"
                  onClick={() => setShowOtpStep(false)}
                  className="hover:text-[#182230] underline"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={() => handleRequestOtp(otpPurpose)}
                  className="font-medium text-[#1677FF] disabled:text-[#667085] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            /* Login Form */
            <div className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-[#101A35]">Welcome Back</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Log in to your KONEKTA account to see recent posts and messages.
                </p>
              </div>

              {/* Method Switcher Tabs */}
              <div className="flex p-1 bg-[#F4F7FB] rounded-xl border border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'email'
                      ? 'bg-white text-[#1677FF] shadow-xs'
                      : 'text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  Email / Username
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'phone'
                      ? 'bg-white text-[#1677FF] shadow-xs'
                      : 'text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  Mobile Number (SMS OTP)
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {authMethod === 'email' ? (
                <form onSubmit={handleEmailLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#182230] mb-1">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. elena@konekta.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#182230]">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-[#1677FF] hover:underline"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? 'Logging in...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#182230] mb-1">
                      International Country Code & Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-36 px-2.5 py-2.5 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="917 123 4567"
                        className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                      />
                    </div>
                    <p className="text-[11px] text-[#667085] mt-1.5">
                      We will send a one-time SMS verification code to verify your phone ownership.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestOtp('login')}
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending SMS...' : 'Send SMS Verification Code'}
                  </button>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-xs text-[#667085]">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="font-semibold text-[#1677FF] hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </div>
          ) : mode === 'signup' ? (
            /* Signup Form */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#101A35]">Create Your Account</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Join KONEKTA to connect with friends and international interest groups.
                </p>
              </div>

              {/* Registration Method Selector */}
              <div className="flex p-1 bg-[#F4F7FB] rounded-xl border border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'email'
                      ? 'bg-white text-[#1677FF] shadow-xs'
                      : 'text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  Email Registration
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMethod === 'phone'
                      ? 'bg-white text-[#1677FF] shadow-xs'
                      : 'text-[#667085] hover:text-[#182230]'
                  }`}
                >
                  Mobile Number (OTP)
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form
                onSubmit={authMethod === 'email' ? handleEmailRegister : (e) => { e.preventDefault(); handleRequestOtp('register'); }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-1">
                    Unique Username
                  </label>
                  <div className="relative">
                    <span className="text-xs text-[#667085] font-semibold absolute left-3.5 top-1/2 -translate-y-1/2">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="elenavance"
                      className="w-full pl-8 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                      required
                    />
                  </div>
                </div>

                {authMethod === 'email' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-[#182230] mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="elena@example.com"
                          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#182230] mb-1">
                        Password (Min 6 chars)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#182230] mb-1">
                      International Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-36 px-2 py-2 text-xs bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="917 123 4567"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-[#667085] mt-1">
                      Stored in E.164 format and strictly confidential. Never shown publicly.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-3"
                >
                  {loading
                    ? 'Processing...'
                    : authMethod === 'email'
                    ? 'Complete Registration'
                    : 'Send SMS Verification Code'}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-[#667085]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="font-semibold text-[#1677FF] hover:underline"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </div>
          ) : mode === 'forgot' ? (
            /* Forgot Password Form */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#101A35]">Password Recovery</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Enter your email or phone number to receive recovery instructions.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-1">
                    Account Email or Phone Number
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@konekta.com"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Send Recovery Instructions'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-[#1677FF] font-semibold hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Reset Password Form */
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-[#101A35]">Create New Password</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Enter your reset verification code and choose a new password.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-mono bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#182230] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E7EC] rounded-xl focus:outline-none focus:border-[#1677FF]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Set New Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

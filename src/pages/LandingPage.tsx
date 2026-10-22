import React from 'react';
import {
  Users,
  Compass,
  ShieldCheck,
  MessageSquare,
  Globe,
  Sparkles,
  ArrowRight,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onTryDemo,
}) => {
  const features = [
    {
      icon: Users,
      title: 'Meaningful Connections',
      description:
        'Connect with close friends, families, and like-minded colleagues without algorithmic noise.',
    },
    {
      icon: Compass,
      title: 'Vibrant Communities',
      description:
        'Join global groups around photography, open software, languages, and sustainable lifestyles.',
    },
    {
      icon: Phone,
      title: 'International Mobile Verification',
      description:
        'Secure registration with E.164 international SMS OTP authentication to protect authentic identities.',
    },
    {
      icon: MessageSquare,
      title: 'Private Direct Messaging',
      description:
        'Have private, real-time conversations with friends in a secure, uncluttered chat environment.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy & Safety First',
      description:
        'Granular audience controls, zero ad-trackers, strict blocking, and proactive community moderation.',
    },
    {
      icon: Globe,
      title: 'International by Design',
      description:
        'Built for people across continents—from Manila and London to Barcelona, Tokyo, and Lagos.',
    },
  ];

  const testimonials = [
    {
      quote:
        'KONEKTA feels refreshing. I can share street photography and dialogue with creators worldwide without sensationalist distractions.',
      author: 'Elena Vance',
      role: 'Visual Artist, Manila 🇵🇭',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'Our design community finally has a home that respects our attention and enables clean international collaboration.',
      author: 'Marcus Sterling',
      role: 'Product Designer, London 🇬🇧',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      quote:
        'The mobile authentication is seamless, and knowing my phone number is never exposed publicly gives me complete peace of mind.',
      author: 'Amara Okafor',
      role: 'Community Lead, Lagos 🇳🇬',
      avatar:
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#182230]">
      {/* Top Navbar */}
      <header className="border-b border-[#E4E7EC] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" showTagline={true} />
          <div className="flex items-center gap-3">
            <button
              onClick={onTryDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#1677FF] bg-[#1677FF]/10 hover:bg-[#1677FF]/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Live Demo</span>
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#101A35] hover:text-[#1677FF] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#1677FF] hover:bg-[#0e62d8] rounded-full shadow-xs transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1677FF]/10 text-[#1677FF] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Social Network</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#101A35] tracking-tight leading-tight">
              Bringing People <span className="text-[#1677FF]">Closer</span>, Across The Globe.
            </h1>

            <p className="text-base sm:text-xl text-[#667085] leading-relaxed max-w-2xl mx-auto">
              KONEKTA is an international social platform created for genuine friendships, interest communities, and authentic shared moments—without algorithmic clutter.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <span>Join KONEKTA Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-[#E4E7EC] text-[#101A35] font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Launch Interactive Demo</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#667085]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No ads or spyware
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                SMS OTP verification
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Real-time messaging
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-y border-[#E4E7EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101A35]">
              Designed for Human Connection
            </h2>
            <p className="text-sm text-[#667085] mt-2">
              Every detail in KONEKTA is crafted to foster kindness, creative collaboration, and mutual understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-[#F4F7FB] border border-[#E4E7EC] hover:border-[#1677FF]/40 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1677FF]/10 text-[#1677FF] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[#101A35] mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-[#F4F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#1677FF] uppercase tracking-wider">
              Global Voices
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101A35] mt-1">
              Loved by members worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#E4E7EC] shadow-xs flex flex-col justify-between"
              >
                <p className="text-sm text-[#182230] italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F4F7FB]">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#101A35]">{t.author}</p>
                    <p className="text-[11px] text-[#667085]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-[#101A35] text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center">
            <BrandLogo size="lg" variant="light" showTagline={true} />
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            KONEKTA is an independent international social network committed to bringing people closer with integrity, respect, and reliable privacy.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white text-xs font-semibold shadow-md"
            >
              Sign Up Now
            </button>
            <button
              onClick={onTryDemo}
              className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Open Feed
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pt-6">
            © {new Date().getFullYear()} KONEKTA Platform. All rights reserved. Bringing People Closer.
          </p>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import {
  Home,
  Users,
  Compass,
  MessageSquare,
  Bell,
  User as UserIcon,
  Settings,
  ShieldAlert,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectUser?: (username: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onSelectUser }) => {
  const { profile, user } = useAuth();

  const navItems = [
    { id: 'feed', label: 'Home Feed', icon: Home },
    { id: 'search', label: 'Explore & Search', icon: Compass },
    { id: 'groups', label: 'Communities', icon: Compass },
    { id: 'friends', label: 'Friends & Requests', icon: Users },
    { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: UserIcon },
    { id: 'help', label: 'Safety & Help', icon: ShieldAlert },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-4">
        {/* Navigation list */}
        <div className="bg-white rounded-2xl p-2.5 border border-[#E4E7EC] shadow-xs space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'profile' && activeTab === 'user-profile' && profile?.username);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'profile' && profile?.username) {
                    onSelectUser?.(profile.username);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                  isActive
                    ? 'bg-[#1677FF] text-white shadow-xs font-semibold'
                    : 'text-[#182230] hover:bg-[#F4F7FB] hover:text-[#1677FF]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#667085]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Card */}
        {profile && (
          <div className="bg-white rounded-2xl p-4 border border-[#E4E7EC] shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#57D7F2]"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#101A35] truncate">{profile.displayName}</p>
                <p className="text-xs text-[#667085] truncate">@{profile.username}</p>
                {profile.location && (
                  <p className="text-[11px] text-[#667085] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-[#1677FF]" />
                    {profile.location}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F4F7FB] flex items-center justify-between text-xs">
              <button
                onClick={() => onSelectUser?.(profile.username)}
                className="font-medium text-[#1677FF] hover:underline flex items-center gap-1"
              >
                <span>View Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                {user?.role === 'admin' ? 'Admin' : 'Verified'}
              </span>
            </div>
          </div>
        )}

        {/* Platform Mission Card */}
        <div className="bg-gradient-to-br from-[#101A35] to-[#18264a] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#57D7F2]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#57D7F2] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              KONEKTA Vision
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            “Bringing People Closer.” Connect authentically across cultures, share thoughts without noise, and build positive communities.
          </p>
        </div>
      </div>
    </aside>
  );
};

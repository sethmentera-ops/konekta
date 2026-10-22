import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Users,
  Compass,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Check,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { NotificationItem, UserProfile } from '../../types/index.ts';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreatePost?: () => void;
  onSelectUser?: (username: string) => void;
  onSelectGroup?: (groupId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreatePost,
  onSelectUser,
  onSelectGroup,
}) => {
  const { user, profile, logout, switchAccount, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: UserProfile[];
    groups: any[];
    posts: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  // Demo accounts
  const demoAccounts = [
    { id: 'usr_elena', name: 'Elena Vance', location: 'Manila 🇵🇭', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    { id: 'usr_marcus', name: 'Marcus Sterling', location: 'London 🇬🇧', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { id: 'usr_sofia', name: 'Sofia Rodriguez', location: 'Barcelona 🇪🇸', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { id: 'usr_kenji', name: 'Kenji Sato', location: 'Tokyo 🇯🇵', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { id: 'usr_amara', name: 'Amara Okafor', location: 'Lagos 🇳🇬', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80' },
  ];

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // ignore
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  // Handle Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery);
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setShowPersonaMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4E7EC] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('feed')}
            className="flex items-center text-left focus:outline-none"
          >
            <BrandLogo size="md" showTagline={false} />
          </button>

          {/* Quick Demo Switcher Pill */}
          {isAuthenticated && (
            <div className="relative hidden lg:block" ref={personaRef}>
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101A35]/5 hover:bg-[#101A35]/10 border border-[#101A35]/10 text-xs font-medium text-[#101A35] transition-all"
                title="Switch active user to test multi-user actions"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#667085]">Testing as:</span>
                <span className="font-semibold text-[#1677FF]">{profile?.displayName || 'User'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#667085]" />
              </button>

              {showPersonaMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#F4F7FB]">
                    <p className="text-xs font-semibold text-[#101A35] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1677FF]" />
                      Interactive Persona Switcher
                    </p>
                    <p className="text-xs text-[#667085] mt-0.5">
                      Switch accounts in 1-click to test friend requests, private chats & reactions!
                    </p>
                  </div>
                  <div className="py-1">
                    {demoAccounts.map((acc) => {
                      const isActive = user?.id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            switchAccount(acc.id);
                            setShowPersonaMenu(false);
                          }}
                          className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-[#F4F7FB] transition-colors ${
                            isActive ? 'bg-[#1677FF]/10 text-[#1677FF]' : 'text-[#182230]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#E4E7EC]"
                            />
                            <div>
                              <p className="text-sm font-medium">{acc.name}</p>
                              <p className="text-xs text-[#667085]">{acc.location}</p>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-[#1677FF]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchDropdown(true);
              }}
              placeholder="Search people, communities, posts..."
              className="w-full pl-10 pr-4 py-2 bg-[#F4F7FB] border border-[#E4E7EC] rounded-full text-sm text-[#182230] placeholder-[#667085] focus:bg-white focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] max-h-96 overflow-y-auto p-2 z-50">
              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider px-3 py-1.5">
                    People
                  </p>
                  {searchResults.users.map((u) => (
                    <button
                      key={u.userId}
                      onClick={() => {
                        onSelectUser?.(u.username);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={u.avatarUrl}
                        alt={u.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#182230] truncate">
                          {u.displayName}
                        </p>
                        <p className="text-xs text-[#667085] truncate">
                          @{u.username} • {u.location || 'Global'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Communities */}
              {searchResults.groups.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider px-3 py-1.5">
                    Communities
                  </p>
                  {searchResults.groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        onSelectGroup?.(g.id);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={g.avatarUrl}
                        alt={g.name}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#182230] truncate">{g.name}</p>
                        <p className="text-xs text-[#667085] truncate">
                          {g.membersCount} members • {g.isPrivate ? 'Private' : 'Public'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Posts */}
              {searchResults.posts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider px-3 py-1.5">
                    Posts
                  </p>
                  {searchResults.posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveTab('feed');
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#F4F7FB] block transition-colors"
                    >
                      <p className="text-xs font-medium text-[#1677FF]">
                        {p.author?.displayName}
                      </p>
                      <p className="text-sm text-[#182230] line-clamp-1">{p.content}</p>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.users.length === 0 &&
                searchResults.groups.length === 0 &&
                searchResults.posts.length === 0 && (
                  <div className="p-4 text-center text-sm text-[#667085]">
                    No results found for "{searchQuery}"
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Quick Post Button */}
              {onOpenCreatePost && (
                <button
                  onClick={onOpenCreatePost}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1677FF] hover:bg-[#0e62d8] text-white text-sm font-medium rounded-full shadow-xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post</span>
                </button>
              )}

              {/* Direct Messages Icon */}
              <button
                onClick={() => setActiveTab('messages')}
                className={`relative p-2.5 rounded-full transition-colors ${
                  activeTab === 'messages'
                    ? 'bg-[#1677FF]/10 text-[#1677FF]'
                    : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
                }`}
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </button>

              {/* Notifications Icon */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2.5 rounded-full transition-colors ${
                    showNotifications || activeTab === 'notifications'
                      ? 'bg-[#1677FF]/10 text-[#1677FF]'
                      : 'text-[#667085] hover:bg-[#F4F7FB] hover:text-[#182230]'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1677FF] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#F4F7FB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#101A35]">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#1677FF]/10 text-[#1677FF] text-xs font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs font-medium text-[#1677FF] hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#F4F7FB]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-[#667085]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 hover:bg-[#F4F7FB] transition-colors flex items-start gap-3 ${
                              !n.isRead ? 'bg-[#57D7F2]/5' : ''
                            }`}
                          >
                            <img
                              src={n.actor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt="Actor"
                              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E4E7EC]"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#182230] leading-snug">{n.text}</p>
                              <span className="text-[11px] text-[#667085] mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#1677FF] mt-1.5 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-[#F4F7FB] text-center">
                      <button
                        onClick={() => {
                          setActiveTab('notifications');
                          setShowNotifications(false);
                        }}
                        className="text-xs font-semibold text-[#1677FF] hover:underline"
                      >
                        View all activity
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#1677FF]/30 transition-all focus:outline-none"
                >
                  <img
                    src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={profile?.displayName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <ChevronDown className="w-4 h-4 text-[#667085] hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E4E7EC] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#F4F7FB]">
                      <p className="font-semibold text-sm text-[#101A35] truncate">
                        {profile?.displayName}
                      </p>
                      <p className="text-xs text-[#667085] truncate">@{profile?.username}</p>
                      {user?.phone && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Mobile verified ({user.phone.slice(0, 4)}***)
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          if (profile?.username) onSelectUser?.(profile.username);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#667085]" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('friends');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                      >
                        <Users className="w-4 h-4 text-[#667085]" />
                        <span>Friends & Requests</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('groups');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                      >
                        <Compass className="w-4 h-4 text-[#667085]" />
                        <span>Communities</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#667085]" />
                        <span>Settings & Privacy</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('help');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#182230] hover:bg-[#F4F7FB] flex items-center gap-3 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#667085]" />
                        <span>Safety & Reports</span>
                      </button>
                    </div>

                    <div className="border-t border-[#F4F7FB] pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          setActiveTab('landing');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('login')}
                className="px-4 py-2 text-sm font-semibold text-[#1677FF] hover:bg-[#1677FF]/5 rounded-full transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1677FF] hover:bg-[#0e62d8] rounded-full shadow-xs transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#667085] hover:text-[#182230] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E4E7EC] bg-white px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search KONEKTA..."
              className="w-full pl-10 pr-4 py-2 bg-[#F4F7FB] border border-[#E4E7EC] rounded-full text-sm"
            />
          </div>

          {/* Mobile Links */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setActiveTab('feed');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Feed
            </button>
            <button
              onClick={() => {
                setActiveTab('groups');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Communities
            </button>
            <button
              onClick={() => {
                setActiveTab('friends');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Friends
            </button>
            <button
              onClick={() => {
                setActiveTab('messages');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Messages
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setActiveTab('help');
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-xl bg-[#F4F7FB] font-medium text-sm text-[#182230]"
            >
              Safety & Reports
            </button>
          </div>

          {/* Demo Persona Switcher for Mobile */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider mb-2">
              Switch Test Account
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    switchAccount(acc.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 flex items-center gap-1.5 ${
                    user?.id === acc.id
                      ? 'bg-[#1677FF] text-white border-[#1677FF]'
                      : 'bg-white text-[#182230] border-[#E4E7EC]'
                  }`}
                >
                  <img src={acc.avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                  {acc.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

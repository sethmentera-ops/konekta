import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/navigation/Navbar.tsx';
import { Sidebar } from './components/navigation/Sidebar.tsx';
import { MobileNav } from './components/navigation/MobileNav.tsx';
import { FeedPage } from './pages/FeedPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { FriendsPage } from './pages/FriendsPage.tsx';
import { GroupsPage } from './pages/GroupsPage.tsx';
import { GroupDetailPage } from './pages/GroupDetailPage.tsx';
import { MessagesPage } from './pages/MessagesPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { HelpPage } from './pages/HelpPage.tsx';
import AuthPage from './pages/AuthPage.tsx';

function MainLayout() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);

  const handleSelectUser = (username: string) => {
    setSelectedUsername(username);
    setActiveTab('user-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveTab('group-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChat = (targetUserId: string) => {
    setChatTargetUserId(targetUserId);
    setActiveTab('messages');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#101A35] tracking-wider uppercase font-display">
            Loading KONEKTA...
          </p>
        </div>
      </div>
    );
  }

  // Direktang pumupunta sa Log In / Sign Up page kapag hindi pa naka-login
  if (!isAuthenticated) {
    return (
      <AuthPage
        defaultMode="login"
        onAuthSuccess={() => {
          setActiveTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectUser={handleSelectUser}
        onSelectGroup={handleSelectGroup}
      />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6 flex gap-6">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectUser={handleSelectUser}
        />

        <main className="flex-1 min-w-0">
          {activeTab === 'feed' && (
            <FeedPage
              onSelectUser={handleSelectUser}
              onSelectGroup={handleSelectGroup}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'user-profile' && selectedUsername && (
            <ProfilePage
              username={selectedUsername}
              onSelectUser={handleSelectUser}
              onStartChat={handleStartChat}
            />
          )}

          {activeTab === 'profile' && profile?.username && (
            <ProfilePage
              username={profile.username}
              onSelectUser={handleSelectUser}
              onStartChat={handleStartChat}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsPage
              onSelectUser={handleSelectUser}
              onStartChat={handleStartChat}
            />
          )}

          {activeTab === 'groups' && (
            <GroupsPage onSelectGroup={handleSelectGroup} />
          )}

          {activeTab === 'group-detail' && selectedGroupId && (
            <GroupDetailPage
              groupId={selectedGroupId}
              onBack={() => setActiveTab('groups')}
              onSelectUser={handleSelectUser}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesPage
              initialTargetUserId={chatTargetUserId}
              onSelectUser={handleSelectUser}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsPage
              onSelectUser={handleSelectUser}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'search' && (
            <SearchPage
              onSelectUser={handleSelectUser}
              onSelectGroup={handleSelectGroup}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage setActiveTab={setActiveTab} />
          )}

          {activeTab === 'help' && <HelpPage />}
        </main>
      </div>

      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
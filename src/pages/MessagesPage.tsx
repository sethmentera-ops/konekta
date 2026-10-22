import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  PlusCircle,
  X,
  User,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ConversationItem, MessageItem, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface MessagesPageProps {
  initialTargetUserId?: string | null;
  onSelectUser: (username: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  initialTargetUserId,
  onSelectUser,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeOtherUser, setActiveOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // New Chat Modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (autoSelectFirst = true) => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);

      if (autoSelectFirst && res.conversations.length > 0 && !activeConversationId) {
        selectConversation(res.conversations[0].id, res.conversations[0].otherUser || null);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // If initialTargetUserId is provided, start/open conversation with them
  useEffect(() => {
    if (!initialTargetUserId) return;
    const startOrOpen = async () => {
      try {
        const res = await api.startConversation(initialTargetUserId);
        const convsRes = await api.getConversations();
        setConversations(convsRes.conversations);
        const targetConv = convsRes.conversations.find((c) => c.id === res.conversationId);
        if (targetConv) {
          selectConversation(targetConv.id, targetConv.otherUser || null);
        }
      } catch (err) {
        console.error('Failed to start chat with target user:', err);
      }
    };
    startOrOpen();
  }, [initialTargetUserId]);

  const selectConversation = async (convId: string, otherUser: UserProfile | null) => {
    setActiveConversationId(convId);
    setActiveOtherUser(otherUser);
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages);
      setActiveOtherUser(res.otherUser);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.sendMessage(activeConversationId, content);
      setMessages((prev) => [...prev, res.message]);
      fetchConversations(false);
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  const openNewChat = async () => {
    setShowNewChatModal(true);
    try {
      const res = await api.getFriends();
      setFriendsList(res.friends);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartWithFriend = async (friendUserId: string) => {
    setShowNewChatModal(false);
    try {
      const res = await api.startConversation(friendUserId);
      const convsRes = await api.getConversations();
      setConversations(convsRes.conversations);
      const targetConv = convsRes.conversations.find((c) => c.id === res.conversationId);
      if (targetConv) {
        selectConversation(targetConv.id, targetConv.otherUser || null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start conversation');
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser?.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.otherUser?.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)]">
      <div className="bg-white rounded-3xl border border-[#E4E7EC] shadow-xs overflow-hidden h-full flex flex-col md:flex-row">
        {/* Left Pane: Conversations List */}
        <div
          className={`w-full md:w-80 shrink-0 border-r border-[#E4E7EC] flex flex-col h-full bg-[#F4F7FB]/40 ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between bg-white">
            <h2 className="font-bold text-base text-[#101A35] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1677FF]" />
              Direct Messages
            </h2>
            <button
              onClick={openNewChat}
              className="p-1.5 rounded-full hover:bg-[#F4F7FB] text-[#1677FF]"
              title="Start New Chat"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-[#E4E7EC] bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7FB] border border-[#E4E7EC] rounded-full focus:outline-none focus:border-[#1677FF]"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#F4F7FB]">
            {loading ? (
              <div className="p-4 text-center text-xs text-[#667085]">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-[#667085] mx-auto" />
                <p className="text-xs text-[#667085]">No conversations yet.</p>
                <button
                  onClick={openNewChat}
                  className="px-4 py-1.5 rounded-full bg-[#1677FF] text-white text-xs font-semibold"
                >
                  Start a Chat
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = activeConversationId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id, c.otherUser || null)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-[#1677FF]/10' : 'hover:bg-white bg-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={c.otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border border-[#E4E7EC]"
                      />
                      {c.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1677FF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-xs sm:text-sm text-[#101A35] truncate">
                          {c.otherUser?.displayName || 'User'}
                        </p>
                        <span className="text-[10px] text-[#667085] shrink-0">
                          {c.latestMessage
                            ? new Date(c.latestMessage.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] truncate">
                        {c.latestMessage?.content || 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Room */}
        <div
          className={`flex-1 flex flex-col h-full bg-white ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversationId && activeOtherUser ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-[#E4E7EC] flex items-center justify-between bg-white/95">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConversationId(null)}
                    className="md:hidden p-1 text-[#667085] hover:text-[#182230]"
                  >
                    ←
                  </button>
                  <img
                    src={activeOtherUser.avatarUrl}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#101A35]">
                      {activeOtherUser.displayName}
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      @{activeOtherUser.username} {activeOtherUser.location && `• ${activeOtherUser.location}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectUser(activeOtherUser.username)}
                  className="text-xs font-semibold text-[#1677FF] hover:underline flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#F4F7FB]/30">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-6">
                    <div>
                      <Sparkles className="w-8 h-8 text-[#57D7F2] mx-auto mb-2" />
                      <p className="text-xs text-[#667085]">
                        This is the beginning of your private conversation with {activeOtherUser.displayName}.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isSender ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm whitespace-pre-line shadow-xs ${
                          m.isSender
                            ? 'bg-[#1677FF] text-white rounded-br-xs'
                            : 'bg-white border border-[#E4E7EC] text-[#182230] rounded-bl-xs'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-[#667085] mt-1 px-1">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E4E7EC] bg-white flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeOtherUser.displayName}...`}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#F4F7FB] border border-[#E4E7EC] rounded-full focus:outline-none focus:border-[#1677FF] focus:bg-white"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-full bg-[#1677FF] hover:bg-[#0e62d8] text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="max-w-sm">
                <MessageSquare className="w-12 h-12 text-[#1677FF]/40 mx-auto mb-3" />
                <h3 className="font-bold text-base text-[#101A35]">Your Conversations</h3>
                <p className="text-xs text-[#667085] mt-1 mb-4">
                  Select a chat on the left or start a new private message with a friend.
                </p>
                <button
                  onClick={openNewChat}
                  className="px-5 py-2.5 rounded-full bg-[#1677FF] text-white text-xs font-semibold shadow-xs"
                >
                  Start New Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E7EC] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F4F7FB] pb-3">
              <h3 className="font-bold text-base text-[#101A35]">Start New Conversation</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-full text-[#667085] hover:bg-[#F4F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {friendsList.length === 0 ? (
                <p className="text-xs text-[#667085] text-center py-6">
                  You don't have any confirmed friends yet. Connect with people to exchange direct messages!
                </p>
              ) : (
                friendsList.map((f) => (
                  <button
                    key={f.friendshipId}
                    onClick={() => f.profile?.userId && handleStartWithFriend(f.profile.userId)}
                    className="w-full p-2.5 rounded-2xl hover:bg-[#F4F7FB] flex items-center gap-3 text-left transition-colors"
                  >
                    <img
                      src={f.profile?.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E7EC]"
                    />
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-[#101A35]">
                        {f.profile?.displayName}
                      </p>
                      <p className="text-xs text-[#667085]">@{f.profile?.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

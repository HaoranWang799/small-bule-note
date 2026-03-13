import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../store';
import { Avatar } from './Avatar';
import { UnreadBadge } from './UnreadBadge';

export function ChatListScreen() {
  const navigate = useNavigate();
  const conversations = useAppStore((s) => s.conversations);
  const openChat = useAppStore((s) => s.openChat);
  const refreshContacts = useAppStore((s) => s.refreshContacts);

  useEffect(() => {
    void refreshContacts();
  }, [refreshContacts]);

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      <div className="bg-[#FFFFFF] px-4 pt-4 pb-3 shadow-sm z-10 sticky top-0">
        <h1 className="text-[18px] font-semibold text-[#1F1F1F] leading-none tracking-wide text-left">WeChat</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="py-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  void openChat(conversation.id);
                  navigate(`/chat/${conversation.id}`);
                }}
                className="w-full flex items-center px-4 py-3.5 bg-[#FFFFFF] hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors text-left border-b border-[#F0F0F0] last:border-b-0"
              >
                <div className="relative">
                  <Avatar name={conversation.target.username} />
                  {conversation.unread > 0 && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <UnreadBadge count={conversation.unread} />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[16px] font-medium text-[#1F1F1F] truncate">{conversation.target.username}</span>
                    <span className="text-[12px] text-[#8A8A8A] flex-shrink-0 ml-2">
                      {conversation.timestamp || ''}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#8A8A8A] truncate leading-tight">
                    {conversation.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 bg-[#E5E5E5] rounded-full flex items-center justify-center mb-4">
              <span className="text-[24px]">💬</span>
            </div>
            <p className="text-[15px] font-medium text-[#1F1F1F] mb-1">No chats yet</p>
            <p className="text-[14px] text-[#8A8A8A]">Tap on Contacts to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '../store';
import { Avatar } from './Avatar';
import { UnreadBadge } from './UnreadBadge';

export function ChatListScreen() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const getMessages = useAppStore((s) => s.getMessages);
  const unreadCounts = useAppStore((s) => s.unreadCounts);
  const initSocket = useAppStore((s) => s.initSocket);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  const chats = contacts.map(contact => {
    const msgs = getMessages(contact.id);
    const lastMsg = msgs[msgs.length - 1];
    return {
      contact,
      lastMessage: lastMsg,
      unread: unreadCounts[contact.id] || 0
    };
  }).sort((a, b) => {
    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8]">
      <div className="bg-[#FFFFFF] px-4 pt-4 pb-3 shadow-sm z-10 sticky top-0">
        <h1 className="text-[18px] font-semibold text-[#1F1F1F] leading-none tracking-wide text-left">WeChat</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length > 0 ? (
          <div className="py-2">
            {chats.map(({ contact, lastMessage, unread }) => (
              <button
                key={contact.id}
                onClick={() => navigate(`/chat/${contact.id}`)}
                className="w-full flex items-center px-4 py-3.5 bg-[#FFFFFF] hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors text-left border-b border-[#F0F0F0] last:border-b-0"
              >
                <div className="relative">
                  <Avatar name={contact.username} />
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <UnreadBadge count={unread} />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[16px] font-medium text-[#1F1F1F] truncate">{contact.username}</span>
                    <span className="text-[12px] text-[#8A8A8A] flex-shrink-0 ml-2">
                      {lastMessage ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[14px] text-[#8A8A8A] truncate leading-tight">
                    {lastMessage ? lastMessage.content : 'No messages yet'}
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

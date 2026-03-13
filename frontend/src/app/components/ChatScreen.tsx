import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppStore } from '../store';
import { MessageBubble } from './MessageBubble';
import { Send, ChevronLeft } from 'lucide-react';

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messages = useAppStore((s) => s.messages);
  const contacts = useAppStore((s) => s.contacts);
  const currentUser = useAppStore((s) => s.currentUser);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const markAsRead = useAppStore((s) => s.markAsRead);
  const getMessages = useAppStore((s) => s.getMessages);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contact = contacts.find((c) => c.id === id);
  const chatMessages = id ? getMessages(id) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [chatMessages]);

  useEffect(() => {
    if (id) void markAsRead(id);
  }, [id, chatMessages.length, markAsRead]);

  const handleSend = () => {
    if (!inputText.trim() || !id) return;
    sendMessage(id, inputText.trim());
    setInputText('');
  };

  if (!contact) {
    return (
      <div className="flex flex-col h-full bg-[#F8F8F8]">
        <div className="bg-[#FFFFFF] px-4 py-3 shadow-sm flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-1 -ml-1 active:scale-95 transition-transform"><ChevronLeft className="w-6 h-6 text-[#1F1F1F]" /></button>
          <span className="text-[17px] font-semibold text-[#1F1F1F]">Chat Not Found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F8F8] relative">
      {/* Header */}
      <div className="bg-[#FFFFFF] px-4 py-3 shadow-sm flex items-center z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 -ml-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-7 h-7 text-[#1F1F1F]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-semibold text-[#1F1F1F] truncate leading-tight">{contact.username}</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-[14px] text-[#8A8A8A] bg-[#FFFFFF] px-4 py-1.5 rounded-full shadow-sm">Send a message to start</span>
          </div>
        ) : (
          chatMessages.map((msg, index) => {
            const isMine = msg.sender.id === currentUser?.id;
            return (
              <MessageBubble
                key={msg.id || index}
                text={msg.content}
                isMine={isMine}
                timestamp={msg.createdAt}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#F8F8F8] px-4 py-3 pb-safe z-10">
        <div className="flex items-end bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E5E5E5] px-2 py-1.5 focus-within:border-[#07C160] transition-colors">
          <textarea
            className="flex-1 max-h-32 bg-transparent text-[16px] text-[#1F1F1F] p-2 outline-none resize-none leading-relaxed"
            rows={1}
            placeholder="Message"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="mb-1 ml-1 w-10 h-10 flex-shrink-0 bg-[#07C160] rounded-full flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-50 disabled:bg-[#8A8A8A]"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

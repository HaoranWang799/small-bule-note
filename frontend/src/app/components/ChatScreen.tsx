import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { ArrowLeft, Send } from "lucide-react";

export function ChatScreen() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const messages = useAppStore((s) => s.messages);
  const sendMessage = useAppStore((s) => s.sendMessage);

  const contact = contacts.find((c) => c.id === contactId);
  const chatMessages = contactId ? messages[contactId] || [] : [];

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !contactId) return;
    sendMessage(contactId, input.trim());
    setInput("");
  };

  if (!contact) {
    return (
      <div className="flex items-center justify-center h-full text-[#999]">
        联系人不存在
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Top bar */}
      <div className="flex items-center h-12 px-3 bg-[#F5F5F5] border-b border-[#E5E5E5] shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 text-[#111] mr-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar name={contact.username} size="sm" online={contact.online} />
        <div className="ml-2 flex-1 min-w-0">
          <div className="text-[16px] text-[#111] truncate">{contact.username}</div>
          <div className="text-[11px] text-[#999]">
            {contact.online ? "在线" : "离线"}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === "1"} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-[#E5E5E5] shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="输入消息..."
          className="flex-1 h-10 px-3 rounded-lg bg-[#F5F5F5] text-[15px] text-[#111] placeholder-[#999] outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-lg bg-[#07C160] flex items-center justify-center text-white disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

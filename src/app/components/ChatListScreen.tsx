import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { UnreadBadge } from "./UnreadBadge";
import { Search } from "lucide-react";
import { useState } from "react";

export function ChatListScreen() {
  const navigate = useNavigate();
  const conversations = useAppStore((s) => s.conversations);
  const [search, setSearch] = useState("");

  const filtered = conversations.filter(
    (c) =>
      c.contact.username.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-[#F5F5F5] px-4 pt-3 pb-2">
        <h1 className="text-[18px] text-[#111] mb-2">消息</h1>
        <div className="flex items-center bg-white rounded-lg px-3 h-9">
          <Search className="w-4 h-4 text-[#999] mr-2" />
          <input
            placeholder="搜索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#111] placeholder-[#999] outline-none"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((conv) => (
          <button
            key={conv.id}
            onClick={() => navigate(`/chat/${conv.contact.id}`)}
            className="flex items-center w-full px-4 py-3 bg-white border-b border-[#F5F5F5] hover:bg-[#f9f9f9] active:bg-[#f0f0f0] transition-colors text-left"
          >
            <Avatar name={conv.contact.username} online={conv.contact.online} />
            <div className="flex-1 ml-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[16px] text-[#111] truncate">{conv.contact.username}</span>
                <span className="text-[12px] text-[#999] shrink-0 ml-2">{conv.timestamp}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-[13px] text-[#999] truncate">{conv.lastMessage}</span>
                <UnreadBadge count={conv.unread} />
              </div>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#999]">
            暂无消息
          </div>
        )}
      </div>
    </div>
  );
}

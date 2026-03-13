import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { UserPlus, Search } from "lucide-react";
import { useState } from "react";

export function ContactsScreen() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: online first
  const sorted = [...filtered].sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] relative">
      {/* Header */}
      <div className="bg-[#F5F5F5] px-4 pt-3 pb-2">
        <h1 className="text-[18px] text-[#111] mb-2">通讯录</h1>
        <div className="flex items-center bg-white rounded-lg px-3 h-9">
          <Search className="w-4 h-4 text-[#999] mr-2" />
          <input
            placeholder="搜索联系人"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#111] placeholder-[#999] outline-none"
          />
        </div>
      </div>

      {/* Contact count */}
      <div className="px-4 py-2">
        <span className="text-[13px] text-[#999]">{contacts.length} 位联系人</span>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((contact) => (
          <button
            key={contact.id}
            onClick={() => navigate(`/chat/${contact.id}`)}
            className="flex items-center w-full px-4 py-3 bg-white border-b border-[#F5F5F5] hover:bg-[#f9f9f9] active:bg-[#f0f0f0] transition-colors text-left"
          >
            <Avatar name={contact.username} online={contact.online} />
            <div className="ml-3 flex-1 min-w-0">
              <span className="text-[16px] text-[#111]">{contact.username}</span>
              <p className="text-[13px] text-[#999] mt-0.5">
                {contact.online ? "在线" : "离线"}
              </p>
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#999]">
            暂无联系人
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/add-friend")}
        className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-[#07C160] text-white flex items-center justify-center shadow-lg hover:bg-[#06ae56] active:bg-[#059e4e]"
      >
        <UserPlus className="w-5 h-5" />
      </button>
    </div>
  );
}

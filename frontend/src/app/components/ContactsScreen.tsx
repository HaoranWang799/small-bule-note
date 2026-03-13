import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { Check, Search, UserPlus } from "lucide-react";

export function ContactsScreen() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const pendingRequests = useAppStore((s) => s.pendingRequests);
  const refreshContacts = useAppStore((s) => s.refreshContacts);
  const acceptContactRequest = useAppStore((s) => s.acceptContactRequest);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    void refreshContacts();
  }, [refreshContacts]);

  const filtered = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0));

  const handleAccept = async (requesterId: string) => {
    setProcessingId(requesterId);
    const result = await acceptContactRequest(requesterId);
    setProcessingId(null);

    if (!result.success) {
      setFeedback({ type: "error", text: result.error || "同意好友失败" });
      return;
    }

    setFeedback({ type: "success", text: result.message || "已同意好友申请" });
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] relative">
      <div className="bg-[#F5F5F5] px-4 pt-3 pb-2">
        <h1 className="text-[18px] text-[#111] mb-2">通讯录</h1>
        <div className="flex items-center bg-white rounded-lg px-3 h-9">
          <Search className="w-4 h-4 text-[#999] mr-2" />
          <input
            placeholder="搜索联系人"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent text-[14px] text-[#111] placeholder-[#999] outline-none"
          />
        </div>
      </div>

      {feedback && (
        <p className={`px-4 py-2 text-[13px] ${feedback.type === "success" ? "text-[#07C160]" : "text-[#ee0a24]"}`}>
          {feedback.text}
        </p>
      )}

      {pendingRequests.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-[13px] text-[#666] mb-2">待处理申请（{pendingRequests.length}）</p>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div key={request.requestId} className="bg-white rounded-xl p-3 flex items-center">
                <Avatar name={request.requester.username} online={request.requester.online} />
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-[15px] text-[#111] truncate">{request.requester.username}</p>
                  <p className="text-[12px] text-[#999] truncate">请求添加你为好友</p>
                </div>
                <button
                  onClick={() => void handleAccept(request.requester.id)}
                  disabled={processingId === request.requester.id}
                  className="h-8 px-3 rounded-full bg-[#07C160] text-white text-[12px] disabled:opacity-60 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  {processingId === request.requester.id ? "处理中..." : "同意"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-2">
        <span className="text-[13px] text-[#999]">{contacts.length} 位联系人</span>
      </div>

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
              <p className="text-[13px] text-[#999] mt-0.5">{contact.online ? "在线" : "离线"}</p>
            </div>
          </button>
        ))}

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#999]">
            暂无联系人
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/add-friend")}
        className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-[#07C160] text-white flex items-center justify-center shadow-lg hover:bg-[#06ae56] active:bg-[#059e4e]"
      >
        <UserPlus className="w-5 h-5" />
      </button>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppStore, type ChatTarget } from "../store";
import { Avatar } from "./Avatar";
import { MessageBubble } from "./MessageBubble";
import { ArrowLeft, Send, UserPlus } from "lucide-react";

function getFriendActionLabel(target: ChatTarget) {
  switch (target.relationshipStatus) {
    case "accepted":
      return "已是好友";
    case "pending_outgoing":
      return "已申请";
    case "pending_incoming":
      return "同意申请";
    default:
      return "加好友";
  }
}

function getRelationshipHint(target: ChatTarget) {
  switch (target.relationshipStatus) {
    case "accepted":
      return target.online ? "好友在线" : "好友离线";
    case "pending_outgoing":
      return "不是好友，已发送申请，也可以继续聊天";
    case "pending_incoming":
      return "对方已申请你，点右侧按钮即可同意";
    default:
      return "不是好友，也可以直接聊天";
  }
}

export function ChatScreen() {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isInitializing = useAppStore((s) => s.isInitializing);
  const currentUser = useAppStore((s) => s.currentUser);
  const directory = useAppStore((s) => s.directory);
  const messages = useAppStore((s) => s.messages);
  const setActiveChat = useAppStore((s) => s.setActiveChat);
  const openChat = useAppStore((s) => s.openChat);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const addFriend = useAppStore((s) => s.addFriend);

  const contact = contactId ? directory[contactId] : null;
  const chatMessages = contactId ? messages[contactId] || [] : [];

  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [friendSubmitting, setFriendSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (contactId) {
      setActiveChat(contactId);
      void openChat(contactId);
    }
    return () => {
      setActiveChat(null);
    };
  }, [contactId, openChat, setActiveChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = async () => {
    if (!input.trim() || !contactId) return;
    setSubmitting(true);
    const result = await sendMessage(contactId, input.trim());
    setSubmitting(false);
    if (!result.success) {
      setFeedback({ type: "error", text: result.error || "发送失败，请稍后重试" });
      return;
    }
    setFeedback(null);
    setInput("");
  };

  const handleFriendAction = async () => {
    if (!contactId || !contact) return;
    if (contact.relationshipStatus === "accepted" || contact.relationshipStatus === "pending_outgoing") {
      return;
    }

    setFriendSubmitting(true);
    const result = await addFriend(contactId);
    setFriendSubmitting(false);
    if (!result.success) {
      setFeedback({ type: "error", text: result.error || "好友操作失败" });
      return;
    }
    if (result.message) {
      setFeedback({ type: "success", text: result.message });
    }
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
          <div className="text-[11px] text-[#999] truncate">
            {getRelationshipHint(contact)}
          </div>
        </div>
        {contact.relationshipStatus !== "accepted" && (
          <button
            onClick={() => void handleFriendAction()}
            disabled={
              friendSubmitting ||
              contact.relationshipStatus === "pending_outgoing"
            }
            className="shrink-0 h-8 px-3 rounded-full bg-[#07C160] text-white text-[12px] disabled:opacity-50 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {friendSubmitting ? "处理中..." : getFriendActionLabel(contact)}
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {chatMessages.map((msg) => (
          <MessageBubble
            key={`${msg.id}-${msg.clientMessageId || ""}`}
            message={msg}
            isMine={msg.senderId === currentUser?.id}
          />
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
          disabled={!input.trim() || submitting}
          className="w-10 h-10 rounded-lg bg-[#07C160] flex items-center justify-center text-white disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {feedback && (
        <p
          className={`px-3 pb-2 text-[12px] bg-white ${
            feedback.type === "success" ? "text-[#07C160]" : "text-[#ee0a24]"
          }`}
        >
          {feedback.text}
        </p>
      )}
    </div>
  );
}

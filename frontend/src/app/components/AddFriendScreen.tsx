import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore, type ChatTarget } from "../store";
import { Avatar } from "./Avatar";
import { ArrowLeft, MessageCircle, Search, UserPlus } from "lucide-react";

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

function getFriendHint(target: ChatTarget) {
  switch (target.relationshipStatus) {
    case "accepted":
      return "你们已经是好友";
    case "pending_outgoing":
      return "已发送好友申请，对方同意后成为好友";
    case "pending_incoming":
      return "对方已申请你，点击即可同意";
    default:
      return "不是好友，也可以先发消息";
  }
}

export function AddFriendScreen() {
  const navigate = useNavigate();
  const addFriend = useAppStore((s) => s.addFriend);
  const searchUsers = useAppStore((s) => s.searchUsers);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isInitializing = useAppStore((s) => s.isInitializing);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<ChatTarget[]>([]);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [friendActionId, setFriendActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const trimmedKeyword = keyword.trim();
  const showEmpty = useMemo(
    () => !searching && trimmedKeyword.length > 0 && results.length === 0,
    [results.length, searching, trimmedKeyword.length]
  );

  const handleSearch = async () => {
    if (!trimmedKeyword) {
      setFeedback({ type: "error", text: "请输入用户名或邮箱" });
      return;
    }

    setSearching(true);
    setFeedback(null);
    const nextResults = await searchUsers(trimmedKeyword);
    setResults(nextResults);
    setSearching(false);

    if (nextResults.length === 0) {
      setFeedback({ type: "error", text: "没有找到匹配用户" });
    }
  };

  const handleFriendAction = async (target: ChatTarget) => {
    if (target.relationshipStatus === "accepted" || target.relationshipStatus === "pending_outgoing") {
      return;
    }

    setFriendActionId(target.id);
    const result = await addFriend(target.id);
    setFriendActionId(null);

    if (!result.success) {
      setFeedback({ type: "error", text: result.error || "好友操作失败" });
      return;
    }

    setFeedback({ type: "success", text: result.message || "操作成功" });
    const nextResults = await searchUsers(trimmedKeyword || target.username);
    setResults(nextResults);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center h-12 px-4 border-b border-[#E5E5E5]">
        <button onClick={() => navigate(-1)} className="p-1 text-[#111]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center text-[17px] text-[#111] pr-7">搜索用户</span>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] px-3 h-11">
          <Search className="w-4 h-4 text-[#999]" />
          <input
            placeholder="输入用户名或邮箱"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && void handleSearch()}
            className="flex-1 bg-transparent text-[14px] text-[#111] placeholder-[#999] outline-none"
          />
          <button
            onClick={() => void handleSearch()}
            disabled={searching}
            className="text-[13px] text-[#07C160] disabled:opacity-50"
          >
            {searching ? "搜索中" : "搜索"}
          </button>
        </div>

        {feedback && (
          <p className={`mt-3 text-[13px] ${feedback.type === "success" ? "text-[#07C160]" : "text-[#ee0a24]"}`}>
            {feedback.text}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {results.map((target) => {
          const disabled =
            target.relationshipStatus === "accepted" ||
            target.relationshipStatus === "pending_outgoing";

          return (
            <div
              key={target.id}
              className="bg-[#FAFAFA] border border-[#EFEFEF] rounded-2xl p-4 mb-3"
            >
              <div className="flex items-center">
                <Avatar name={target.username} online={target.online} />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] text-[#111] truncate">{target.username}</h3>
                    <span className="text-[11px] text-[#999]">
                      {target.online ? "在线" : "离线"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#999] truncate">{target.email || "未公开邮箱"}</p>
                  <p className="text-[12px] text-[#999] mt-1">{getFriendHint(target)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/chat/${target.id}`)}
                  className="flex-1 h-10 rounded-xl border border-[#DDEFE4] bg-[#F4FBF7] text-[#0F8F4B] text-[14px] flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  直接聊天
                </button>
                <button
                  onClick={() => void handleFriendAction(target)}
                  disabled={disabled || friendActionId === target.id}
                  className="flex-1 h-10 rounded-xl bg-[#07C160] text-white text-[14px] flex items-center justify-center gap-1 disabled:opacity-55"
                >
                  <UserPlus className="w-4 h-4" />
                  {friendActionId === target.id ? "处理中..." : getFriendActionLabel(target)}
                </button>
              </div>
            </div>
          );
        })}

        {showEmpty && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#999]">
            没有找到匹配用户
          </div>
        )}

        {!trimmedKeyword && !results.length && (
          <div className="flex items-center justify-center py-20 text-[14px] text-[#999]">
            搜索后可以直接聊天，也可以发送好友申请
          </div>
        )}
      </div>
    </div>
  );
}

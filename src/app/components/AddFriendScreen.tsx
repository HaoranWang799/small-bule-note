import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { ArrowLeft, UserPlus } from "lucide-react";

export function AddFriendScreen() {
  const navigate = useNavigate();
  const addFriend = useAppStore((s) => s.addFriend);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAdd = () => {
    if (!username.trim()) {
      setMessage({ type: "error", text: "请输入用户名" });
      return;
    }
    const success = addFriend(username.trim());
    if (success) {
      setMessage({ type: "success", text: `已成功添加 ${username} 为好友` });
      setUsername("");
    } else {
      setMessage({ type: "error", text: "该用户已在你的通讯录中" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center h-12 px-4 border-b border-[#E5E5E5]">
        <button onClick={() => navigate(-1)} className="p-1 text-[#111]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center text-[17px] text-[#111] pr-7">添加好友</span>
      </div>

      <div className="px-6 pt-10">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#f0faf4] flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-[#07C160]" />
          </div>
        </div>

        <input
          placeholder="输入对方的用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] placeholder-[#999] outline-none focus:border-[#07C160] mb-4"
        />

        {message && (
          <p className={`text-[13px] mb-4 ${message.type === "success" ? "text-[#07C160]" : "text-[#ee0a24]"}`}>
            {message.text}
          </p>
        )}

        <button
          onClick={handleAdd}
          className="w-full h-12 rounded-lg bg-[#07C160] text-white hover:bg-[#06ae56] active:bg-[#059e4e] transition-colors"
        >
          添加好友
        </button>

        <p className="text-center text-[12px] text-[#bbb] mt-8">POST /contacts/add</p>
      </div>
    </div>
  );
}

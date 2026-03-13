import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { ArrowLeft, Camera } from "lucide-react";

export function EditProfileScreen() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const [username, setUsername] = useState(currentUser?.username || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({ username, email });
    setSaved(true);
    setTimeout(() => navigate(-1), 800);
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center h-12 px-4 border-b border-[#E5E5E5]">
        <button onClick={() => navigate(-1)} className="p-1 text-[#111]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="flex-1 text-center text-[17px] text-[#111] pr-7">编辑资料</span>
      </div>

      <div className="px-6 pt-8">
        {/* Avatar section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar name={username || currentUser.username} size="lg" />
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#07C160] flex items-center justify-center border-2 border-white">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] text-[#999] mb-1 block">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] outline-none focus:border-[#07C160]"
            />
          </div>
          <div>
            <label className="text-[13px] text-[#999] mb-1 block">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] outline-none focus:border-[#07C160]"
            />
          </div>

          {saved && <p className="text-[13px] text-[#07C160]">保存成功！</p>}

          <button
            onClick={handleSave}
            className="w-full h-12 rounded-lg bg-[#07C160] text-white hover:bg-[#06ae56] active:bg-[#059e4e] transition-colors mt-2"
          >
            保存
          </button>
        </div>

        <p className="text-center text-[12px] text-[#bbb] mt-8">PATCH /users/profile</p>
      </div>
    </div>
  );
}

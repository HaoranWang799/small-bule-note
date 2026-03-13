import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { Avatar } from "./Avatar";
import { ChevronRight, LogOut, Edit, Shield, Bell, CircleHelp } from "lucide-react";

export function ProfileScreen() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const socketStatus = useAppStore((s) => s.socketStatus);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!currentUser) return null;

  const menuItems = [
    { icon: Edit, label: "编辑资料", action: () => navigate("/edit-profile") },
    { icon: Bell, label: "通知设置", action: () => {} },
    { icon: Shield, label: "隐私与安全", action: () => {} },
    { icon: CircleHelp, label: "帮助与反馈", action: () => {} },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Profile card */}
      <div className="bg-white px-4 pt-8 pb-6 mb-2">
        <div className="flex items-center">
          <Avatar name={currentUser.username} size="lg" />
          <div className="ml-4 flex-1">
            <h2 className="text-[20px] text-[#111]">{currentUser.username}</h2>
            <p className="text-[14px] text-[#999] mt-0.5">{currentUser.email}</p>
            <p className="text-[12px] text-[#999] mt-1">资料状态：{currentUser.status}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${socketStatus === "connected" ? "bg-[#2ECC71]" : "bg-[#BDC3C7]"}`} />
              <span className="text-[12px] text-[#999]">
                {socketStatus === "connected"
                  ? "WebSocket 已连接"
                  : socketStatus === "connecting"
                    ? "WebSocket 连接中"
                    : "未连接"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white mb-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex items-center w-full px-4 py-3.5 hover:bg-[#f9f9f9] active:bg-[#f0f0f0] transition-colors text-left border-b border-[#F5F5F5] last:border-0"
            >
              <Icon className="w-5 h-5 text-[#666] mr-3" />
              <span className="flex-1 text-[15px] text-[#111]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#ccc]" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="bg-white mt-auto mb-0">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full py-3.5 text-[#ee0a24] hover:bg-[#fff5f5] active:bg-[#ffecec] transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </button>
      </div>
    </div>
  );
}

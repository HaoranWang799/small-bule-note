import { MessageCircle, Users, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const tabs = [
  { path: "/chats", label: "消息", icon: MessageCircle },
  { path: "/contacts", label: "通讯录", icon: Users },
  { path: "/profile", label: "我", icon: User },
];

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-around bg-white border-t border-[#E5E5E5] h-[52px] shrink-0">
      {tabs.map((tab) => {
        const active = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 flex-1 py-1 ${
              active ? "text-[#07C160]" : "text-[#999]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

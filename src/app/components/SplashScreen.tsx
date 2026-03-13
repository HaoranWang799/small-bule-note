import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "../store";
import { MessageCircle } from "lucide-react";

export function SplashScreen() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(isAuthenticated ? "/chats" : "/login", { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <div className="w-20 h-20 rounded-2xl bg-[#07C160] flex items-center justify-center mb-4">
        <MessageCircle className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-[22px] text-[#111] tracking-wide">IM Messenger</h1>
      <p className="text-[13px] text-[#999] mt-1">即时通讯，随时随地</p>
    </div>
  );
}

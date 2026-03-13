import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useAppStore } from "./store";
import { Toaster, toast } from "sonner";

export default function App() {
  const initializeAuth = useAppStore((s) => s.initializeAuth);
  const incomingAlert = useAppStore((s) => s.incomingAlert);
  const consumeIncomingAlert = useAppStore((s) => s.consumeIncomingAlert);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (incomingAlert) {
      toast(`来自 ${incomingAlert.fromUsername} 的新消息`, {
        description: incomingAlert.content,
      });
      consumeIncomingAlert();
    }
  }, [consumeIncomingAlert, incomingAlert]);

  return (
    <div className="size-full flex items-center justify-center bg-[#e8e8e8]">
      {/* Mobile phone frame */}
      <div className="w-[390px] h-[844px] max-h-[100dvh] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#d4d4d4] flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 h-11 bg-[#F5F5F5] shrink-0">
          <span className="text-[13px] text-[#111]">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#111" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#111" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#111" />
              <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#111" opacity="0.3" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <path d="M7.5 3.5C9.16 3.5 10.66 4.18 11.74 5.26L13 4C11.57 2.57 9.63 1.7 7.5 1.7C5.37 1.7 3.43 2.57 2 4L3.26 5.26C4.34 4.18 5.84 3.5 7.5 3.5Z" fill="#111" />
              <path d="M7.5 6.5C8.53 6.5 9.47 6.89 10.17 7.54L11.45 6.26C10.4 5.26 9.03 4.7 7.5 4.7C5.97 4.7 4.6 5.26 3.55 6.26L4.83 7.54C5.53 6.89 6.47 6.5 7.5 6.5Z" fill="#111" />
              <circle cx="7.5" cy="9.5" r="1.5" fill="#111" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0" y="1" width="22" height="10" rx="2" stroke="#111" strokeWidth="1" />
              <rect x="1.5" y="2.5" width="14" height="7" rx="1" fill="#07C160" />
              <rect x="23" y="4" width="2" height="4" rx="1" fill="#111" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* App content */}
        <div className="flex-1 overflow-hidden">
          <RouterProvider router={router} />
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}

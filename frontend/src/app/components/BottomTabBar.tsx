import { Link, useLocation } from 'react-router';
import { MessageSquare, Users, User } from 'lucide-react';
import { useAppStore } from '../store';

export function BottomTabBar() {
  const location = useLocation();
  const unreadCounts = useAppStore((s) => s.unreadCounts);
  const pendingRequests = useAppStore((s) => s.pendingRequests);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const totalPending = pendingRequests.length;

  const tabs = [
    {
      id: 'chats',
      path: '/',
      label: 'Chats',
      icon: MessageSquare,
      badge: totalUnread,
    },
    {
      id: 'contacts',
      path: '/contacts',
      label: 'Contacts',
      icon: Users,
      badge: totalPending,
    },
    {
      id: 'profile',
      path: '/profile',
      label: 'Me',
      icon: User,
      badge: 0,
    },
  ];

  return (
    <div className="bg-[#FFFFFF] border-t border-[#E5E5E5] flex flex-row items-center justify-around h-[56px] pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.02)] z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className="flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform relative"
          >
            <div className="relative">
              <tab.icon
                className={`w-[26px] h-[26px] ${
                  isActive ? 'text-[#07C160]' : 'text-[#8A8A8A]'
                } transition-colors duration-200`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {tab.badge > 0 && (
                <div className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#FFFFFF] shadow-sm">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </div>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 font-medium ${
                isActive ? 'text-[#07C160]' : 'text-[#8A8A8A]'
              } transition-colors duration-200`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

import { useAppStore } from '../store';
import { Avatar } from './Avatar';
import { LogOut, ChevronRight } from 'lucide-react';

export function ProfileScreen() {
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-full bg-[#E5E5E5] relative">
      <div className="flex-1 overflow-y-auto">
        <div className="bg-[#FFFFFF] pt-12 pb-8 px-6 mb-2 rounded-b-2xl shadow-sm">
          <div className="flex items-center">
            <div className="w-16 h-16">
              <Avatar name={currentUser.username} size="lg" />
            </div>
            <div className="ml-5 flex-1 min-w-0">
              <h1 className="text-[22px] font-bold text-[#1F1F1F] truncate">{currentUser.username}</h1>
              <p className="text-[14px] text-[#8A8A8A] mt-1 truncate">ID: {currentUser.id}</p>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-2">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-sm overflow-hidden">
             <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors border-b border-[#F0F0F0] last:border-b-0">
                <span className="text-[16px] text-[#1F1F1F]">Settings</span>
                <ChevronRight className="w-5 h-5 text-[#8A8A8A]" />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors border-b border-[#F0F0F0] last:border-b-0">
                <span className="text-[16px] text-[#1F1F1F]">About</span>
                <ChevronRight className="w-5 h-5 text-[#8A8A8A]" />
             </button>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl shadow-sm overflow-hidden mt-6">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-4 py-4 text-[#FF3B30] hover:bg-[#F8F8F8] active:bg-[#F0F0F0] transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span className="text-[16px] font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

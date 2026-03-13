import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import { BottomTabBar } from "./BottomTabBar";
import { useAppStore } from "../store";

export function TabLayout() {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isInitializing = useAppStore((s) => s.isInitializing);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  if (!isAuthenticated) {
    return <div className="h-full bg-white" />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomTabBar />
    </div>
  );
}

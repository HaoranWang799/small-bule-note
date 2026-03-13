import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { BottomTabBar } from "./BottomTabBar";
import { useAppStore } from "../store";

export function TabLayout() {
  const initializeAuth = useAppStore((s) => s.initializeAuth);
  const hasInitialized = useAppStore((s) => s.hasInitialized);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!hasInitialized) {
      void initializeAuth();
    }
  }, [hasInitialized, initializeAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
